import { useMemo } from "react";

import { useHelpDialog } from "@/lib/store/help-dialog";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "../ui/dialog";
import { cn } from "@/lib/utils";

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 items-center justify-center rounded-md border border-border-base bg-surface-raised px-2 font-mono text-[11px] text-ink-secondary",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export default function HelpDialog() {
  const { isOpen, setIsOpen } = useHelpDialog();

  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return navigator.platform.toLowerCase().includes("mac");
  }, []);

  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="border-border-base bg-surface-shell sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-[12px] uppercase tracking-[0.12em] text-purple-300">
            Help & Shortcuts
          </DialogTitle>
          <DialogDescription className="text-ink-muted">
            SnippetVault helps you save, organize, and quickly find reusable code.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <section className="rounded-xl border border-border-base bg-surface-default p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-muted">
              Quick tips
            </p>
            <ul className="mt-2 grid gap-1.5 text-[13px] text-ink-secondary">
              <li>
                Use <Kbd className="mx-1">{modKey}</Kbd>+<Kbd className="ml-1">K</Kbd> to open the command
                palette.
              </li>
              <li>Star snippets to pin them in Favorites.</li>
              <li>Create collections to group related snippets.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border-base bg-surface-default p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-muted">
              Keyboard shortcuts
            </p>

            <div className="mt-2 grid gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] text-ink-secondary">Command palette</span>
                <span className="flex items-center gap-1">
                  <Kbd>{modKey}</Kbd>
                  <span className="text-ink-muted">+</span>
                  <Kbd>K</Kbd>
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] text-ink-secondary">New snippet</span>
                <span className="flex items-center gap-1">
                  <Kbd>{modKey}</Kbd>
                  <span className="text-ink-muted">+</span>
                  <Kbd>N</Kbd>
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] text-ink-secondary">Focus search</span>
                <span className="flex items-center gap-1">
                  <Kbd>/</Kbd>
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[13px] text-ink-secondary">Close dialogs</span>
                <span className="flex items-center gap-1">
                  <Kbd>Esc</Kbd>
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-ink-muted">
              Tip: You can always use the command palette to navigate quickly.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}