import { db } from "@/lib/db";
import { Organisateur } from "@/lib/types";
import { unstable_cache } from "next/cache";

export interface HomeData {
  totalMembers: number;
  membersBySection: Record<string, number>;
  organisateurs: Organisateur[];
}

async function fetchHomeData(): Promise<HomeData> {
  const membersBySection: Record<string, number> = {
    "Dev Mobile & Site Web": 0,
    "Réseau & Cybersécurité": 0,
    "Outil Informatique": 0,
  };

  try {
    const [totalRes, sectionRes, orgaRes] = await db.batch(
      [
        "SELECT count(*) as total FROM membre;",
        "SELECT section, count(*) as count FROM membre GROUP BY section;",
        "SELECT * FROM organisateur ORDER BY id ASC;",
      ],
      "read"
    );

    const totalMembers = Number(totalRes.rows[0]?.total || 0);

    for (const r of sectionRes.rows) {
      const sec = (r.section as string) || "Dev Mobile & Site Web";
      membersBySection[sec] = (membersBySection[sec] || 0) + Number(r.count || 0);
    }

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

    return { totalMembers, membersBySection, organisateurs };
  } catch (err) {
    console.error("Erreur chargement données accueil batch:", err);
    return { totalMembers: 0, membersBySection, organisateurs: [] };
  }
}

export const getCachedHomeData = unstable_cache(
  fetchHomeData,
  ["home-page-data"],
  {
    revalidate: 30,
    tags: ["home-data", "membres", "organisateurs"],
  }
);
