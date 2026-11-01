"use server";

import { login, destroySession, getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(email: string, password: string) {
  return login(email, password);
}

export async function handleLogin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Veuillez renseigner votre email et mot de passe." };
  }

  const result = await login(email, password);

  if (!result.success) {
    return { error: result.error || "Échec de connexion." };
  }

  // Redirection selon le rôle
  const code = result.user?.permission_code;
  if (code === "ADMIN") {
    redirect("/admin");
  } else if (code === "BUREAU") {
    redirect("/bureau");
  } else if (code === "CHEF_DE_CLASSE") {
    redirect("/classe");
  } else {
    redirect("/profil");
  }
}

export async function handleLogout() {
  await destroySession();
  redirect("/login");
}

export async function checkHasUsers(): Promise<boolean> {
  try {
    const res = await db.execute("SELECT COUNT(*) as count FROM user;");
    return Number(res.rows[0].count) > 0;
  } catch {
    return false;
  }
}

export async function getCurrentSessionUser() {
  return getSession();
}

// Fonction pour initialiser le premier compte Super-Admin si la base est vide
export async function seedInitialAdmin(email: string, password: string, prenom: string, nom: string) {
  const userCount = await db.execute("SELECT COUNT(*) as count FROM user;");
  if (Number(userCount.rows[0].count) > 0) {
    return { success: false, error: "Un utilisateur existe déjà dans la base." };
  }

  const adminPerm = await db.execute("SELECT id FROM permission WHERE code = 'ADMIN' LIMIT 1;");
  if (adminPerm.rows.length === 0) {
    return { success: false, error: "Permission ADMIN introuvable." };
  }

  const permId = Number(adminPerm.rows[0].id);
  const passwordHash = await hashPassword(password);

  // Créer d'abord la fiche membre pour l'admin
  const membreRes = await db.execute({
    sql: `INSERT INTO membre (first_name, last_name, email, role_club, status, type_inscription) 
          VALUES (?, ?, ?, 'Président & Admin', 'actif', 'inscrit');`,
    args: [prenom, nom, email],
  });

  const memberId = Number(membreRes.lastInsertRowid);

  // Créer le compte utilisateur
  await db.execute({
    sql: `INSERT INTO user (email, password_hash, permission_id, member_id, is_active)
          VALUES (?, ?, ?, ?, 1);`,
    args: [email.toLowerCase().trim(), passwordHash, permId, memberId],
  });

  return { success: true };
}
