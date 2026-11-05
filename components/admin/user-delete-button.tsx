"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/button";

interface UserDeleteButtonProps {
  id: number;
  name: string;
  email: string;
}

export function UserDeleteButton({ id, name, email }: UserDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const displayName = name && name.trim() ? name.trim() : email;

  const handleDelete = () => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement le compte utilisateur de "${displayName}" (${email}) ?\n\nToutes les clés étrangères associées (invitations, liaisons) seront automatiquement nettoyées.\nCette action est irréversible.`
      )
    ) {
      startTransition(async () => {
        const res = await deleteUser(id);
        if (!res.success) {
          alert(res.error || "Erreur lors de la suppression de l'utilisateur.");
        } else if (res.isSelfDelete) {
          alert("Votre compte administrateur a été supprimé. Vous allez être redirigé vers la page de connexion.");
          window.location.href = "/login";
        } else {
          router.refresh();
        }
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
      title={`Supprimer le compte de ${displayName}`}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}
