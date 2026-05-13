import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AuthLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center px-6 py-10">
      <Card className="w-full max-w-md border-border-base bg-surface-shell text-ink-primary shadow-none ring-0">
        <CardHeader className="space-y-4 border-b border-border-subtle pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-[#3d2f6e] bg-purple-950">
              <div className="size-4 rounded bg-border-subtle animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-28 rounded bg-border-subtle animate-pulse" />
              <div className="mt-2 h-4 w-56 rounded bg-border-subtle animate-pulse" />
            </div>
          </div>

          <div className="h-6 w-44 rounded bg-border-subtle animate-pulse" />
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-border-subtle animate-pulse" />
              <div className="h-9 w-full rounded-lg border border-border-base bg-surface-default animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-border-subtle animate-pulse" />
              <div className="h-9 w-full rounded-lg border border-border-base bg-surface-default animate-pulse" />
            </div>

            <div className="pt-2">
              <div className="h-9 w-full rounded-lg bg-border-subtle animate-pulse" />
            </div>

            <div className="pt-2">
              <div className="mx-auto h-4 w-56 rounded bg-border-subtle animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

