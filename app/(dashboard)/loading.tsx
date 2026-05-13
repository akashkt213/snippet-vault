export default function DashboardLoading() {
  const items = Array.from({ length: 9 });
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="h-6 w-48 rounded bg-border-subtle animate-pulse" />
            <div className="h-4 w-80 rounded bg-border-subtle animate-pulse" />
          </div>
          <div className="h-9 w-36 rounded-lg bg-border-subtle animate-pulse" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border-base bg-surface-shell overflow-hidden"
            >
              {/* Card header row */}
              <div className="flex items-start justify-between gap-3 px-4 pt-4">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 rounded bg-border-subtle animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-border-subtle animate-pulse" />
                </div>
                <div className="h-5 w-14 rounded-md bg-border-subtle animate-pulse" />
              </div>

              {/* Code block preview */}
              <div className="mt-4 px-4">
                <div className="h-28 w-full rounded-lg bg-surface-default border border-border-base overflow-hidden">
                  <div className="px-3 py-2">
                    <div className="h-3 w-11/12 rounded bg-border-subtle animate-pulse" />
                    <div className="mt-2 h-3 w-10/12 rounded bg-border-subtle animate-pulse" />
                    <div className="mt-2 h-3 w-9/12 rounded bg-border-subtle animate-pulse" />
                    <div className="mt-2 h-3 w-8/12 rounded bg-border-subtle animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Bottom row (tags + actions) */}
              <div className="mt-4 flex items-center justify-between gap-3 px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  <div className="h-5 w-14 rounded-md bg-border-subtle animate-pulse" />
                  <div className="h-5 w-12 rounded-md bg-border-subtle animate-pulse" />
                  <div className="h-5 w-18 rounded-md bg-border-subtle animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-16 rounded-md bg-border-subtle animate-pulse" />
                  <div className="h-7 w-7 rounded-md bg-border-subtle animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

