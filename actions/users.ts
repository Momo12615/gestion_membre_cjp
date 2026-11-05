"use server";

import { db } from "@/lib/db";
import { getCurrentUserOrThrow, canManageUsers } from "@/lib/permissions";
import { hashPassword } from "@/lib/auth";
import { PermissionCode, Permission } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
      u.first_name as u_first_name,
      u.last_name as u_last_name,
      u.licence as u_licence,
      u.programme as u_programme,
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

  return res.rows.map((r: any) => {
    const fn = (r.u_first_name || r.first_name || null) as string | null;
    const ln = (r.u_last_name || r.last_name || null) as string | null;
    const lic = (r.u_licence || r.licence || null) as string | null;
    const prog = (r.u_programme || r.programme || null) as string | null;

    return {
      id: Number(r.id),
      email: r.email as string,
      is_active: Boolean(r.is_active),
      created_at: r.created_at as string,
      permission_id: Number(r.permission_id),
      permission_code: r.permission_code as PermissionCode,
      permission_name: r.permission_name as string,
      member_id: r.member_id ? Number(r.member_id) : null,
      member_name: fn && ln ? `${fn} ${ln}` : fn || ln || null,
      first_name: fn,
      last_name: ln,
      licence: lic,
      programme: prog,
      phone: (r.phone as string) || null,
      classe: lic && prog ? `${lic} ${prog}` : null,
    };
  });
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
    // Insérer directement dans user (les comptes de gestion ne sont pas des membres adhérents)
    await db.execute({
      sql: `
        INSERT INTO user (
          email,
          password_hash,
          permission_id,
          is_active,
          first_name,
          last_name,
          licence,
          programme
        ) VALUES (?, ?, ?, 1, ?, ?, ?, ?);
      `,
      args: [
        normalizedEmail,
        passwordHash,
        permissionId,
        data.first_name.trim(),
        data.last_name.trim(),
        data.licence?.trim() || null,
        data.programme?.trim() || null,
      ],
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed: user.email")) {
      return { success: false, error: "Un compte utilisateur avec cette adresse email existe déjà." };
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
          is_active = COALESCE(?, is_active),
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          licence = ?,
          programme = ?
        WHERE id = ?;
      `,
      args: [
        data.email?.trim().toLowerCase() || null,
        permissionId,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
        data.first_name !== undefined ? data.first_name.trim() : null,
        data.last_name !== undefined ? data.last_name.trim() : null,
        data.licence !== undefined ? (data.licence?.trim() || null) : null,
        data.programme !== undefined ? (data.programme?.trim() || null) : null,
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

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed: user.email")) {
      return { success: false, error: "Un compte avec cette adresse email existe déjà." };
    }
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

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: number): Promise<{ success: boolean; isSelfDelete?: boolean; error?: string }> {
  const currentUser = await getCurrentUserOrThrow();
  if (!canManageUsers(currentUser)) {
    return { success: false, error: "Action réservée aux administrateurs." };
  }

  // Vérifier si l'utilisateur existe
  const targetUserRes = await db.execute({
    sql: "SELECT id, email, permission_id FROM user WHERE id = ? LIMIT 1;",
    args: [id],
  });

  if (targetUserRes.rows.length === 0) {
    return { success: false, error: "Utilisateur introuvable." };
  }

  const targetUser = targetUserRes.rows[0];
  const targetEmail = String(targetUser.email || "").trim().toLowerCase();

  // Si c'est un compte administrateur, vérifier qu'il reste au moins un autre administrateur actif
  const targetPermRes = await db.execute({
    sql: "SELECT code FROM permission WHERE id = ? LIMIT 1;",
    args: [targetUser.permission_id],
  });
  const isTargetAdmin = targetPermRes.rows[0]?.code === "ADMIN";

  if (isTargetAdmin) {
    const remainingAdminsRes = await db.execute({
      sql: `
        SELECT COUNT(*) as count 
        FROM user u 
        JOIN permission p ON u.permission_id = p.id 
        WHERE p.code = 'ADMIN' AND u.id != ? AND u.is_active = 1;
      `,
      args: [id],
    });
    const remainingAdmins = Number(remainingAdminsRes.rows[0]?.count || 0);

    if (remainingAdmins === 0) {
      return {
        success: false,
        error: "Impossible de supprimer ce compte : il doit rester au moins un autre administrateur actif dans le système.",
      };
    }
  }

  try {
    // 1. Nettoyer / supprimer toutes les clés étrangères liées à cet utilisateur :
    // A) Détacher les membres inscrits par cet utilisateur (clé étrangère membre.added_by)
    await db.execute({
      sql: "UPDATE membre SET added_by = NULL WHERE added_by = ?;",
      args: [id],
    });

    // B) Détacher le member_id s'il existe sur ce compte
    await db.execute({
      sql: "UPDATE user SET member_id = NULL WHERE id = ?;",
      args: [id],
    });

    // C) Supprimer les invitations associées à cet email (clé étrangère dans table invitation)
    if (targetEmail) {
      await db.execute({
        sql: "DELETE FROM invitation WHERE LOWER(email) = ?;",
        args: [targetEmail],
      });
    }

    // 2. Supprimer définitivement l'utilisateur
    await db.execute({
      sql: "DELETE FROM user WHERE id = ?;",
      args: [id],
    });

    // 3. Si l'administrateur a supprimé son propre compte actuellement connecté
    const isSelfDelete = currentUser.id === id;
    if (isSelfDelete) {
      const cookieStore = await cookies();
      cookieStore.delete("cjp_session");
    }

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true, isSelfDelete };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de la suppression." };
  }
}
