"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronRight,
  Code2,
  FolderOpen,
  LogOut,
  Star,
} from "lucide-react";

import { apiClient } from "@/lib/api/client";
import type { AuthenticatedUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { label: "All Snippets", href: "/dashboard",             icon: Code2      },
  { label: "Collections",  href: "/collections", icon: FolderOpen },
  { label: "Favorites",    href: "/favorites",   icon: Star       },
  // { label: "Trash",        href: "/dashboard/trash",       icon: Trash2     },
];

const BOTTOM_ITEMS = [
  { label: "New Snippet", href: "/newsnippet", icon: BookOpen },
];

function getUserLabel(user: AuthenticatedUser) {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  const [localPart] = user.email.split("@");
  return localPart || user.email;
}

type SidebarProps = {
  user: AuthenticatedUser;
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="w-52.5 min-w-52.5 h-screen sticky top-0 flex flex-col bg-[#0f0f0f] border-r border-[#1e1e1e]">

      {/* ── Logo ───────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4.5 py-5">
        {/* Icon box */}
        <div className="w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[#1e1333] border border-[#3d2f6e]">
          <Code2 size={16} className="text-[#a78bfa]" />
        </div>

        {/* Name + username */}
        <div className="flex flex-col gap-px">
          <span className="text-[11px] font-bold text-[#c4b5fd] tracking-[0.08em] uppercase font-mono">
            SnippetVault
          </span>
          <span className="text-[9px] text-[#555555] tracking-[0.06em] font-mono truncate">
            {getUserLabel(user)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1e1e1e]" />

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
                "text-[#666666] no-underline",
                "transition-colors duration-120 ease-in-out",
                // states
                active
                  ? "bg-[#1e1333] text-[#c4b5fd]"
                  : "hover:bg-[#161616] hover:text-[#aaaaaa]"
              )}
            >
              <Icon size={15} className="shrink-0 text-inherit" />

              <span className="flex-1 text-[11px] font-medium tracking-[0.04em] uppercase font-mono">
                {label}
              </span>

              {active && (
                <ChevronRight size={12} className="text-[#6d28d9] opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Push bottom items down */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="h-px bg-[#1e1e1e]" />

      {/* ── Bottom nav ─────────────────────────── */}
      <nav className="flex flex-col gap-px p-2.5 pb-3.5">
        {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.75 rounded-md",
                "text-[#666666] no-underline",
                "transition-colors duration-120 ease-in-out",
                active
                  ? "bg-[#1e1333] text-[#c4b5fd]"
                  : "hover:bg-[#161616] hover:text-[#aaaaaa]"
              )}
            >
              <Icon size={15} className="shrink-0 text-inherit" />
              <span className="text-[11px] font-medium tracking-[0.04em] uppercase font-mono">
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={async () => {
            setIsSigningOut(true);
            try {
              await apiClient.post("/api/auth/signout", undefined, { retries: 0 });
              router.push("/login");
              router.refresh();
            } finally {
              setIsSigningOut(false);
            }
          }}
          disabled={isSigningOut}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.75 rounded-md",
            "text-[#666666] transition-colors duration-120 ease-in-out",
            "hover:bg-[#161616] hover:text-[#aaaaaa]",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          <LogOut size={15} className="shrink-0 text-inherit" />
          <span className="text-[11px] font-medium tracking-[0.04em] uppercase font-mono">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </button>
      </nav>

    </aside>
  );
}