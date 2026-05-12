import { redirect } from "next/navigation";
import { Mail, UserRound } from "lucide-react";

import UserSignOutButton from "@/components/shared/UserSignOutButton";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getUserLabel } from "@/lib/auth/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatMemberSince(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function UserPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = getUserLabel(user);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink-muted">
          Account
        </h1>
        <p className="text-2xl font-semibold text-[#f4f4f5]">{displayName}</p>
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
              <UserRound size={16} className="text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
                Display name
              </p>
              <p className="truncate text-sm text-[#f4f4f5]">{displayName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-base bg-surface-default">
              <Mail size={16} className="text-[#888888]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
                Email
              </p>
              <p className="truncate text-sm text-[#d4d4d8]">{user.email}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-muted">
              Member since
            </p>
            <p className="text-sm text-[#d4d4d8]">
              {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface-shell px-4 py-4">
        <div>
          <p className="text-sm font-medium text-[#f4f4f5]">Sign out</p>
          <p className="text-xs text-ink-muted">
            End your session on this device.
          </p>
        </div>
        <UserSignOutButton />
      </div>
    </div>
  );
}
