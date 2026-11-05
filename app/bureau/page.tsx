import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBureauDashboardData } from "@/lib/dashboard-data";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { CreateMemberModal } from "@/components/admin/create-member-modal";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { Users, UserPlus, UserCheck, Sparkles, ShieldCheck } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Espace Bureau Exécutif - CJP",
  description: "Portail du Bureau Exécutif du Club des Jeunes Programmeurs",
};

export default async function BureauDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.permission_code !== "BUREAU" && session.permission_code !== "ADMIN") {
    redirect("/profil");
  }

  const { members } = await getBureauDashboardData();

  const userDisplayName =
    session.first_name || session.last_name
      ? `${session.first_name || ""} ${session.last_name || ""}`.trim()
      : session.email.split("@")[0];

  const userInitials =
    (session.first_name?.[0] || "") + (session.last_name?.[0] || "") ||
    session.email[0].toUpperCase();

  const totalInscrits = members.filter((m) => m.type_inscription === "inscrit").length;
  const totalReinscrits = members.filter((m) => m.type_inscription === "reinscrit").length;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F7F7] dark:bg-[#121212] text-[#171717] dark:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Halos d'ambiance premium aux couleurs CJP */}
      <div className="absolute top-0 right-0 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-b from-[#FFA500]/15 via-[#F5B51B]/5 to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-60 left-0 w-72 sm:w-[380px] h-72 sm:h-[380px] bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Navbar user={session} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6">
        {/* ========================================================================= */}
        {/* HERO BANNER & PROFIL (FINTECH / iOS 2026 STYLE)                           */}
        {/* ========================================================================= */}
        <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl border border-[#E5E5E5] dark:border-white/[0.08] shadow-lg shadow-black/[0.03] dark:shadow-black/25 overflow-hidden">
          {/* Ligne d'accent lumineuse dorée */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FFA500] via-[#F5B51B] to-[#FFA500]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Profil & Salutation */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFA500] via-[#FFB800] to-[#E67E22] text-[#171717] font-heading font-black text-base sm:text-lg flex items-center justify-center shadow-lg shadow-[#FFA500]/20 ring-2 ring-white dark:ring-[#292929] shrink-0">
                {userInitials}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#1A1A1A] rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-bold text-lg sm:text-2xl text-[#171717] dark:text-white truncate">
                    {userDisplayName}
                  </h1>
                  <Badge variant="warning" size="sm" className="hidden xs:inline-flex shrink-0">
                    Bureau
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFA500] shrink-0" />
                  <span className="truncate">Bureau Exécutif • Club des Jeunes Programmeurs</span>
                </div>
              </div>
            </div>

            {/* Actions secondaires : Modifier profil & Déconnexion */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <EditProfileModal
                user={session}
                size="sm"
                className="w-full sm:w-auto h-9 rounded-xl bg-[#F7F7F7] dark:bg-white/[0.05] border border-[#E5E5E5] dark:border-white/10 text-xs font-semibold hover:border-[#FFA500]/50 justify-center shadow-xs"
              />
              <LogoutButton className="w-full sm:w-auto h-9 rounded-xl bg-[#F7F7F7] dark:bg-white/[0.05] border border-[#E5E5E5] dark:border-white/10 text-xs font-semibold hover:border-red-500/40 hover:text-red-500 justify-center shadow-xs" />
            </div>
          </div>

          {/* Bouton d'action principal bien mis en valeur */}
          <div className="mt-4 pt-3.5 border-t border-[#E5E5E5]/70 dark:border-white/[0.06]">
            <CreateMemberModal
              size="lg"
              className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FFA500] via-[#FFB800] to-[#FF8C00] text-[#171717] shadow-lg shadow-[#FFA500]/20 hover:shadow-xl hover:shadow-[#FFA500]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRILLE BENTO DES STATISTIQUES (3 COLONNES COMPACTES SUR MOBILE)           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Total Adhérents */}
          <div className="relative rounded-2xl p-3 sm:p-5 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#E5E5E5] dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] truncate">
                Total
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="font-heading font-extrabold text-xl sm:text-3xl text-[#171717] dark:text-white tracking-tight">
                {members.length}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] font-medium hidden sm:block mt-0.5">
                Adhérents inscrits
              </div>
            </div>
          </div>

          {/* Inscriptions */}
          <div className="relative rounded-2xl p-3 sm:p-5 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#E5E5E5] dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-[#16A34A] dark:text-emerald-400 truncate">
                Inscrits
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="font-heading font-extrabold text-xl sm:text-3xl text-[#171717] dark:text-white tracking-tight">
                {totalInscrits}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] font-medium hidden sm:block mt-0.5">
                Nouvelles adhésions
              </div>
            </div>
          </div>

          {/* Réinscriptions */}
          <div className="relative rounded-2xl p-3 sm:p-5 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#E5E5E5] dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-[#EAB308] dark:text-amber-400 truncate">
                Réinscrits
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <div className="font-heading font-extrabold text-xl sm:text-3xl text-[#171717] dark:text-white tracking-tight">
                {totalReinscrits}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] font-medium hidden sm:block mt-0.5">
                Renouvellements
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUPERVISION DES MEMBRES                                                   */}
        {/* ========================================================================= */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#E5E5E5] dark:border-white/[0.08] bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl shadow-xl shadow-black/[0.03] dark:shadow-black/25 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-white/[0.08] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white">
                  Supervision des Membres CJP
                </h2>
                <Badge variant="cjp" size="sm">
                  {members.length} {members.length > 1 ? "adhérents" : "adhérent"}
                </Badge>
              </div>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                Vue d&apos;ensemble de tous les membres enregistrés à l&apos;échelle du club.
              </p>
            </div>
            <div className="hidden sm:block">
              <CreateMemberModal size="sm" />
            </div>
          </div>

          <div>
            {members.length === 0 ? (
              <div className="p-8 sm:p-14 text-center flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#FFA500]/20 via-[#FFA500]/10 to-transparent border border-[#FFA500]/30 flex items-center justify-center text-[#FFA500] shadow-lg shadow-[#FFA500]/10">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFA500] flex items-center justify-center text-[#171717] shadow-sm">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>

                <div className="max-w-xs space-y-1">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white">
                    Aucun membre pour le moment
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] leading-relaxed">
                    Le registre est prêt. Vous pouvez inscrire le premier adhérent de l&apos;association dès maintenant.
                  </p>
                </div>

                <CreateMemberModal
                  size="sm"
                  className="mt-1 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-[#171717] font-bold text-xs px-4 py-2 rounded-xl shadow-md"
                />
              </div>
            ) : (
              <>
                {/* VUE MOBILE (Cartes modernes pour smartphone) */}
                <div className="block md:hidden p-3 space-y-2.5">
                  {members.map((m) => {
                    const initials =
                      (m.first_name?.[0] || "") + (m.last_name?.[0] || "") || "CJP";

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl border border-[#E5E5E5] dark:border-white/[0.08] bg-white dark:bg-[#202020] shadow-xs space-y-3 transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA500]/25 via-[#FFA500]/15 to-transparent border border-[#FFA500]/30 text-[#FFA500] font-heading font-bold text-sm flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-heading font-bold text-sm text-[#171717] dark:text-white truncate">
                                {m.first_name} {m.last_name}
                              </h4>
                              <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] font-mono truncate">
                                {m.email}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={m.type_inscription === "inscrit" ? "success" : "warning"}
                            size="sm"
                            className="shrink-0 text-[10px]"
                          >
                            {m.type_inscription === "inscrit" ? "Inscrit" : "Réinscrit"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded-lg bg-[#F7F7F7] dark:bg-white/[0.05] border border-[#E5E5E5] dark:border-white/10 font-mono text-[11px] font-semibold text-[#171717] dark:text-white">
                            {m.licence} - {m.programme}
                          </span>
                          {m.section && (
                            <span className="px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30 text-[10px] font-semibold">
                              {m.section}
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#E5E5E5]/60 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                          <span>
                            Inscrit par :{" "}
                            <strong className="text-[#171717] dark:text-white font-medium">
                              {m.added_by_name || "Système"}
                            </strong>
                          </span>
                          <Badge variant="cjp" size="sm" dot className="text-[10px]">
                            {m.status || "Actif"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* VUE TABLETTE & DESKTOP (Tableau complet) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F7F7] dark:bg-[#202020] border-b border-[#E5E5E5] dark:border-white/[0.08] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Adhérent</th>
                        <th className="px-6 py-3.5">Classe & Section</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Inscrit par</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] dark:divide-white/[0.06]">
                      {members.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-[#F7F7F7]/60 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-[#171717] dark:text-white">
                            <div className="font-semibold">{m.first_name} {m.last_name}</div>
                            <div className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono mt-0.5">
                              {m.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{m.licence} - {m.programme}</div>
                            {m.section && (
                              <div className="text-xs text-[#FFA500] font-medium mt-0.5">
                                {m.section}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={m.type_inscription === "inscrit" ? "success" : "warning"}
                              size="sm"
                            >
                              {m.type_inscription === "inscrit" ? "Inscrit" : "Réinscrit"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#737373] dark:text-[#A3A3A3]">
                            {m.added_by_name || "Système"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
