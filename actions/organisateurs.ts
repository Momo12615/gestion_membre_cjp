"use server";

import { db } from "@/lib/db";
import { Organisateur } from "@/lib/types";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function getOrganisateurs(): Promise<{ success: boolean; data?: Organisateur[]; error?: string }> {
  try {
    const res = await db.execute("SELECT * FROM organisateur ORDER BY id ASC;");
    const organisateurs: Organisateur[] = res.rows.map((r: any) => ({
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: (r.email as string) || null,
      phone: (r.phone as string) || null,
      role: r.role as string,
      photo_url: (r.photo_url as string) || null,
      created_at: r.created_at as string,
    }));

    return { success: true, data: organisateurs };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors du chargement des organisateurs." };
  }
}

export interface CreateOrganisateurInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: string;
  photo_base64?: string;
  photo_name?: string;
}

export async function createOrganisateur(input: CreateOrganisateurInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const session = await getSession();
    if (!session || session.permission_code !== "ADMIN") {
      return { success: false, error: "Action réservée aux administrateurs." };
    }

    if (!input.first_name?.trim() || !input.last_name?.trim() || !input.role?.trim()) {
      return { success: false, error: "Veuillez renseigner au moins le prénom, le nom et le rôle." };
    }

    let photoPathUrl: string | null = null;

    if (input.photo_base64 && input.photo_name) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "organisateurs");
        await fs.mkdir(uploadDir, { recursive: true });

        const ext = path.extname(input.photo_name) || ".png";
        const cleanName = `${Date.now()}-${input.first_name.trim().toLowerCase().replace(/\s+/g, "_")}${ext}`;
        const filePath = path.join(uploadDir, cleanName);

        const base64Data = input.photo_base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        await fs.writeFile(filePath, buffer);

        photoPathUrl = `/uploads/organisateurs/${cleanName}`;
      } catch (uploadErr) {
        console.error("Erreur enregistrement photo organisateur:", uploadErr);
      }
    }

    const emailVal = input.email?.trim() ? input.email.trim().toLowerCase() : null;
    const phoneVal = input.phone?.trim() || null;

    const res = await db.execute({
      sql: `
        INSERT INTO organisateur (
          first_name,
          last_name,
          email,
          phone,
          role,
          photo_url
        ) VALUES (?, ?, ?, ?, ?, ?);
      `,
      args: [
        input.first_name.trim(),
        input.last_name.trim(),
        emailVal,
        phoneVal,
        input.role.trim(),
        photoPathUrl,
      ],
    });

    revalidatePath("/admin");
    return { success: true, id: Number(res.lastInsertRowid) };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed: organisateur.email")) {
      return { success: false, error: "Un organisateur avec cet email existe déjà." };
    }
    return { success: false, error: err.message || "Erreur lors de l'enregistrement de l'organisateur." };
  }
}

export interface UpdateOrganisateurInput {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  photo_base64?: string;
  photo_name?: string;
  remove_photo?: boolean;
}

export async function updateOrganisateur(input: UpdateOrganisateurInput): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.permission_code !== "ADMIN") {
      return { success: false, error: "Action réservée aux administrateurs." };
    }

    if (!input.first_name?.trim() || !input.last_name?.trim() || !input.role?.trim()) {
      return { success: false, error: "Le prénom, le nom et le rôle sont obligatoires." };
    }

    // Récupérer l'organisateur actuel
    const existing = await db.execute({
      sql: "SELECT photo_url FROM organisateur WHERE id = ?",
      args: [input.id],
    });

    if (existing.rows.length === 0) {
      return { success: false, error: "Organisateur introuvable." };
    }

    let photoPathUrl: string | null = (existing.rows[0].photo_url as string) || null;

    // Si on demande la suppression de la photo
    if (input.remove_photo && photoPathUrl) {
      try {
        const localPath = path.join(process.cwd(), "public", photoPathUrl.replace(/^\//, ""));
        await fs.unlink(localPath);
      } catch {}
      photoPathUrl = null;
    }

    // Si une nouvelle photo est fournie
    if (input.photo_base64 && input.photo_name) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "organisateurs");
        await fs.mkdir(uploadDir, { recursive: true });

        // Supprimer l'ancienne photo si elle existait
        if (photoPathUrl) {
          try {
            const oldPath = path.join(process.cwd(), "public", photoPathUrl.replace(/^\//, ""));
            await fs.unlink(oldPath);
          } catch {}
        }

        const ext = path.extname(input.photo_name) || ".png";
        const cleanName = `${Date.now()}-${input.first_name.trim().toLowerCase().replace(/\s+/g, "_")}${ext}`;
        const filePath = path.join(uploadDir, cleanName);

        const base64Data = input.photo_base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        await fs.writeFile(filePath, buffer);

        photoPathUrl = `/uploads/organisateurs/${cleanName}`;
      } catch (uploadErr) {
        console.error("Erreur mise à jour photo organisateur:", uploadErr);
      }
    }

    const emailVal = input.email?.trim() ? input.email.trim().toLowerCase() : null;
    const phoneVal = input.phone?.trim() || null;

    await db.execute({
      sql: `
        UPDATE organisateur
        SET first_name = ?,
            last_name = ?,
            email = ?,
            phone = ?,
            role = ?,
            photo_url = ?
        WHERE id = ?;
      `,
      args: [
        input.first_name.trim(),
        input.last_name.trim(),
        emailVal,
        phoneVal,
        input.role.trim(),
        photoPathUrl,
        input.id,
      ],
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed: organisateur.email")) {
      return { success: false, error: "Un organisateur avec cet email existe déjà." };
    }
    return { success: false, error: err.message || "Erreur lors de la mise à jour de l'organisateur." };
  }
}

export async function deleteOrganisateur(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.permission_code !== "ADMIN") {
      return { success: false, error: "Action réservée aux administrateurs." };
    }

    const existing = await db.execute({
      sql: "SELECT email, photo_url FROM organisateur WHERE id = ?",
      args: [id],
    });

    if (existing.rows.length === 0) {
      return { success: false, error: "Organisateur introuvable." };
    }

    const orga = existing.rows[0];
    const orgaEmail = orga.email as string | null;

    if (orga.photo_url) {
      try {
        const photoUrl = orga.photo_url as string;
        const localPath = path.join(process.cwd(), "public", photoUrl.replace(/^\//, ""));
        await fs.unlink(localPath);
      } catch {}
    }

    // Supprimer les clés étrangères / invitations associées à cet organisateur
    await db.execute({
      sql: "DELETE FROM invitation WHERE organisateur_id = ?;",
      args: [id],
    });

    if (orgaEmail) {
      await db.execute({
        sql: "DELETE FROM invitation WHERE LOWER(email) = LOWER(?);",
        args: [orgaEmail],
      });
    }

    await db.execute({
      sql: "DELETE FROM organisateur WHERE id = ?",
      args: [id],
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de la suppression de l'organisateur." };
  }
}
