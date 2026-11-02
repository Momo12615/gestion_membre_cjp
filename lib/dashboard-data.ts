import { db } from "@/lib/db";
import { Membre, Organisateur, SessionUser, User } from "@/lib/types";

// ============================================================================
// 1. DONNÉES DU DASHBOARD CHEF DE CLASSE (BATCH EN 1 ALLER-RETOUR TURSO)
// ============================================================================
export async function getClasseDashboardData(user: SessionUser) {
  const isChef = user.permission_code === "CHEF_DE_CLASSE";

  const memberSql = isChef
    ? {
        sql: `
          SELECT 
            m.id, m.first_name, m.last_name, m.email, m.phone, 
            m.licence, m.programme, m.promotion, m.role_club, 
            m.status, m.type_inscription, m.section, m.added_by, m.joined_at,
            'Vous' as added_by_name
          FROM membre m
          WHERE m.added_by = ?
          ORDER BY m.joined_at DESC;
        `,
        args: [user.id],
      }
    : {
        sql: `
          SELECT 
            m.id, m.first_name, m.last_name, m.email, m.phone, 
            m.licence, m.programme, m.promotion, m.role_club, 
            m.status, m.type_inscription, m.section, m.added_by, m.joined_at,
            COALESCE(u_added.first_name || ' ' || u_added.last_name, u_added.email, 'Système') as added_by_name
          FROM membre m
          LEFT JOIN user u_added ON m.added_by = u_added.id
          ORDER BY m.joined_at DESC;
        `,
        args: [],
      };

  try {
    const [settingRes, memberRes] = await db.batch(
      [
        "SELECT value FROM app_setting WHERE key = 'inscriptions_ouvertes' LIMIT 1;",
        memberSql,
      ],
      "read"
    );

    const inscriptionsOpen =
      settingRes.rows.length === 0 ? true : settingRes.rows[0].value === "1";

    const members: Membre[] = memberRes.rows.map((r: any) => ({
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: r.email as string,
      phone: r.phone as string,
      licence: r.licence as string,
      programme: r.programme as string,
      promotion: r.promotion as string,
      role_club: r.role_club as string,
      status: r.status as any,
      type_inscription: r.type_inscription as any,
      section: (r.section as any) || "Dev Mobile & Site Web",
      added_by: r.added_by ? Number(r.added_by) : null,
      added_by_name: (r.added_by_name as string) || "Système",
      joined_at: r.joined_at as string,
    }));

    return { inscriptionsOpen, members };
  } catch (err) {
    console.error("Erreur getClasseDashboardData batch:", err);
    return { inscriptionsOpen: true, members: [] };
  }
}

// ============================================================================
// 2. DONNÉES DU DASHBOARD BUREAU EXÉCUTIF (BATCH EN 1 ALLER-RETOUR)
// ============================================================================
export async function getBureauDashboardData() {
  try {
    const res = await db.execute(`
      SELECT 
        m.id, m.first_name, m.last_name, m.email, m.phone, 
        m.licence, m.programme, m.promotion, m.role_club, 
        m.status, m.type_inscription, m.section, m.added_by, m.joined_at,
        COALESCE(u_added.first_name || ' ' || u_added.last_name, u_added.email, 'Système') as added_by_name
      FROM membre m
      LEFT JOIN user u_added ON m.added_by = u_added.id
      ORDER BY m.joined_at DESC;
    `);

    const members: Membre[] = res.rows.map((r: any) => ({
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: r.email as string,
      phone: r.phone as string,
      licence: r.licence as string,
      programme: r.programme as string,
      promotion: r.promotion as string,
      role_club: r.role_club as string,
      status: r.status as any,
      type_inscription: r.type_inscription as any,
      section: (r.section as any) || "Dev Mobile & Site Web",
      added_by: r.added_by ? Number(r.added_by) : null,
      added_by_name: (r.added_by_name as string) || "Système",
      joined_at: r.joined_at as string,
    }));

    return { members };
  } catch (err) {
    console.error("Erreur getBureauDashboardData:", err);
    return { members: [] };
  }
}

// ============================================================================
// 3. DONNÉES DU DASHBOARD SUPER-ADMIN (BATCH COMPLET DES 4 TABLES EN 1 SEUL APPEL)
// ============================================================================
export async function getAdminDashboardData() {
  try {
    const [settingRes, memberRes, userRes, orgaRes] = await db.batch(
      [
        "SELECT value FROM app_setting WHERE key = 'inscriptions_ouvertes' LIMIT 1;",
        `
        SELECT 
          m.id, m.first_name, m.last_name, m.email, m.phone, 
          m.licence, m.programme, m.promotion, m.role_club, 
          m.status, m.type_inscription, m.section, m.added_by, m.joined_at,
          COALESCE(u_added.first_name || ' ' || u_added.last_name, u_added.email, 'Système') as added_by_name
        FROM membre m
        LEFT JOIN user u_added ON m.added_by = u_added.id
        ORDER BY m.joined_at DESC;
        `,
        `
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
        `,
        "SELECT * FROM organisateur ORDER BY id ASC;",
      ],
      "read"
    );

    const inscriptionsOpen =
      settingRes.rows.length === 0 ? true : settingRes.rows[0].value === "1";

    const members: Membre[] = memberRes.rows.map((r: any) => ({
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: r.email as string,
      phone: r.phone as string,
      licence: r.licence as string,
      programme: r.programme as string,
      promotion: r.promotion as string,
      role_club: r.role_club as string,
      status: r.status as any,
      type_inscription: r.type_inscription as any,
      section: (r.section as any) || "Dev Mobile & Site Web",
      added_by: r.added_by ? Number(r.added_by) : null,
      added_by_name: (r.added_by_name as string) || "Système",
      joined_at: r.joined_at as string,
    }));

    const users = userRes.rows.map((r: any) => {
      const fn = (r.u_first_name || r.first_name || null) as string | null;
      const ln = (r.u_last_name || r.last_name || null) as string | null;
      const lic = (r.u_licence || r.licence || null) as string | null;
      const prog = (r.u_programme || r.programme || null) as string | null;

      return {
        id: Number(r.id),
        email: r.email as string,
        is_active: Boolean(r.is_active),
        created_at: r.created_at as string,
        first_name: fn,
        last_name: ln,
        licence: lic,
        programme: prog,
        permission_id: Number(r.permission_id),
        permission_code: r.permission_code,
        permission_name: r.permission_name as string,
        phone: (r.phone as string) || null,
        classe: lic && prog ? `${lic} - ${prog}` : undefined,
      };
    });

    const organisateurs: Organisateur[] = orgaRes.rows.map((r: any) => ({
      id: Number(r.id),
      first_name: r.first_name as string,
      last_name: r.last_name as string,
      email: (r.email as string) || null,
      phone: (r.phone as string) || null,
      role: r.role as string,
      photo_url: (r.photo_url as string) || null,
      created_at: r.created_at as string,
    }));

    return { inscriptionsOpen, members, users, organisateurs };
  } catch (err) {
    console.error("Erreur getAdminDashboardData batch:", err);
    return { inscriptionsOpen: true, members: [], users: [], organisateurs: [] };
  }
}
