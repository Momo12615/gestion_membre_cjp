export type PermissionCode = "ADMIN" | "BUREAU" | "CHEF_DE_CLASSE" | "MEMBRE";

export type TypeInscription = "inscrit" | "reinscrit";

export interface Permission {
  id: number;
  name: string;
  code: PermissionCode;
  description?: string;
  created_at: string;
}

export type SectionFormation = "Dev Mobile & Site Web" | "Réseau & Cybersécurité" | "Outil Informatique";

export const SECTIONS_FORMATION: SectionFormation[] = [
  "Dev Mobile & Site Web",
  "Réseau & Cybersécurité",
  "Outil Informatique",
];

export interface Membre {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  licence?: string | null;       // ex: L1, L2, L3
  programme?: string | null;     // ex: Génie Logiciel, Réseaux
  promotion?: string | null;     // ex: 2025-2026
  role_club: string;             // ex: Membre, Président, Lead Dev
  status: "actif" | "inactif" | "suspendu";
  type_inscription: TypeInscription; // 'inscrit' | 'reinscrit'
  section?: SectionFormation | string | null; // Domaine de formation souhaité
  added_by?: number | null;      // ID de l'utilisateur (ex: Chef de classe) qui l'a ajouté
  added_by_name?: string | null; // Nom complet du chef/utilisateur qui l'a ajouté
  joined_at: string;
}

export interface Organisateur {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  photo_url?: string | null;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  permission_id: number;
  member_id?: number | null;
  is_active: number;
  created_at: string;
}

export interface SessionUser {
  id: number;
  email: string;
  permission_code: PermissionCode;
  permission_name: string;
  member_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  licence?: string | null;
  programme?: string | null;
}
