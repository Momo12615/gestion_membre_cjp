import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBureauDashboardData } from "@/lib/dashboard-data";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { CreateMemberModal } from "@/components/admin/create-member-modal";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { Membre } from "@/lib/types";
import { Users, UserPlus, UserCheck } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#171717] text-[#171717] dark:text-white transition-colors duration-200">
      <Navbar user={session} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#383838]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white">
                Espace Bureau Exécutif
              </h1>
              <Badge variant="warning" size="md" dot>
                Bureau CJP
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3]">
              Coordination générale et suivi global des adhésions de l&apos;association.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <CreateMemberModal />
            <EditProfileModal user={session} />
            <LogoutButton />
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-l-4 border-l-[#FFA500]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-medium">
                  Total Adhérents
                </p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white mt-1">
                  {members.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500]">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#16A34A]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-medium">
                  Inscriptions
                </p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white mt-1">
                  {members.filter((m) => m.type_inscription === "inscrit").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserPlus className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#EAB308]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-medium">
                  Réinscriptions
                </p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white mt-1">
                  {members.filter((m) => m.type_inscription === "reinscrit").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <UserCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABLE DES MEMBRES */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] dark:border-[#383838] pb-4">
            <div>
              <CardTitle>Supervision des Membres CJP</CardTitle>
              <CardDescription>
                Vue d&apos;ensemble de tous les membres enregistrés à l&apos;échelle du club.
              </CardDescription>
            </div>
            <CreateMemberModal />
          </CardHeader>

          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500]">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="font-heading font-semibold text-lg text-[#171717] dark:text-white">
                  Aucun membre pour le moment
                </h4>
              </div>
            ) : (
              <>
                {/* VUE MOBILE (Cartes pleine largeur pour smartphones) */}
                <div className="block md:hidden p-2 sm:p-4 space-y-2.5">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7]/80 dark:bg-[#1c1c1c] space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-semibold text-base text-[#171717] dark:text-white break-words">
                            {m.first_name} {m.last_name}
                          </h4>
                          <div className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span>{m.licence} - {m.programme}</span>
                            {m.section && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/25">
                                {m.section}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={m.type_inscription === "inscrit" ? "success" : "warning"}
                          size="sm"
                          className="shrink-0 whitespace-nowrap"
                        >
                          {m.type_inscription === "inscrit" ? "Inscrit" : "Réinscrit"}
                        </Badge>
                      </div>

                      <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between text-xs text-[#737373] dark:text-[#A3A3A3]">
                        <span>Inscrit par : <strong className="text-[#171717] dark:text-white">{m.added_by_name || "Système"}</strong></span>
                        <Badge variant="cjp" size="sm" dot className="shrink-0">
                          {m.status || "Actif"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VUE TABLETTE & DESKTOP (Tableau complet) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F7F7] dark:bg-[#1f1f1f] border-b border-[#E5E5E5] dark:border-[#383838] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Adhérent</th>
                        <th className="px-6 py-3.5">Classe & Section</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Inscrit par</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80">
                          <td className="px-6 py-4 font-medium text-[#171717] dark:text-white">
                            {m.first_name} {m.last_name}
                          </td>
                          <td className="px-6 py-4">
                            <div>{m.licence} - {m.programme}</div>
                            {m.section && (
                              <div className="text-xs text-[#FFA500] font-medium mt-0.5">{m.section}</div>
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
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
