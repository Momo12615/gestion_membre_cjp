import { getSession } from "./auth";
import { SessionUser, PermissionCode } from "./types";

export async function getCurrentUserOrThrow(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Non autorisé. Veuillez vous connecter.");
  }
  return user;
}

export function canAddMember(user: SessionUser): boolean {
  return ["ADMIN", "BUREAU", "CHEF_DE_CLASSE"].includes(user.permission_code);
}

export function canDeleteMember(user: SessionUser): boolean {
  return ["ADMIN", "BUREAU"].includes(user.permission_code);
}

export function canManageUsers(user: SessionUser): boolean {
  return user.permission_code === "ADMIN";
}

export function canViewAllMembers(user: SessionUser): boolean {
  return ["ADMIN", "BUREAU"].includes(user.permission_code);
}

export type ScopeFilter =
  | { type: "ALL" }
  | { type: "CLASSE"; licence: string; programme: string }
  | { type: "SELF"; member_id: number };

export function getMemberAccessScope(user: SessionUser): ScopeFilter {
  if (user.permission_code === "ADMIN" || user.permission_code === "BUREAU") {
    return { type: "ALL" };
  }

  if (user.permission_code === "CHEF_DE_CLASSE") {
    if (!user.licence || !user.programme) {
      throw new Error("Le profil du Chef de classe n'a pas de licence ou de programme défini.");
    }
    return {
      type: "CLASSE",
      licence: user.licence,
      programme: user.programme,
    };
  }

  // Pour un membre simple
  if (user.member_id) {
    return { type: "SELF", member_id: user.member_id };
  }

  throw new Error("Accès refusé pour ce profil.");
}
