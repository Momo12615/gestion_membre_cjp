"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserStatus } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface UserToggleButtonProps {
  userId: number;
  isActive: boolean;
  userEmail: string;
}

export function UserToggleButton({ userId, isActive, userEmail }: UserToggleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleUserStatus(userId);
      router.refresh();
    });
  };

  return (
    <Button
      variant={isActive ? "outline" : "primary"}
      size="sm"
      isLoading={isPending}
      onClick={handleToggle}
      leftIcon={isActive ? <Lock className="w-3.5 h-3.5 text-red-500" /> : <Unlock className="w-3.5 h-3.5 text-[#171717]" />}
      title={isActive ? `Bloquer l'accès de ${userEmail}` : `Débloquer l'accès de ${userEmail}`}
    >
      {isActive ? "Bloquer le compte" : "Débloquer"}
    </Button>
  );
}
