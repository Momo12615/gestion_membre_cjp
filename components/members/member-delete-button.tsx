"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMember } from "@/actions/members";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MemberDeleteButtonProps {
  id: number;
  name: string;
  className?: string;
  size?: "sm" | "md";
}

export function MemberDeleteButton({
  id,
  name,
  className,
  size = "sm",
}: MemberDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const displayName = name && name.trim() ? name.trim() : "cet étudiant";

  const handleDelete = () => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement "${displayName}" du registre des membres ?\n\nCette action est irréversible.`
      )
    ) {
      startTransition(async () => {
        const res = await deleteMember(id);
        if (!res.success) {
          alert(res.error || "Erreur lors de la suppression de l'étudiant.");
        } else {
          router.refresh();
        }
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleDelete}
      disabled={isPending}
      className={cn(
        "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 cursor-pointer h-8 w-8 p-0 shrink-0",
        className
      )}
      title={`Supprimer ${displayName}`}
      aria-label={`Supprimer ${displayName}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}

