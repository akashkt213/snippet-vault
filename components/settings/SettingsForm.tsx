"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Palette, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  normalizeUserPreferencesFromStorage,
  type UserPreferences,
} from "@/lib/validators/userPreferences";

type PreferencesApiResponse = {
  data: Record<string, unknown> | null;
};

const THEME_OPTIONS: { value: UserPreferences["theme"]; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const DENSITY_OPTIONS: {
  value: UserPreferences["accentDensity"];
  label: string;
}[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

const TAB_SIZE_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;

/** Shadcn tokens assume light UI; dashboard is dark — force readable trigger and menu text. */
const settingsSelectTriggerClass =
  "border-border-base bg-surface-default font-mono text-xs text-ink-primary data-placeholder:text-ink-muted [&_[data-slot=select-value]]:text-ink-primary [&_[data-slot=select-value]]:opacity-100";

const settingsSelectContentClass =
  "border border-border-base bg-surface-raised text-ink-primary shadow-lg";

const settingsSelectItemClass =
  "text-ink-primary focus:bg-purple-950 focus:text-purple-300 data-[highlighted]:bg-purple-950 data-[highlighted]:text-purple-300 data-[state=checked]:bg-purple-950/80 data-[state=checked]:text-purple-300";

function ToggleRow(props: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[#f4f4f5]">{props.label}</p>
        <p className="text-xs text-ink-muted">{props.description}</p>
      </div>
      <div className="flex shrink-0 gap-1 rounded-lg border border-border-base bg-surface-default p-0.5">
        <button
          type="button"
          disabled={props.disabled}
          onClick={() => props.onChange(true)}
          className={cn(
            "rounded-md px-3 py-1 text-[11px] font-mono uppercase tracking-[0.06em] transition-colors",
            props.checked
              ? "bg-purple-950 text-purple-300"
              : "text-[#555555] hover:text-ink-secondary",
          )}
        >
          On
        </button>
        <button
          type="button"
          disabled={props.disabled}
          onClick={() => props.onChange(false)}
          className={cn(
            "rounded-md px-3 py-1 text-[11px] font-mono uppercase tracking-[0.06em] transition-colors",
            !props.checked
              ? "bg-purple-950 text-purple-300"
              : "text-[#555555] hover:text-ink-secondary",
          )}
        >
          Off
        </button>
      </div>
    </div>
  );
}

type SettingsFormProps = {
  initialPreferences: UserPreferences;
};

export default function SettingsForm({
  initialPreferences,
}: SettingsFormProps) {
  const queryClient = useQueryClient();
  const [baseline, setBaseline] = useState(initialPreferences);
  const [draft, setDraft] = useState(initialPreferences);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (body: UserPreferences) => {
      const json = await apiClient.patch<PreferencesApiResponse>(
        "/api/user/preferences",
        body,
      );
      return normalizeUserPreferencesFromStorage(json.data);
    },
    onSuccess: (next) => {
      setSaveError(null);
      setBaseline(next);
      setDraft(next);
      queryClient.setQueryData(["user-preferences"], next);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setSaveError(err.message);
        return;
      }
      setSaveError("Something went wrong while saving.");
    },
  });

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  const handleReset = () => {
    setDraft(baseline);
    setSaveError(null);
  };

  const handleSave = () => {
    const clamped: UserPreferences = {
      ...draft,
      editorFontSize: Math.min(
        20,
        Math.max(11, Math.round(draft.editorFontSize)),
      ),
      tabSize: Math.min(8, Math.max(2, Math.round(draft.tabSize))),
    };
    setDraft(clamped);
    mutation.mutate(clamped);
  };

  const disabledControls = mutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink-muted">
          Settings
        </h1>
        <p className="text-2xl font-semibold text-[#f4f4f5]">Preferences</p>
        <p className="text-sm text-ink-muted">
          These values are stored on your account and used across the app.
        </p>
      </div>

      <Card className="border-border-subtle bg-surface-shell ring-0">
        <CardHeader className="border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3d2f6e] bg-purple-950">
              <Palette size={16} className="text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.08em] text-purple-300">
                Appearance
              </CardTitle>
              <CardDescription className="text-xs text-ink-muted">
                Theme and layout density.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Theme
            </label>
            <Select
              value={draft.theme}
              disabled={disabledControls}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  theme: value as UserPreferences["theme"],
                }))
              }
            >
              <SelectTrigger
                className={cn("w-full", settingsSelectTriggerClass)}
              >
                <SelectValue
                  placeholder="Theme"
                  className="text-ink-primary [&_span]:text-ink-primary"
                />
              </SelectTrigger>
              <SelectContent className={settingsSelectContentClass}>
                {THEME_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className={settingsSelectItemClass}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Accent density
            </label>
            <Select
              value={draft.accentDensity}
              disabled={disabledControls}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  accentDensity: value as UserPreferences["accentDensity"],
                }))
              }
            >
              <SelectTrigger
                className={cn("w-full", settingsSelectTriggerClass)}
              >
                <SelectValue
                  placeholder="Density"
                  className="text-ink-primary [&_span]:text-ink-primary"
                />
              </SelectTrigger>
              <SelectContent className={settingsSelectContentClass}>
                {DENSITY_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className={settingsSelectItemClass}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-subtle bg-surface-shell ring-0">
        <CardHeader className="border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-base bg-surface-default">
              <Type size={16} className="text-[#888888]" />
            </div>
            <div>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.08em] text-purple-300">
                Editor
              </CardTitle>
              <CardDescription className="text-xs text-ink-muted">
                Defaults for viewing and editing code.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editor-font-size"
              className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted"
            >
              Font size (px)
            </label>
            <Input
              id="editor-font-size"
              type="number"
              min={11}
              max={20}
              disabled={disabledControls}
              value={draft.editorFontSize}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isNaN(n)) return;
                setDraft((prev) => ({ ...prev, editorFontSize: n }));
              }}
              className="max-w-[120px] border-border-base bg-surface-default font-mono text-xs text-ink-primary caret-purple-400 placeholder:text-ink-muted selection:bg-purple-950 selection:text-purple-200"
            />
            <p className="text-[11px] text-ink-muted">Allowed range: 11–20.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Tab size (spaces)
            </label>
            <Select
              value={String(draft.tabSize)}
              disabled={disabledControls}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  tabSize: Number.parseInt(value, 10),
                }))
              }
            >
              <SelectTrigger
                className={cn("w-full max-w-[120px]", settingsSelectTriggerClass)}
              >
                <SelectValue
                  placeholder="Tab size"
                  className="text-ink-primary [&_span]:text-ink-primary"
                />
              </SelectTrigger>
              <SelectContent className={settingsSelectContentClass}>
                {TAB_SIZE_OPTIONS.map((n) => (
                  <SelectItem
                    key={n}
                    value={String(n)}
                    className={settingsSelectItemClass}
                  >
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ToggleRow
            label="Word wrap"
            description="Wrap long lines instead of horizontal scrolling."
            checked={draft.wordWrap}
            disabled={disabledControls}
            onChange={(wordWrap) =>
              setDraft((prev) => ({ ...prev, wordWrap }))
            }
          />

          <ToggleRow
            label="Line numbers"
            description="Show gutter line numbers in the editor."
            checked={draft.showLineNumbers}
            disabled={disabledControls}
            onChange={(showLineNumbers) =>
              setDraft((prev) => ({ ...prev, showLineNumbers }))
            }
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-shell px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            className="font-mono text-xs uppercase tracking-[0.06em]"
            disabled={!isDirty || mutation.isPending}
            onClick={() => void handleSave()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs uppercase tracking-[0.06em]"
            disabled={!isDirty || mutation.isPending}
            onClick={handleReset}
          >
            Reset
          </Button>
          {mutation.isSuccess && !isDirty && !saveError ? (
            <span className="text-xs font-mono text-emerald-400/90">
              All changes saved.
            </span>
          ) : null}
        </div>
        {saveError ? (
          <p className="text-xs text-red-400">{saveError}</p>
        ) : null}
      </div>
    </div>
  );
}
