/**
 * Tarifs officiels d'adhésion au Club des Jeunes Programmeurs (CJP)
 */
export const TARIF_INSCRIPTION = 20000; // 20 000 GNF pour nouvel adhérent
export const TARIF_REINSCRIPTION = 10000; // 10 000 GNF pour renouvellement annuel

/**
 * Liste officielle des filières et programmes universitaires
 */
export const PROGRAMMES = [
  "Transformation Numérique des Organisations",
  "Langue Anglaise",
  "Traduction, Interprétation et Localisation",
  "Business Administration",
  "Langue Arabe",
  "Traduction Arabe, Interprétation et Médiation Interculturelle",
  "Langue Arabe Appliquée aux Affaires et au Commerce International",
  "Littérature, Société et Communication",
  "Littérature",
  "Sociologie",
  "Développement Local et Gestion de Projets",
  "Anthropologie",
  "Biologie moléculaire et Biotechnologies",
  "Microbiologie et Immunologie",
  "Biologie Médicale",
  "Chimie-Environnement",
  "Mathématiques",
  "Mathématiques, Intelligence Artificielle et Analyse Prédictive",
  "Modélisation mathématique et Simulation numérique",
  "Électronique et Énergétique",
  "Environnement et Climat",
  "Énergies Renouvelables",
  "Économie Sociale et Solidaire",
  "Management de Projets et Innovation",
  "Gestion",
  "Développement d'Application",
  "Réseaux et Cybersécurité",
  "Informatique",
  "Miage",
  "Mathematique",
  "Energie Photovoltaique"
] as const;

export type Programme = (typeof PROGRAMMES)[number];
