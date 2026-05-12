"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Code2,
  FolderOpen,
  Star,
  UserRound,
} from "lucide-react";

import type { AuthenticatedUser } from "@/lib/auth/session";
import { getUserLabel } from "@/lib/auth/user";

const NAV_ITEMS = [
  { label: "All Snippets", href: "/dashboard",             icon: Code2      },
  { label: "Collections",  href: "/collections", icon: FolderOpen },
  { label: "Favorites",    href: "/favorites",   icon: Star       },
];

type SidebarProps = {
  user: AuthenticatedUser;
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="w-52.5 min-w-52.5 h-screen sticky top-0 flex flex-col bg-surface-shell border-r border-border-subtle">

      {/* ── Logo ───────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4.5 py-5">
        {/* Icon box */}
        <div className="w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg bg-purple-950 border border-[#3d2f6e]">
          <Code2 size={16} className="text-purple-400" />
        </div>

        <div className="flex flex-col gap-px">
          <span className="text-[11px] font-bold text-purple-300 tracking-[0.08em] uppercase font-mono">
            SnippetVault
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border-subtle" />

      {/* ── Main nav ───────────────────────────── */}
      <nav className="flex flex-col gap-px p-2.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                // base
                "flex items-center gap-2.5 px-2.5 py-1.75 rounded-md",
                "text-ink-muted no-underline",
                "transition-colors duration-120 ease-in-out",
                // states
                active
                  ? "bg-purple-950 text-purple-300"
                  : "hover:bg-[#161616] hover:text-ink-secondary"
              )}
            >
              <Icon size={15} className="shrink-0 text-inherit" />

              <span className="flex-1 text-[11px] font-medium tracking-[0.04em] uppercase font-mono">
                {label}
              </span>

              {active && (
                <ChevronRight size={12} className="text-purple-600 opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Push bottom items down */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="h-px bg-border-subtle" />

      {/* ── Bottom nav ─────────────────────────── */}
      <nav className="flex flex-col gap-px p-2.5 pb-3.5">
        <Link
          href="/user"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.75 rounded-md",
            "text-ink-muted no-underline",
            "transition-colors duration-120 ease-in-out",
            pathname.startsWith("/user")
              ? "bg-purple-950 text-purple-300"
              : "hover:bg-[#161616] hover:text-ink-secondary",
          )}
        >
          <UserRound size={15} className="shrink-0 text-inherit" />
          <span className="flex-1 truncate text-[11px] font-medium tracking-[0.04em] uppercase font-mono">
            {getUserLabel(user)}
          </span>
          {pathname.startsWith("/user") && (
            <ChevronRight size={12} className="text-purple-600 opacity-80" />
          )}
        </Link>
      </nav>

    </aside>
  );
}