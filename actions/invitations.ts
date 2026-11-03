"use server";

import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { SessionUser } from "@/lib/types";
import { headers } from "next/headers";
import crypto from "crypto";

export interface InvitationData {
  id: number;
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permission_code: string;
  expires_at: string;
  used_at: string | null;
}

/**
 * Récupère et valide une invitation à partir de son token
 */
export async function getInvitationByToken(token: string): Promise<{
  success: boolean;
  data?: InvitationData;
  error?: string;
}> {
  if (!token || !token.trim()) {
    return {
      success: false,
      error: "Aucun jeton d'invitation fourni dans le lien.",
    };
  }

  try {
    const res = await db.execute({
      sql: `
        SELECT 
          id, token, email, first_name, last_name, role, 
          organisateur_id, permission_code, expires_at, used_at, created_at
        FROM invitation
        WHERE token = ?
        LIMIT 1;
      `,
      args: [token.trim()],
    });

    if (res.rows.length === 0) {
      return {
        success: false,
        error: "Ce lien d'invitation est introuvable ou invalide.",
      };
    }

    const row = res.rows[0];

    // Vérification si déjà utilisé
    if (row.used_at) {
      return {
        success: false,
        error: "Cette invitation a déjà été utilisée. Votre compte est déjà actif.",
      };
    }

    // Vérification de la date d'expiration (48h)
    const expiresAt = new Date(row.expires_at as string);
    if (expiresAt.getTime() < Date.now()) {
      return {
        success: false,
        error: "Ce lien d'invitation a expiré. Veuillez demander un nouveau lien à l'administrateur.",
      };
    }

    return {
      success: true,
      data: {
        id: Number(row.id),
        token: row.token as string,
        email: row.email as string,
        first_name: row.first_name as string,
        last_name: row.last_name as string,
        role: row.role as string,
        permission_code: (row.permission_code as string) || "BUREAU",
        expires_at: row.expires_at as string,
        used_at: (row.used_at as string) || null,
      },
    };
  } catch (err: any) {
    console.error("Erreur getInvitationByToken:", err);
    return {
      success: false,
      error: "Erreur lors de la vérification de l'invitation.",
    };
  }
}

/**
 * Accepte l'invitation et crée / active le compte utilisateur avec son mot de passe
 */
export async function acceptInvitationAction(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<{
  success: boolean;
  error?: string;
  redirectUrl?: string;
}> {
  const { token, password, confirmPassword } = input;

  if (!token || !token.trim()) {
    return { success: false, error: "Jeton d'invitation manquant." };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Le mot de passe doit comporter au moins 6 caractères.",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Les mots de passe ne correspondent pas.",
    };
  }

  try {
    // 1. Vérification de l'invitation
    const checkRes = await getInvitationByToken(token);
    if (!checkRes.success || !checkRes.data) {
      return {
        success: false,
        error: checkRes.error || "Invitation invalide ou expirée.",
      };
    }

    const invitation = checkRes.data;
    const normalizedEmail = invitation.email.trim().toLowerCase();

    // 2. Hashage sécurisé du mot de passe (bcrypt)
    const passwordHash = await hashPassword(password);

    // 3. Récupération de la permission correspondante (ex: BUREAU ou ADMIN)
    const permRes = await db.execute({
      sql: "SELECT id, code, name FROM permission WHERE code = ? LIMIT 1;",
      args: [invitation.permission_code],
    });

    const permissionId = permRes.rows.length > 0 ? Number(permRes.rows[0].id) : 2; // Défaut: BUREAU (2)
    const permissionCode = permRes.rows.length > 0 ? (permRes.rows[0].code as any) : "BUREAU";
    const permissionName = permRes.rows.length > 0 ? (permRes.rows[0].name as string) : "Membre du Bureau";

    // 4. Vérifier si un compte user existe déjà avec cet email
    const existingUserRes = await db.execute({
      sql: "SELECT id FROM user WHERE LOWER(email) = ? LIMIT 1;",
      args: [normalizedEmail],
    });

    let userId: number;

    if (existingUserRes.rows.length > 0) {
      // Mise à jour du compte existant avec le nouveau mot de passe et activation
      userId = Number(existingUserRes.rows[0].id);
      await db.execute({
        sql: `
          UPDATE user 
          SET password_hash = ?, is_active = 1, first_name = ?, last_name = ?, permission_id = ?
          WHERE id = ?;
        `,
        args: [
          passwordHash,
          invitation.first_name,
          invitation.last_name,
          permissionId,
          userId,
        ],
      });
    } else {
      // Création du nouvel utilisateur
      const insertUserRes = await db.execute({
        sql: `
          INSERT INTO user (
            email, password_hash, permission_id, is_active, 
            first_name, last_name, created_at
          ) VALUES (?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP);
        `,
        args: [
          normalizedEmail,
          passwordHash,
          permissionId,
          invitation.first_name,
          invitation.last_name,
        ],
      });
      userId = Number(insertUserRes.lastInsertRowid);
    }

    // 5. Marquer l'invitation comme utilisée
    await db.execute({
      sql: "UPDATE invitation SET used_at = CURRENT_TIMESTAMP WHERE id = ?;",
      args: [invitation.id],
    });

    // 6. Connexion automatique (Création de session utilisateur)
    const sessionUser: SessionUser = {
      id: userId,
      email: normalizedEmail,
      permission_code: permissionCode,
      permission_name: permissionName,
      first_name: invitation.first_name,
      last_name: invitation.last_name,
    };

    await createSession(sessionUser);

    // Redirection selon le rôle officiel
    const redirectUrl = permissionCode === "ADMIN" ? "/admin" : "/bureau";

    return {
      success: true,
      redirectUrl,
    };
  } catch (err: any) {
    console.error("Erreur acceptInvitationAction:", err);
    return {
      success: false,
      error: err.message || "Erreur lors de l'activation du compte.",
    };
  }
}

/**
 * Crée un jeton d'invitation pour un organisateur du comité
 * et construit l'URL basée dynamiquement sur l'origine du navigateur (window.location.origin)
 */
export async function createCommitteeInvitation(
  organisateurId: number,
  clientOrigin?: string
): Promise<{
  success: boolean;
  token?: string;
  invitationUrl?: string;
  error?: string;
}> {
  try {
    const orgaRes = await db.execute({
      sql: "SELECT id, first_name, last_name, email, role FROM organisateur WHERE id = ? LIMIT 1;",
      args: [organisateurId],
    });

    if (orgaRes.rows.length === 0) {
      return { success: false, error: "Organisateur introuvable." };
    }

    const orga = orgaRes.rows[0];
    if (!orga.email || !(orga.email as string).trim()) {
      return {
        success: false,
        error: "Cet organisateur n'a pas d'adresse email renseignée.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    // Expiration à 48 heures
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    const roleStr = (orga.role as string) || "Membre du Comité";
    // Si c'est le Président ou Administrateur -> permission ADMIN, sinon BUREAU
    const isAdmin =
      roleStr.toLowerCase().includes("président") ||
      roleStr.toLowerCase().includes("president") ||
      roleStr.toLowerCase().includes("admin");
    const permissionCode = isAdmin ? "ADMIN" : "BUREAU";

    await db.execute({
      sql: `
        INSERT INTO invitation (
          token, email, first_name, last_name, role, 
          organisateur_id, permission_code, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        token,
        (orga.email as string).trim().toLowerCase(),
        orga.first_name as string,
        orga.last_name as string,
        roleStr,
        Number(orga.id),
        permissionCode,
        expiresAt,
      ],
    });

    // Détection dynamique de l'origine :
    // 1. Priorité au window.location.origin transmis depuis le navigateur du client
    // 2. Sinon, détection via les en-têtes HTTP de la requête (Host / x-forwarded-host)
    // 3. Sinon, variable d'environnement ou fallback local
    let baseUrl = clientOrigin?.trim();

    if (!baseUrl) {
      try {
        const reqHeaders = await headers();
        const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host");
        const proto =
          reqHeaders.get("x-forwarded-proto") ||
          (host?.includes("localhost") || host?.startsWith("127.") || host?.startsWith("192.168.")
            ? "http"
            : "https");
        if (host) {
          baseUrl = `${proto}://${host}`;
        }
      } catch (_) {
        // En cas d'appel hors contexte de requête HTTP
      }
    }

    if (!baseUrl) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    }

    // Supprime un slash final éventuel
    baseUrl = baseUrl.replace(/\/$/, "");
    const invitationUrl = `${baseUrl}/invitation?token=${token}`;

    return {
      success: true,
      token,
      invitationUrl,
    };
  } catch (err: any) {
    console.error("Erreur createCommitteeInvitation:", err);
    return {
      success: false,
      error: err.message || "Erreur lors de la génération de l'invitation.",
    };
  }
}
