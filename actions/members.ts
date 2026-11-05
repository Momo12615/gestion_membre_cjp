"use server";

import { db } from "@/lib/db";
import { getCurrentUserOrThrow, getMemberAccessScope, canAddMember, canDeleteMember } from "@/lib/permissions";
import { Membre, TypeInscription } from "@/lib/types";
import { revalidatePath } from "next/cache";


export async function getInscriptionsStatus(): Promise<boolean> {
  try {
    const res = await db.execute("SELECT value FROM app_setting WHERE key = 'inscriptions_ouvertes' LIMIT 1;");
    if (res.rows.length === 0) return true;
    return res.rows[0].value === "1";
  } catch {
    return true;
  }
}

export async function toggleInscriptionsStatus(open: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();
    if (user.permission_code !== "ADMIN") {
      return { success: false, error: "Action réservée aux administrateurs." };
    }
    await db.execute({
      sql: "INSERT INTO app_setting (key, value, updated_at) VALUES ('inscriptions_ouvertes', ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP;",
      args: [open ? "1" : "0"],
    });
    revalidatePath("/admin");
    revalidatePath("/classe");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de mise à jour du statut des inscriptions." };
  }
}

export async function getMembers(search?: string, typeInscription?: string): Promise<{ success: boolean; data?: Membre[]; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();
    const scope = getMemberAccessScope(user);

    let sql = `
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.email,
        m.phone,
        m.licence,
        m.programme,
        m.promotion,
        m.role_club,
        m.status,
        m.type_inscription,
        m.section,
        m.added_by,
        m.joined_at,
        CASE 
          WHEN u_added.id IS NOT NULL THEN COALESCE(u_added.first_name || ' ' || u_added.last_name, m_added.first_name || ' ' || m_added.last_name, u_added.email)
          ELSE 'Système'
        END as added_by_name
      FROM membre m
      LEFT JOIN user u_added ON m.added_by = u_added.id
      LEFT JOIN membre m_added ON u_added.member_id = m_added.id
      WHERE 1=1
    `;
    const args: any[] = [];

    // Application du périmètre d'accès selon le rôle
    if (scope.type === "CLASSE") {
      // Règle stricte : Le chef de classe ne voit QUE les membres qu'il a lui-même inscrits ou réinscrits
      sql += " AND m.added_by = ?";
      args.push(scope.user_id);
    } else if (scope.type === "SELF") {
      sql += " AND m.id = ?";
      args.push(scope.member_id);
    }

    // Filtrage par recherche texte
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += " AND (LOWER(m.first_name) LIKE ? OR LOWER(m.last_name) LIKE ? OR LOWER(m.email) LIKE ? OR LOWER(m.phone) LIKE ?)";
      args.push(q, q, q, q);
    }

    // Filtrage par type d'inscription (inscrit vs reinscrit)
    if (typeInscription && ["inscrit", "reinscrit"].includes(typeInscription)) {
      sql += " AND m.type_inscription = ?";
      args.push(typeInscription);
    }

    sql += " ORDER BY m.joined_at DESC;";

    const res = await db.execute({ sql, args });

    const members: Membre[] = res.rows.map((r: any) => ({
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: r.email as string,
      phone: (r.phone as string) || null,
      licence: (r.licence as string) || null,
      programme: (r.programme as string) || null,
      promotion: (r.promotion as string) || null,
      role_club: (r.role_club as string) || "Membre",
      status: (r.status as "actif" | "inactif" | "suspendu") || "actif",
      type_inscription: (r.type_inscription as TypeInscription) || "inscrit",
      section: (r.section as string) || null,
      added_by: r.added_by ? Number(r.added_by) : null,
      added_by_name: (r.added_by_name as string) || null,
      joined_at: r.joined_at as string,
    }));

    return { success: true, data: members };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors du chargement des membres." };
  }
}

export async function getMemberById(id: number): Promise<{ success: boolean; data?: Membre; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();
    const scope = getMemberAccessScope(user);

    let sql = `
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        m.email,
        m.phone,
        m.licence,
        m.programme,
        m.promotion,
        m.role_club,
        m.status,
        m.type_inscription,
        m.section,
        m.added_by,
        m.joined_at,
        CASE 
          WHEN u_added.id IS NOT NULL THEN COALESCE(m_added.first_name || ' ' || m_added.last_name, u_added.email)
          ELSE 'Système'
        END as added_by_name
      FROM membre m
      LEFT JOIN user u_added ON m.added_by = u_added.id
      LEFT JOIN membre m_added ON u_added.member_id = m_added.id
      WHERE m.id = ?
    `;
    const args: any[] = [id];

    if (scope.type === "CLASSE") {
      sql += " AND m.licence = ? AND m.programme = ?";
      args.push(scope.licence, scope.programme);
    } else if (scope.type === "SELF") {
      sql += " AND m.id = ?";
      args.push(scope.member_id);
    }

    const res = await db.execute({ sql, args });

    if (res.rows.length === 0) {
      return { success: false, error: "Membre introuvable ou accès non autorisé." };
    }

    const r = res.rows[0];
    const member: Membre = {
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: r.email as string,
      phone: (r.phone as string) || null,
      licence: (r.licence as string) || null,
      programme: (r.programme as string) || null,
      promotion: (r.promotion as string) || null,
      role_club: (r.role_club as string) || "Membre",
      status: (r.status as "actif" | "inactif" | "suspendu") || "actif",
      type_inscription: (r.type_inscription as TypeInscription) || "inscrit",
      section: (r.section as string) || null,
      added_by: r.added_by ? Number(r.added_by) : null,
      added_by_name: (r.added_by_name as string) || null,
      joined_at: r.joined_at as string,
    };

    return { success: true, data: member };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de lecture du membre." };
  }
}

export interface CreateMemberInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  licence?: string;
  programme?: string;
  promotion?: string;
  role_club?: string;
  type_inscription: TypeInscription;
  section?: string;
}

export async function createMember(input: CreateMemberInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const user = await getCurrentUserOrThrow();

    if (!canAddMember(user)) {
      return { success: false, error: "Vous n'avez pas la permission d'ajouter un membre." };
    }

    // Vérification de l'ouverture de la campagne pour le chef de classe
    const areInscriptionsOpen = await getInscriptionsStatus();
    if (!areInscriptionsOpen && user.permission_code === "CHEF_DE_CLASSE") {
      return { success: false, error: "La période d'inscription est actuellement clôturée par l'administrateur." };
    }

    let finalLicence = input.licence?.trim() || "";
    let finalProgramme = input.programme?.trim() || "";

    // 1. Pour le Chef de classe : on force sa propre filière/classe automatiquement
    if (user.permission_code === "CHEF_DE_CLASSE") {
      if (!user.licence || !user.programme) {
        return { success: false, error: "Votre compte de chef de classe n'est pas associé à une filière." };
      }
      finalLicence = user.licence;
      finalProgramme = user.programme;
    } else {
      // 2. Pour les autres (Admin et Bureau) : ils choisissent librement la licence et le programme
      if (!finalLicence || !finalProgramme) {
        return { success: false, error: "Veuillez choisir la licence et le programme du membre." };
      }
    }

    if (!input.first_name.trim() || !input.last_name.trim() || !input.email.trim()) {
      return { success: false, error: "Le prénom, le nom et l'email sont obligatoires." };
    }

    // Règle métier CJP : Licence 1 (L1) = Inscription forcée obligatoire (pas de réinscription possible)
    const isL1 = finalLicence.toUpperCase().includes("L1") || finalLicence.toUpperCase().includes("LICENCE 1");
    const typeIns: TypeInscription = isL1 ? "inscrit" : (input.type_inscription === "reinscrit" ? "reinscrit" : "inscrit");

    const finalSection = input.section?.trim() || "Dev Mobile & Site Web";

    const insertResult = await db.execute({
      sql: `
        INSERT INTO membre (
          first_name,
          last_name,
          email,
          phone,
          licence,
          programme,
          promotion,
          role_club,
          status,
          type_inscription,
          section,
          added_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'actif', ?, ?, ?);
      `,
      args: [
        input.first_name.trim(),
        input.last_name.trim(),
        input.email.trim().toLowerCase(),
        input.phone?.trim() || null,
        finalLicence || null,
        finalProgramme || null,
        input.promotion?.trim() || null,
        input.role_club?.trim() || "Membre",
        typeIns,
        finalSection,
        user.id, // Trace l'identifiant du chef de classe ou admin connecté
      ],
    });

    revalidatePath("/membres");
    revalidatePath("/classe");
    revalidatePath("/admin");
    revalidatePath("/bureau");

    return { success: true, id: Number(insertResult.lastInsertRowid) };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed: membre.email")) {
      return { success: false, error: "Un membre avec cette adresse email existe déjà." };
    }
    return { success: false, error: err.message || "Erreur lors de la création du membre." };
  }
}

export interface UpdateMemberInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  licence?: string;
  programme?: string;
  promotion?: string;
  role_club?: string;
  status?: "actif" | "inactif" | "suspendu";
  type_inscription?: TypeInscription;
}

export async function updateMember(id: number, input: UpdateMemberInput): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();
    const scope = getMemberAccessScope(user);

    // Vérifier si le membre existe et s'il est dans le périmètre autorisé
    const existing = await getMemberById(id);
    if (!existing.success || !existing.data) {
      return { success: false, error: "Membre introuvable ou vous n'avez pas l'autorisation de le modifier." };
    }

    const current = existing.data;

    let finalLicence = input.licence !== undefined ? input.licence?.trim() : current.licence;
    let finalProgramme = input.programme !== undefined ? input.programme?.trim() : current.programme;

    // Si chef de classe, il ne peut pas modifier la licence ou le programme vers une autre classe
    if (user.permission_code === "CHEF_DE_CLASSE") {
      finalLicence = user.licence;
      finalProgramme = user.programme;
    }

    await db.execute({
      sql: `
        UPDATE membre SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          licence = ?,
          programme = ?,
          promotion = COALESCE(?, promotion),
          role_club = COALESCE(?, role_club),
          status = COALESCE(?, status),
          type_inscription = COALESCE(?, type_inscription)
        WHERE id = ?;
      `,
      args: [
        input.first_name?.trim() || null,
        input.last_name?.trim() || null,
        input.email?.trim().toLowerCase() || null,
        input.phone?.trim() || null,
        finalLicence || null,
        finalProgramme || null,
        input.promotion?.trim() || null,
        input.role_club?.trim() || null,
        input.status || null,
        input.type_inscription || null,
        id,
      ],
    });

    revalidatePath("/membres");
    revalidatePath("/classe");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE constraint failed: membre.email")) {
      return { success: false, error: "Un membre possède déjà cette adresse email." };
    }
    return { success: false, error: err.message || "Erreur lors de la modification du membre." };
  }
}

export async function deleteMember(memberId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUserOrThrow();

    // Permettre la suppression par ADMIN, BUREAU, ou par le CHEF DE CLASSE qui a inscrit le membre
    const existing = await db.execute({
      sql: "SELECT id, added_by, licence, programme FROM membre WHERE id = ?;",
      args: [memberId],
    });

    if (existing.rows.length === 0) {
      return { success: false, error: "Membre introuvable." };
    }

    const m = existing.rows[0];

    const isAuthorized =
      canDeleteMember(user) ||
      (user.permission_code === "CHEF_DE_CLASSE" &&
        (Number(m.added_by) === user.id || (m.licence === user.licence && m.programme === user.programme)));

    if (!isAuthorized) {
      return { success: false, error: "Vous n'avez pas la permission de supprimer ce membre." };
    }

    // Détacher d'éventuels comptes utilisateurs liés à ce membre (clé étrangère user.member_id)
    await db.execute({
      sql: "UPDATE user SET member_id = NULL WHERE member_id = ?;",
      args: [memberId],
    });

    await db.execute({
      sql: "DELETE FROM membre WHERE id = ?;",
      args: [memberId],
    });

    revalidatePath("/membres");
    revalidatePath("/classe");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de la suppression." };
  }
}

export async function getMemberStats(): Promise<{
  success: boolean;
  data?: {
    total: number;
    inscrits: number;
    reinscrits: number;
    byClass: { licence: string; programme: string; count: number }[];
    byChef: { chef_name: string; count: number }[];
  };
  error?: string;
}> {
  try {
    const user = await getCurrentUserOrThrow();
    const scope = getMemberAccessScope(user);

    let whereClause = "";
    const args: any[] = [];

    if (scope.type === "CLASSE") {
      whereClause = "WHERE licence = ? AND programme = ?";
      args.push(scope.licence, scope.programme);
    }

    // Statistiques globales
    const countRes = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN type_inscription = 'inscrit' THEN 1 ELSE 0 END) as inscrits,
          SUM(CASE WHEN type_inscription = 'reinscrit' THEN 1 ELSE 0 END) as reinscrits
        FROM membre
        ${whereClause};
      `,
      args,
    });

    const totalRow = countRes.rows[0];

    // Répartition par classe
    const classRes = await db.execute({
      sql: `
        SELECT 
          COALESCE(licence, 'Non spécifiée') as licence,
          COALESCE(programme, 'Général') as programme,
          COUNT(*) as count
        FROM membre
        ${whereClause}
        GROUP BY licence, programme
        ORDER BY count DESC;
      `,
      args,
    });

    // Répartition par Chef de classe / utilisateur ayant ajouté
    const chefRes = await db.execute({
      sql: `
        SELECT 
          COALESCE(m_added.first_name || ' ' || m_added.last_name, u_added.email, 'Non assigné') as chef_name,
          COUNT(m.id) as count
        FROM membre m
        LEFT JOIN user u_added ON m.added_by = u_added.id
        LEFT JOIN membre m_added ON u_added.member_id = m_added.id
        ${whereClause ? whereClause.replace(/licence/g, "m.licence").replace(/programme/g, "m.programme") : ""}
        GROUP BY chef_name
        ORDER BY count DESC;
      `,
      args,
    });

    return {
      success: true,
      data: {
        total: Number(totalRow.total || 0),
        inscrits: Number(totalRow.inscrits || 0),
        reinscrits: Number(totalRow.reinscrits || 0),
        byClass: classRes.rows.map((r: any) => ({
          licence: r.licence as string,
          programme: r.programme as string,
          count: Number(r.count),
        })),
        byChef: chefRes.rows.map((r: any) => ({
          chef_name: r.chef_name as string,
          count: Number(r.count),
        })),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors du calcul des statistiques." };
  }
}
