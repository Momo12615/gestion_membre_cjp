"use client";

import React, { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteOrganisateur } from "@/actions/organisateurs";
import { Button } from "@/components/ui/button";

interface OrganisateurDeleteButtonProps {
  id: number;
  name: string;
}

export function OrganisateurDeleteButton({ id, name }: OrganisateurDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'organisateur "${name}" ?`)) {
      startTransition(async () => {
        const res = await deleteOrganisateur(id);
        if (!res.success) {
          alert(res.error || "Erreur lors de la suppression.");
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
      title="Supprimer cet organisateur"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}
