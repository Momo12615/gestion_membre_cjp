"use client";

import React, { useTransition } from "react";
import { LogOut } from "lucide-react";
import { handleLogout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      isLoading={isPending}
      onClick={() => {
        startTransition(async () => {
          await handleLogout();
        });
      }}
      leftIcon={<LogOut className="w-3.5 h-3.5" />}
      className={className}
    >
      <span>Déconnexion</span>
    </Button>
  );
}
