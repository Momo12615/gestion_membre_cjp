import { getSession } from "@/lib/auth";
import { getCachedHomeData } from "@/lib/home-data";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { SectionsShowcase } from "@/components/home/sections-showcase";
import { ComiteOrganigramme } from "@/components/home/comite-organigramme";
import { HomeFeatureCards } from "@/components/home/home-feature-cards";
import { ScrollToTop } from "@/components/home/scroll-to-top";

export const instant = false;

export const metadata = {
  title: "Accueil - Club des Jeunes Programmeurs",
  description:
    "Bienvenue sur la plateforme officielle du Club des Jeunes Programmeurs (CJP). Gestion des membres, promotions, sections de formation et comité opérationnel.",
};

export default async function HomePage() {
  // Exécution parallèle ultra-rapide de l'authentification et des données en cache
  const [session, homeData] = await Promise.all([
    getSession(),
    getCachedHomeData(),
  ]);

  const { totalMembers, membersBySection, organisateurs } = homeData;

  const getDashboardUrl = () => {
    if (!session) return "/login";
    if (session.permission_code === "ADMIN") return "/admin";
    if (session.permission_code === "BUREAU") return "/bureau";
    if (session.permission_code === "CHEF_DE_CLASSE") return "/classe";
    return "/profil";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-[#171717] dark:text-white transition-colors duration-200">
      <Navbar user={session} />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* HERO SECTION CINÉMATIQUE (ANIMATIONS OPTIMISÉES SANS BLOCAGE DU LCP)     */}
        {/* ========================================================================= */}
        <HeroSection
          session={session}
          dashboardUrl={getDashboardUrl()}
          totalMembers={totalMembers}
          orgaCount={organisateurs.length > 0 ? organisateurs.length : 13}
        />

        {/* ========================================================================= */}
        {/* SECTIONS DE FORMATION & EFFECTIFS (ANIMATIONS D'ENTRÉE GSAP FIABLES)     */}
        {/* ========================================================================= */}
        <SectionsShowcase
          totalMembers={totalMembers}
          membersBySection={membersBySection}
        />

        {/* ========================================================================= */}
        {/* NOUVEAU COMITÉ DU CJP (ORGANIGRAMME DU POSTER)                           */}
        {/* ========================================================================= */}
        <ComiteOrganigramme organisateurs={organisateurs} />

        {/* ========================================================================= */}
        {/* VALEURS, FONCTIONNALITÉS & BANNIÈRE CTA                                  */}
        {/* ========================================================================= */}
        <HomeFeatureCards dashboardUrl={getDashboardUrl()} />

        {/* BOUTON FLOTTANT RETOUR EN HAUT */}
        <ScrollToTop />
      </main>

      <Footer />
    </div>
  );
}
