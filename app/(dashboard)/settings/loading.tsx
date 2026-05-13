import { Palette, Type } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink-muted">
          Settings
        </h1>
        <p className="text-2xl font-semibold text-ink-primary">Preferences</p>
        <div className="h-4 w-full max-w-lg rounded bg-border-subtle animate-pulse" />
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
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Theme
            </span>
            <div className="h-8 w-full rounded-lg bg-border-subtle animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Accent density
            </span>
            <div className="h-8 w-full rounded-lg bg-border-subtle animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-subtle bg-surface-shell ring-0">
        <CardHeader className="border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-base bg-surface-default">
              <Type size={16} className="text-ink-muted" />
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
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Font size (px)
            </span>
            <div className="h-8 w-[120px] max-w-full rounded-lg bg-border-subtle animate-pulse" />
            <div className="h-3 w-40 rounded bg-border-subtle/80 animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Tab size (spaces)
            </span>
            <div className="h-8 w-[120px] max-w-full rounded-lg bg-border-subtle animate-pulse" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="h-4 w-28 rounded bg-border-subtle animate-pulse" />
              <div className="h-3 w-56 max-w-full rounded bg-border-subtle/80 animate-pulse" />
            </div>
            <div className="flex h-8 w-22 shrink-0 gap-1 rounded-lg border border-border-base bg-surface-default p-0.5">
              <div className="flex-1 rounded-md bg-border-subtle animate-pulse" />
              <div className="flex-1 rounded-md bg-border-subtle/60 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="h-4 w-32 rounded bg-border-subtle animate-pulse" />
              <div className="h-3 w-52 max-w-full rounded bg-border-subtle/80 animate-pulse" />
            </div>
            <div className="flex h-8 w-22 shrink-0 gap-1 rounded-lg border border-border-base bg-surface-default p-0.5">
              <div className="flex-1 rounded-md bg-border-subtle animate-pulse" />
              <div className="flex-1 rounded-md bg-border-subtle/60 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-shell px-4 py-4">
        <div className="h-8 w-28 rounded-lg bg-border-subtle animate-pulse" />
        <div className="h-8 w-20 rounded-lg bg-border-subtle/80 animate-pulse" />
      </div>
    </div>
  );
}
