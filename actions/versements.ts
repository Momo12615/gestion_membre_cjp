"use server";

import { db } from "@/lib/db";
import { getCurrentUserOrThrow, canManageUsers } from "@/lib/permissions";
import { Versement } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface RecordVersementInput {
  chef_id: number;
  amount: number;
  notes?: string;
}

/**
 * Enregistre une remise de fonds reçue d'un Chef de classe par un Administrateur
 */
export async function recordVersement(
  input: RecordVersementInput
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();

    if (!canManageUsers(user)) {
      return {
        success: false,
        error: "Seuls les administrateurs peuvent enregistrer un versement.",
      };
    }

    const chefId = Number(input.chef_id);
    const amount = Number(input.amount);
    const notes = input.notes?.trim() || null;

    if (!chefId || isNaN(chefId)) {
      return {
        success: false,
        error: "Le chef de classe spécifié est invalide.",
      };
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: "Le montant du versement doit être supérieur à 0 GNF.",
      };
    }

    // Vérifier l'existence du chef
    const chefRes = await db.execute({
      sql: "SELECT id, email FROM user WHERE id = ? LIMIT 1;",
      args: [chefId],
    });

    if (chefRes.rows.length === 0) {
      return {
        success: false,
        error: "Utilisateur Chef de classe introuvable.",
      };
    }

    const insertRes = await db.execute({
      sql: `
        INSERT INTO versement (chef_id, amount, recorded_by, notes, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
      `,
      args: [chefId, amount, user.id, notes],
    });

    revalidatePath("/admin");
    revalidatePath("/classe");
    revalidatePath("/bureau");

    return {
      success: true,
      id: Number(insertRes.lastInsertRowid),
    };
  } catch (err: any) {
    console.error("Erreur recordVersement:", err);
    return {
      success: false,
      error: err.message || "Erreur lors de l'enregistrement du versement.",
    };
  }
}

/**
 * Supprime un versement (en cas d'erreur de saisie de l'administrateur)
 */
export async function deleteVersement(
  versementId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();

    if (!canManageUsers(user)) {
      return {
        success: false,
        error: "Seuls les administrateurs peuvent supprimer un versement.",
      };
    }

    const id = Number(versementId);
    if (!id || isNaN(id)) {
      return { success: false, error: "Identifiant de versement invalide." };
    }

    await db.execute({
      sql: "DELETE FROM versement WHERE id = ?;",
      args: [id],
    });

    revalidatePath("/admin");
    revalidatePath("/classe");
    revalidatePath("/bureau");

    return { success: true };
  } catch (err: any) {
    console.error("Erreur deleteVersement:", err);
    return {
      success: false,
      error: err.message || "Erreur lors de la suppression du versement.",
    };
  }
}

/**
 * Récupère tous les versements d'un chef de classe
 */
export async function getVersementsByChef(
  chefId: number
): Promise<{ success: boolean; data: Versement[]; error?: string }> {
  try {
    await getCurrentUserOrThrow();

    const res = await db.execute({
      sql: `
        SELECT 
          v.id,
          v.chef_id,
          v.amount,
          v.recorded_by,
          v.notes,
          v.created_at,
          COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Admin') as recorded_by_name
        FROM versement v
        LEFT JOIN user u ON v.recorded_by = u.id
        WHERE v.chef_id = ?
        ORDER BY v.created_at DESC;
      `,
      args: [Number(chefId)],
    });

    const data: Versement[] = res.rows.map((r: any) => ({
      id: Number(r.id),
      chef_id: Number(r.chef_id),
      amount: Number(r.amount),
      recorded_by: Number(r.recorded_by),
      recorded_by_name: (r.recorded_by_name as string) || null,
      notes: (r.notes as string) || null,
      created_at: r.created_at as string,
    }));

    return { success: true, data };
  } catch (err: any) {
    console.error("Erreur getVersementsByChef:", err);
    return {
      success: false,
      data: [],
      error: err.message || "Erreur lors du chargement des versements.",
    };
  }
}
