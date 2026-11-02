import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { CampaignControl } from "@/components/admin/campaign-control";
import { AdminTabsView } from "@/components/admin/admin-tabs-view";
import { Membre, Organisateur } from "@/lib/types";
import {
  Users,
  UserCheck,
  UserPlus,
  Coins,
} from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Administration CJP",
  description: "Tableau de bord Super-Administrateur du Club des Jeunes Programmeurs",
};

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.permission_code !== "ADMIN") {
    if (session.permission_code === "BUREAU") redirect("/bureau");
    if (session.permission_code === "CHEF_DE_CLASSE") redirect("/classe");
    redirect("/profil");
  }

  const { inscriptionsOpen, members, users, organisateurs } = await getAdminDashboardData();

  const totalMembers = members.length;
  const inscrits = members.filter((m) => m.type_inscription === "inscrit").length;
  const reinscrits = members.filter((m) => m.type_inscription === "reinscrit").length;
  const totalRecettes = inscrits * TARIF_INSCRIPTION + reinscrits * TARIF_REINSCRIPTION;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#171717] text-[#171717] dark:text-white transition-colors duration-200">
      <Navbar user={session} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* EN-TÊTE DU DASHBOARD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5E5E5] dark:border-[#383838]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#171717] dark:text-white">
                Administration CJP
              </h1>
              <Badge variant="cjp" size="sm" dot>
                Super-Admin
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-[#737373] dark:text-[#A3A3A3]">
              Gestion des adhésions, comité organisateur et utilisateurs.
            </p>
          </div>

          <div className="flex items-center justify-end">
            <LogoutButton />
          </div>
        </div>

        {/* PANNEAU DE CONTRÔLE DE LA CAMPAGNE D'INSCRIPTION */}
        <CampaignControl inscriptionsOpen={inscriptionsOpen} />

        {/* CARTES KPI METRICS (GRILLE 2x2 COMPACTE SUR MOBILE) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* TOTAL RECETTES */}
          <Card className="border-l-3 sm:border-l-4 border-l-[#FFA500]">
            <CardContent className="p-3 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] font-medium truncate">
                  Total Recettes
                </p>
                <p className="font-heading font-bold text-sm sm:text-xl text-[#FFA500] mt-0.5 font-mono truncate">
                  {totalRecettes.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[9px] sm:text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5 truncate hidden sm:block">
                  20K Inscrits • 10K Réinscrits
                </p>
              </div>
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] shrink-0">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>

          {/* NOUVELLES INSCRIPTIONS */}
          <Card className="border-l-3 sm:border-l-4 border-l-[#16A34A]">
            <CardContent className="p-3 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] font-medium truncate">
                  Inscrits (20K)
                </p>
                <p className="font-heading font-bold text-base sm:text-xl text-[#171717] dark:text-white mt-0.5 truncate">
                  {inscrits}
                </p>
                <p className="text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono truncate">
                  {(inscrits * TARIF_INSCRIPTION).toLocaleString("fr-FR")} GNF
                </p>
              </div>
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>

          {/* RÉINSCRIPTIONS */}
          <Card className="border-l-3 sm:border-l-4 border-l-[#EAB308]">
            <CardContent className="p-3 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] font-medium truncate">
                  Réinscrits (10K)
                </p>
                <p className="font-heading font-bold text-base sm:text-xl text-[#171717] dark:text-white mt-0.5 truncate">
                  {reinscrits}
                </p>
                <p className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-mono truncate">
                  {(reinscrits * TARIF_REINSCRIPTION).toLocaleString("fr-FR")} GNF
                </p>
              </div>
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>

          {/* TOTAL ADHÉRENTS */}
          <Card className="border-l-3 sm:border-l-4 border-l-[#2563EB]">
            <CardContent className="p-3 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] font-medium truncate">
                  Total Adhérents
                </p>
                <p className="font-heading font-bold text-base sm:text-xl text-[#171717] dark:text-white mt-0.5 truncate">
                  {totalMembers}
                </p>
                <p className="text-[9px] sm:text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5 truncate">
                  3 sections CJP
                </p>
              </div>
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION DES ONGLETS ADMIN (UTILISATEURS, ORGANISATEURS, MEMBRES) */}
        <AdminTabsView
          users={users}
          organisateurs={organisateurs}
          members={members}
        />
      </main>

      <Footer />
    </div>
  );
}
