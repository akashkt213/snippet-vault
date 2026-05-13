import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink-muted">
          Account
        </h1>
        <div className="h-8 w-44 rounded-lg bg-border-subtle animate-pulse" />
      </div>

      <Card className="border-border-subtle bg-surface-shell ring-0">
        <CardHeader className="border-b border-border-subtle">
          <CardTitle className="text-sm font-mono uppercase tracking-[0.08em] text-purple-300">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3d2f6e] bg-purple-950">
              <div className="size-4 rounded bg-border-subtle animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 rounded bg-border-subtle animate-pulse" />
              <div className="mt-2 h-4 w-40 rounded bg-border-subtle animate-pulse" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-base bg-surface-default">
              <div className="size-4 rounded bg-border-subtle animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-3 w-14 rounded bg-border-subtle animate-pulse" />
              <div className="mt-2 h-4 w-56 rounded bg-border-subtle animate-pulse" />
            </div>
          </div>

          <div>
            <div className="h-3 w-24 rounded bg-border-subtle animate-pulse" />
            <div className="mt-2 h-4 w-28 rounded bg-border-subtle animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface-shell px-4 py-4">
        <div>
          <div className="h-4 w-20 rounded bg-border-subtle animate-pulse" />
          <div className="mt-2 h-3 w-56 rounded bg-border-subtle animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-border-subtle animate-pulse" />
      </div>
    </div>
  );
}