"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export default function UserSignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isSigningOut}
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
      className="border-border-base bg-[#111111] text-purple-300 hover:bg-[#161616] hover:text-[#ddd6fe]"
    >
      <LogOut />
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
