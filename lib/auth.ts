import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { SessionUser, PermissionCode } from "./types";

const SESSION_COOKIE = "cjp_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "cjp-super-secret-key-change-in-prod-2026";

// Chiffrement / Signature simple & ultra-sécurisée via Web Crypto API (HMAC-SHA256)
async function signData(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${Buffer.from(data).toString("base64url")}.${sigHex}`;
}

async function verifyAndDecode(signed: string): Promise<string | null> {
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [b64Data, expectedSig] = parts;
  const data = Buffer.from(b64Data, "base64url").toString("utf-8");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (sigHex !== expectedSig) return null;
  return data;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const signed = await signData(JSON.stringify(user));

  cookieStore.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const data = await verifyAndDecode(token);
    if (!data) return null;

    return JSON.parse(data) as SessionUser;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await db.execute({
      sql: `
        SELECT 
          u.id, 
          u.email, 
          u.password_hash, 
          u.is_active, 
          u.member_id,
          p.code as permission_code, 
          p.name as permission_name,
          m.first_name,
          m.last_name,
          m.licence,
          m.programme
        FROM user u
        JOIN permission p ON u.permission_id = p.id
        LEFT JOIN membre m ON u.member_id = m.id
        WHERE LOWER(u.email) = ?
        LIMIT 1;
      `,
      args: [normalizedEmail],
    });

    if (result.rows.length === 0) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    const row = result.rows[0];

    if (!row.is_active) {
      return { success: false, error: "Ce compte a été désactivé par l'administrateur." };
    }

    const passwordHash = row.password_hash as string;
    const isValid = await verifyPassword(password, passwordHash);

    if (!isValid) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    const sessionUser: SessionUser = {
      id: Number(row.id),
      email: row.email as string,
      permission_code: row.permission_code as PermissionCode,
      permission_name: row.permission_name as string,
      member_id: row.member_id ? Number(row.member_id) : null,
      first_name: (row.first_name as string) || null,
      last_name: (row.last_name as string) || null,
      licence: (row.licence as string) || null,
      programme: (row.programme as string) || null,
    };

    await createSession(sessionUser);

    return { success: true, user: sessionUser };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de connexion." };
  }
}
