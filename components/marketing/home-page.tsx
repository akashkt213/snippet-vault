import Link from "next/link";
import {
  Code2,
  FolderOpen,
  Search,
  Star,
  Sparkles,
  Tags,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthenticatedUser } from "@/lib/auth/session";

const FEATURES = [
  {
    icon: Code2,
    title: "Keep your code in one place",
    description:
      "Save snippets with syntax highlighting, language detection, and a focused editor—no scattered gists or notes.",
  },
  {
    icon: FolderOpen,
    title: "Create collections of similar code",
    description:
      "Group related snippets into collections so hooks, utilities, and configs stay organized and easy to find.",
  },
  {
    icon: Star,
    title: "Mark code as favourite",
    description:
      "Star the snippets you reach for most and open them instantly from your favourites view.",
  },
  {
    icon: Search,
    title: "Search by title, tags, or language",
    description:
      "Find anything quickly with fuzzy search across titles, tags, and languages from the global navbar.",
  },
] as const;

type HomePageProps = {
  user: AuthenticatedUser | null;
};

function MarketingNavbar({ user }: { user: AuthenticatedUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-shell/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg border border-[#3d2f6e] bg-purple-950">
            <Code2 size={16} className="text-purple-400" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.08em] text-purple-300 uppercase font-mono">
            SnippetVault
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <Button
              asChild
              className="h-8 border border-[#3d2f6e] bg-purple-950 text-purple-300 font-mono text-[12px] hover:bg-[#2a1a4a] hover:text-[#ddd6fe]"
            >
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-8 font-mono text-[12px] text-ink-secondary hover:text-ink-primary hover:bg-surface-raised"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="h-8 border border-[#3d2f6e] bg-purple-950 text-purple-300 font-mono text-[12px] hover:bg-[#2a1a4a] hover:text-[#ddd6fe]"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: (typeof FEATURES)[number]) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-base bg-surface-default p-5",
        "transition-colors hover:border-border-hover hover:bg-surface-raised",
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-lg border border-[#3d2f6e] bg-purple-950">
        <Icon size={16} className="text-purple-400" />
      </div>
      <h3 className="text-[13px] font-semibold text-ink-primary font-mono">
        {title}
      </h3>
      <p className="text-[12px] leading-relaxed text-ink-muted font-mono">
        {description}
      </p>
    </article>
  );
}

export function HomePage({ user }: HomePageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-base">
      <MarketingNavbar user={user} />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border-subtle">
          <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#3d2f6e] bg-purple-950 px-3 py-1 text-[10px] font-mono text-purple-300">
              <Sparkles size={11} className="text-purple-400" />
              Your personal snippet library
            </p>
            <h1 className="max-w-2xl text-[28px] font-semibold leading-tight tracking-tight text-ink-primary font-mono md:text-[36px]">
              Store, organize, and find code snippets fast
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-secondary font-mono">
              SnippetVault helps developers keep reusable code handy—grouped in
              collections, searchable by tags, and one click away from your
              favourites.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Button
                  asChild
                  size="lg"
                  className="h-10 border border-[#3d2f6e] bg-purple-950 px-5 text-purple-300 font-mono hover:bg-[#2a1a4a]"
                >
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-10 border border-[#3d2f6e] bg-purple-950 px-5 text-purple-300 font-mono hover:bg-[#2a1a4a]"
                  >
                    <Link href="/signup">Get started free</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-10 border-border-base bg-transparent px-5 font-mono text-ink-secondary hover:border-border-hover hover:bg-surface-raised hover:text-ink-primary"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-5 py-14 md:py-20">
          <div className="mb-10">
            <h2 className="text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase font-mono">
              What you can do
            </h2>
            <p className="mt-2 text-[18px] font-semibold text-ink-primary font-mono">
              Everything you need to manage snippets
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div
            className={cn(
              "mt-10 flex flex-wrap items-center gap-6 rounded-xl border border-border-base",
              "bg-surface-shell px-5 py-4 text-[12px] font-mono text-ink-muted",
            )}
          >
            <span className="flex items-center gap-2">
              <Tags size={14} className="text-purple-400" />
              Tag snippets for quick filtering
            </span>
            <span className="hidden h-4 w-px bg-border-base sm:block" />
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400" />
              Auto-detect language on paste
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-6">
        <p className="text-center text-[11px] text-ink-muted font-mono">
          SnippetVault — built for developers who reuse code every day
        </p>
      </footer>
    </div>
  );
}
