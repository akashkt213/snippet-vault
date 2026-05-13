"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { fetchUserPreferences } from "@/lib/api/userPreferencesClient";
import { resolveCodeMirrorTheme } from "@/lib/userPreferences/resolveCodeMirrorTheme";
import {
  normalizeUserPreferencesFromStorage,
  userPreferencesSchema,
  type UpdateUserPreferencesInput,
  type UserPreferences,
} from "@/lib/validators/userPreferences";

type PreferencesApiResponse = {
  data: unknown;
};

function subscribePrefersDark(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getPrefersDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** SSR / hydration fallback: match app chrome (dark). */
function getServerPrefersDarkSnapshot() {
  return true;
}

export type UserPreferencesContextValue = {
  preferences: UserPreferences;
  isLoading: boolean;
  isError: boolean;
  /** Resolved light/dark for CodeMirror (includes `system` → OS). */
  resolvedCodeMirrorTheme: "light" | "dark";
  setCodeMirrorTheme: (theme: "light" | "dark") => void;
  isSavingTheme: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(
  null,
);

const FALLBACK_PREFERENCES: UserPreferences = {
  ...userPreferencesSchema.parse({}),
  theme: "dark",
};

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const prefersDark = useSyncExternalStore(
    subscribePrefersDark,
    getPrefersDarkSnapshot,
    getServerPrefersDarkSnapshot,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: fetchUserPreferences,
    staleTime: 30_000,
    retry: 1,
  });

  const preferences = data ?? FALLBACK_PREFERENCES;

  const resolvedCodeMirrorTheme = useMemo(
    () => resolveCodeMirrorTheme(preferences.theme, prefersDark),
    [preferences.theme, prefersDark],
  );

  const patchMutation = useMutation({
    mutationFn: async (body: UpdateUserPreferencesInput) => {
      const json = await apiClient.patch<PreferencesApiResponse>(
        "/api/user/preferences",
        body,
      );
      return normalizeUserPreferencesFromStorage(json.data);
    },
    onMutate: async (partial) => {
      await queryClient.cancelQueries({ queryKey: ["user-preferences"] });
      const previous = queryClient.getQueryData<UserPreferences>([
        "user-preferences",
      ]);
      const base = previous ?? FALLBACK_PREFERENCES;
      queryClient.setQueryData<UserPreferences>(["user-preferences"], {
        ...base,
        ...partial,
      });
      return { previous };
    },
    onError: (_err, _partial, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["user-preferences"], context.previous);
      } else {
        void queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
      }
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["user-preferences"], next);
    },
  });

  const setCodeMirrorTheme = useCallback(
    (theme: "light" | "dark") => {
      if (preferences.theme === theme) return;
      patchMutation.mutate({ theme });
    },
    [preferences.theme, patchMutation],
  );

  const value = useMemo<UserPreferencesContextValue>(
    () => ({
      preferences,
      isLoading,
      isError,
      resolvedCodeMirrorTheme,
      setCodeMirrorTheme,
      isSavingTheme: patchMutation.isPending,
    }),
    [
      preferences,
      isLoading,
      isError,
      resolvedCodeMirrorTheme,
      setCodeMirrorTheme,
      patchMutation.isPending,
    ],
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextValue {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    const prefersDark =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : true;
    return {
      preferences: FALLBACK_PREFERENCES,
      isLoading: false,
      isError: false,
      resolvedCodeMirrorTheme: resolveCodeMirrorTheme(
        FALLBACK_PREFERENCES.theme,
        prefersDark,
      ),
      setCodeMirrorTheme: () => {},
      isSavingTheme: false,
    };
  }
  return ctx;
}
