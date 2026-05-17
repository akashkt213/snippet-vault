"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiClient } from "@/lib/api/client";
import { fetchUserPreferences } from "@/lib/api/userPreferencesClient";
import { resolveAppTheme } from "@/lib/userPreferences/resolveAppTheme";
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

/** SSR / hydration fallback: assume dark OS preference. */
function getServerPrefersDarkSnapshot() {
  return true;
}

export type UserPreferencesContextValue = {
  preferences: UserPreferences;
  isLoading: boolean;
  isError: boolean;
  /** Resolved UI + CodeMirror theme (`system` uses OS preference). */
  resolvedTheme: "light" | "dark";
  setAppTheme: (theme: "light" | "dark") => void;
  isSavingTheme: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(
  null,
);

const FALLBACK_PREFERENCES: UserPreferences = {
  ...userPreferencesSchema.parse({}),
  theme: "dark",
};

async function fetchPreferencesOrFallback(): Promise<UserPreferences> {
  try {
    return await fetchUserPreferences();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      return FALLBACK_PREFERENCES;
    }
    throw e;
  }
}

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
    queryFn: fetchPreferencesOrFallback,
    staleTime: 30_000,
    retry: 1,
  });

  const preferences = data ?? FALLBACK_PREFERENCES;

  const resolvedTheme = useMemo(
    () => resolveAppTheme(preferences.theme, prefersDark),
    [preferences.theme, prefersDark],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [resolvedTheme]);

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
      queryClient.setQueryData(
        ["user-preferences"],
        context?.previous ?? FALLBACK_PREFERENCES,
      );
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["user-preferences"], next);
    },
  });

  const setAppTheme = useCallback(
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
      resolvedTheme,
      setAppTheme,
      isSavingTheme: patchMutation.isPending,
    }),
    [
      preferences,
      isLoading,
      isError,
      resolvedTheme,
      setAppTheme,
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
      resolvedTheme: resolveAppTheme(FALLBACK_PREFERENCES.theme, prefersDark),
      setAppTheme: () => {},
      isSavingTheme: false,
    };
  }
  return ctx;
}
