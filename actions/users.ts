"use server";

import { db } from "@/lib/db";
import { getCurrentUserOrThrow, canManageUsers } from "@/lib/permissions";
import { hashPassword } from "@/lib/auth";
import { PermissionCode, Permission } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getPermissions(): Promise<Permission[]> {
  const res = await db.execute("SELECT id, name, code, description, created_at FROM permission ORDER BY id ASC;");
  return res.rows.map((r: any) => ({
    id: Number(r.id),
    name: r.name as string,
    code: r.code as PermissionCode,
    description: (r.description as string) || "",
    created_at: r.created_at as string,
  }));
}

export async function getUsers() {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    throw new Error("Seul l'administrateur peut accéder à la liste des utilisateurs.");
  }

  const res = await db.execute(`
    SELECT 
      u.id, 
      u.email, 
      u.is_active, 
      u.created_at,
      p.id as permission_id,
      p.code as permission_code,
      p.name as permission_name,
      m.id as member_id,
      m.first_name,
      m.last_name,
      m.licence,
      m.programme,
      m.phone
    FROM user u
    JOIN permission p ON u.permission_id = p.id
    LEFT JOIN membre m ON u.member_id = m.id
    ORDER BY u.created_at DESC;
  `);

  return res.rows.map((r: any) => ({
    id: Number(r.id),
    email: r.email as string,
    is_active: Boolean(r.is_active),
    created_at: r.created_at as string,
    permission_id: Number(r.permission_id),
    permission_code: r.permission_code as PermissionCode,
    permission_name: r.permission_name as string,
    member_id: r.member_id ? Number(r.member_id) : null,
    member_name: r.first_name ? `${r.first_name} ${r.last_name}` : null,
    first_name: (r.first_name as string) || null,
    last_name: (r.last_name as string) || null,
    licence: (r.licence as string) || null,
    programme: (r.programme as string) || null,
    phone: (r.phone as string) || null,
    classe: r.licence && r.programme ? `${r.licence} ${r.programme}` : null,
  }));
}

export async function getUserById(id: number) {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    throw new Error("Accès refusé.");
  }

  const res = await db.execute({
    sql: `
      SELECT 
        u.id, 
        u.email, 
        u.is_active, 
        u.created_at,
        p.id as permission_id,
        p.code as permission_code,
        p.name as permission_name,
        m.id as member_id,
        m.first_name,
        m.last_name,
        m.licence,
        m.programme,
        m.phone
      FROM user u
      JOIN permission p ON u.permission_id = p.id
      LEFT JOIN membre m ON u.member_id = m.id
      WHERE u.id = ?;
    `,
    args: [id],
  });

  if (res.rows.length === 0) {
    return null;
  }

  const r = res.rows[0];
  return {
    id: Number(r.id),
    email: r.email as string,
    is_active: Boolean(r.is_active),
    created_at: r.created_at as string,
    permission_id: Number(r.permission_id),
    permission_code: r.permission_code as PermissionCode,
    permission_name: r.permission_name as string,
    member_id: r.member_id ? Number(r.member_id) : null,
    first_name: (r.first_name as string) || null,
    last_name: (r.last_name as string) || null,
    licence: (r.licence as string) || null,
    programme: (r.programme as string) || null,
    phone: (r.phone as string) || null,
  };
}

export async function createUser(data: {
  email: string;
  password: string;
  permission_code: PermissionCode;
  first_name: string;
  last_name: string;
  licence?: string;
  programme?: string;
  phone?: string;
}) {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  const normalizedEmail = data.email.trim().toLowerCase();

  const permRes = await db.execute({
    sql: "SELECT id FROM permission WHERE code = ? LIMIT 1;",
    args: [data.permission_code],
  });

  if (permRes.rows.length === 0) {
    return { success: false, error: "Permission invalide." };
  }

  const permissionId = Number(permRes.rows[0].id);
  const passwordHash = await hashPassword(data.password);

  try {
    // 1. Créer la fiche membre associée (notamment pour associer licence et programme pour un Chef de classe)
    const membreRes = await db.execute({
      sql: `
        INSERT INTO membre (
          first_name, last_name, email, phone, licence, programme, role_club, status, type_inscription, added_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'actif', 'inscrit', ?);
      `,
      args: [
        data.first_name.trim(),
        data.last_name.trim(),
        normalizedEmail,
        data.phone?.trim() || null,
        data.licence?.trim() || null,
        data.programme?.trim() || null,
        data.permission_code === "CHEF_DE_CLASSE" ? "Chef de classe" : "Membre",
        currentUser.id,
      ],
    });

    const memberId = Number(membreRes.lastInsertRowid);

    // 2. Créer le compte utilisateur
    await db.execute({
      sql: `
        INSERT INTO user (email, password_hash, permission_id, member_id, is_active)
        VALUES (?, ?, ?, ?, 1);
      `,
      args: [normalizedEmail, passwordHash, permissionId, memberId],
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed")) {
      return { success: false, error: "Un compte ou membre avec cet email existe déjà." };
    }
    return { success: false, error: err.message || "Erreur lors de la création du compte." };
  }
}

export async function updateUser(
  id: number,
  data: {
    email?: string;
    password?: string;
    permission_code?: PermissionCode;
    first_name?: string;
    last_name?: string;
    licence?: string;
    programme?: string;
    phone?: string;
    is_active?: boolean;
  }
) {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  const existing = await getUserById(id);
  if (!existing) {
    return { success: false, error: "Utilisateur introuvable." };
  }

  try {
    let permissionId = existing.permission_id;
    if (data.permission_code) {
      const permRes = await db.execute({
        sql: "SELECT id FROM permission WHERE code = ? LIMIT 1;",
        args: [data.permission_code],
      });
      if (permRes.rows.length > 0) {
        permissionId = Number(permRes.rows[0].id);
      }
    }

    // Mise à jour mot de passe si renseigné
    if (data.password && data.password.trim()) {
      const passwordHash = await hashPassword(data.password);
      await db.execute({
        sql: "UPDATE user SET password_hash = ? WHERE id = ?;",
        args: [passwordHash, id],
      });
    }

    // Mise à jour de l'utilisateur
    await db.execute({
      sql: `
        UPDATE user SET 
          email = COALESCE(?, email),
          permission_id = ?,
          is_active = COALESCE(?, is_active)
        WHERE id = ?;
      `,
      args: [
        data.email?.trim().toLowerCase() || null,
        permissionId,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
        id,
      ],
    });

    // Mise à jour de la fiche membre liée
    if (existing.member_id) {
      await db.execute({
        sql: `
          UPDATE membre SET
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            licence = COALESCE(?, licence),
            programme = COALESCE(?, programme)
          WHERE id = ?;
        `,
        args: [
          data.first_name?.trim() || null,
          data.last_name?.trim() || null,
          data.email?.trim().toLowerCase() || null,
          data.phone?.trim() || null,
          data.licence?.trim() || null,
          data.programme?.trim() || null,
          existing.member_id,
        ],
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de mise à jour." };
  }
}

export async function toggleUserStatus(id: number) {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  // Ne pas se désactiver soi-même
  if (currentUser.id === id) {
    return { success: false, error: "Vous ne pouvez pas désactiver votre propre compte." };
  }

  await db.execute({
    sql: "UPDATE user SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?;",
    args: [id],
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: number) {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  if (currentUser.id === id) {
    return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  await db.execute({
    sql: "DELETE FROM user WHERE id = ?;",
    args: [id],
  });

  revalidatePath("/admin/users");
  return { success: true };
}
