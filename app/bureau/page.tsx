import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBureauDashboardData } from "@/lib/dashboard-data";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { CreateMemberModal } from "@/components/admin/create-member-modal";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { BureauMembersView } from "@/components/bureau/bureau-members-view";
import {
  Users,
  UserPlus,
  UserCheck,
  Coins,
  CheckCircle2,
  Receipt,
  Calendar,
  ShieldCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";

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

  const { inscriptionsOpen, members, totalVerse = 0, versements = [] } =
    await getBureauDashboardData(session);

  const userDisplayName =
    session.first_name || session.last_name
      ? `${session.first_name || ""} ${session.last_name || ""}`.trim()
      : session.email.split("@")[0];

  const userInitials =
    (session.first_name?.[0] || "") + (session.last_name?.[0] || "") ||
    session.email[0].toUpperCase();

  // Statistiques globales de l'association
  const totalInscrits = members.filter((m) => m.type_inscription === "inscrit").length;
  const totalReinscrits = members.filter((m) => m.type_inscription === "reinscrit").length;

  // Calculs financiers personnels du membre du Bureau (basés sur les inscriptions qu'il a lui-même effectuées)
  const myMembers = members.filter((m) => m.added_by === session.id);
  const myInscrits = myMembers.filter((m) => m.type_inscription === "inscrit").length;
  const myReinscrits = myMembers.filter((m) => m.type_inscription === "reinscrit").length;
  const myCollecte = myInscrits * TARIF_INSCRIPTION + myReinscrits * TARIF_REINSCRIPTION;
  const myReste = Math.max(0, myCollecte - totalVerse);

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
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-bold text-lg sm:text-2xl text-[#171717] dark:text-white truncate">
                    {userDisplayName}
                  </h1>
                  <Badge variant="warning" size="sm" className="shrink-0">
                    Bureau Exécutif
                  </Badge>
                  {!inscriptionsOpen && (
                    <Badge variant="error" size="sm">
                      Campagne Clôturée
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFA500] shrink-0" />
                  <span className="truncate">Accès Global • Inscriptions tous niveaux & programmes</span>
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

          {/* Bouton d'action principal : Inscrire un membre */}
          <div className="mt-4 pt-3.5 border-t border-[#E5E5E5]/70 dark:border-white/[0.06]">
            {inscriptionsOpen ? (
              <CreateMemberModal
                size="lg"
                className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FFA500] via-[#FFB800] to-[#FF8C00] text-[#171717] shadow-lg shadow-[#FFA500]/20 hover:shadow-xl hover:shadow-[#FFA500]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              />
            ) : (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-[#DC2626] dark:text-red-400 flex items-center justify-center gap-2 font-medium">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Campagne d&apos;inscription actuellement clôturée par l&apos;Administration</span>
              </div>
            )}
          </div>
        </div>

        {/* ALERTE SI CAMPAGNE FERMÉE */}
        {!inscriptionsOpen && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Inscriptions closes :</span> L&apos;administration a suspendu temporairement les adhésions. Le registre reste accessible pour consultation et régularisation des versements.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CARTES KPI FINANCIÈRES & SUPERVISION (4 COLONNES)                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. MONTANT TOTAL COLLECTÉ PAR L'UTILISATEUR */}
          <Card className="border-l-4 border-l-[#FFA500] bg-white/90 dark:bg-[#1A1A1A]/90 shadow-sm">
            <CardContent className="p-3.5 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] font-medium uppercase truncate">
                  Collecté par Vous
                </p>
                <p className="font-heading font-bold text-base sm:text-xl text-[#171717] dark:text-[#FFA500] mt-0.5 font-mono truncate">
                  {myCollecte.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5 font-mono truncate">
                  {myMembers.length} inscrit(s) par vous
                </p>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFA500] text-[#171717] flex items-center justify-center shadow-md shadow-[#FFA500]/25 shrink-0">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>

          {/* 2. DÉJÀ VERSÉ EN CAISSE */}
          <Card className="border-l-4 border-l-[#16A34A] bg-white/90 dark:bg-[#1A1A1A]/90 shadow-sm">
            <CardContent className="p-3.5 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium uppercase truncate">
                  Déjà Versé
                </p>
                <p className="font-heading font-bold text-base sm:text-xl text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono truncate">
                  {totalVerse.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5 font-mono truncate">
                  {versements.length} remise(s) validée(s)
                </p>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>

          {/* 3. RESTE À VERSER (SOLDE EN MAIN) */}
          <Card
            className={`border-l-4 bg-white/90 dark:bg-[#1A1A1A]/90 shadow-sm ${
              myReste > 0
                ? "border-l-amber-500"
                : "border-l-emerald-500"
            }`}
          >
            <CardContent className="p-3.5 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] font-medium uppercase truncate">
                  Reste à Verser
                </p>
                <p
                  className={`font-heading font-bold text-base sm:text-xl mt-0.5 font-mono truncate ${
                    myReste > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {myReste.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5 truncate">
                  {myReste === 0 && myCollecte > 0 ? "Tout est à jour ✅" : "Solde en main"}
                </p>
              </div>
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                  myReste > 0
                    ? "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>

          {/* 4. TOTAL ADHÉRENTS CLUB */}
          <Card className="border-l-4 border-l-blue-500 bg-white/90 dark:bg-[#1A1A1A]/90 shadow-sm">
            <CardContent className="p-3.5 sm:p-5 flex items-center justify-between gap-1.5">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium uppercase truncate">
                  Total Club CJP
                </p>
                <p className="font-heading font-bold text-base sm:text-xl text-[#171717] dark:text-white mt-0.5 font-mono truncate">
                  {members.length} membres
                </p>
                <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5 truncate">
                  {totalInscrits} inscrits • {totalReinscrits} réinscrits
                </p>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* HISTORIQUE DES REÇUS DE VERSEMENTS VALIDÉS PAR L'ADMINISTRATION           */}
        {/* ========================================================================= */}
        {versements.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-[#1c1c1c] p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#333333] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white">
                    Reçus de Versements Validés ({versements.length})
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                    Remises de fonds enregistrées et validées par l&apos;administration CJP.
                  </p>
                </div>
              </div>
              <Badge variant="success" size="sm" className="font-mono">
                Total : {totalVerse.toLocaleString("fr-FR")} GNF
              </Badge>
            </div>

            <div className="divide-y divide-[#E5E5E5] dark:divide-[#333333]">
              {versements.map((v) => (
                <div
                  key={v.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                        +{v.amount.toLocaleString("fr-FR")} GNF
                      </span>
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        Validé par {v.recorded_by_name || "Admin"}
                      </Badge>
                    </div>
                    {v.notes && (
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] italic">
                        &ldquo;{v.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#FFA500]" />
                    <span>
                      {new Date(v.created_at).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(v.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUPERVISION & GESTION DES MEMBRES AVEC RECHERCHE ET FILTRE SCOPE          */}
        {/* ========================================================================= */}
        <BureauMembersView members={members} currentUserId={session.id} />
      </main>

      <Footer />
    </div>
  );
}
