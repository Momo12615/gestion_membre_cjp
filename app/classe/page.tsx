import { getSession, createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getClasseDashboardData } from "@/lib/dashboard-data";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { InscriptionModal } from "@/components/classe/inscription-modal";
import { EditMemberModal } from "@/components/members/edit-member-modal";
import { MemberDeleteButton } from "@/components/members/member-delete-button";
import { Membre } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  UserPlus,
  UserCheck,
  Coins,
  Lock,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Espace Chef de Classe - CJP",
  description: "Portail dédié au Chef de classe pour la gestion des adhérents et encaissements de sa promotion",
};

export default async function ClasseDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.permission_code !== "CHEF_DE_CLASSE" && session.permission_code !== "ADMIN") {
    redirect("/profil");
  }

  // Récupération des informations de classe en temps réel depuis la base de données
  let chefLicence = session.licence;
  let chefProgramme = session.programme;
  let chefFirstName = session.first_name;
  let chefLastName = session.last_name;

  try {
    const userRes = await db.execute({
      sql: "SELECT licence, programme, first_name, last_name FROM user WHERE id = ? LIMIT 1;",
      args: [session.id],
    });
    if (userRes.rows.length > 0) {
      const dbRow = userRes.rows[0];
      if (dbRow.licence) chefLicence = dbRow.licence as string;
      if (dbRow.programme) chefProgramme = dbRow.programme as string;
      if (dbRow.first_name) chefFirstName = dbRow.first_name as string;
      if (dbRow.last_name) chefLastName = dbRow.last_name as string;
    }
  } catch (err) {
    console.error("Erreur récupération classe en BDD:", err);
  }

  // Fallbacks sécurisés
  chefLicence = chefLicence || "L2";
  chefProgramme = chefProgramme || "Génie Logiciel";

  // Auto-guérison de la session si le cookie était incomplet ou désynchronisé
  if (
    session.licence !== chefLicence ||
    session.programme !== chefProgramme ||
    session.first_name !== chefFirstName ||
    session.last_name !== chefLastName
  ) {
    session.licence = chefLicence;
    session.programme = chefProgramme;
    session.first_name = chefFirstName;
    session.last_name = chefLastName;
    try {
      await createSession(session);
    } catch (_) {}
  }

  const { inscriptionsOpen, members, totalVerse = 0, versements = [] } =
    await getClasseDashboardData(session);

  // Calculs financiers officiels CJP (20K Inscription / 10K Réinscription)
  const inscritsCount = members.filter((m) => m.type_inscription === "inscrit").length;
  const totalInscriptions = inscritsCount * TARIF_INSCRIPTION;

  const reinscritsCount = members.filter((m) => m.type_inscription === "reinscrit").length;
  const totalReinscriptions = reinscritsCount * TARIF_REINSCRIPTION;

  const totalCollecte = totalInscriptions + totalReinscriptions;
  const soldeRestant = Math.max(0, totalCollecte - totalVerse);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#171717] text-[#171717] dark:text-white transition-colors duration-200">
      <Navbar user={session} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* EN-TÊTE DE L'ESPACE CHEF DE CLASSE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#383838]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white">
                Espace Chef de Classe
              </h1>
              <Badge variant="cjp" size="md" dot>
                {chefLicence} - {chefProgramme}
              </Badge>
              {!inscriptionsOpen && (
                <Badge variant="error" size="md">
                  Inscriptions Clôturées
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3]">
              Chef responsable :{" "}
              <strong className="text-[#171717] dark:text-white">
                {session.first_name ? `${session.first_name} ${session.last_name}` : session.email}
              </strong>{" "}
              • Gestion exclusive des étudiants de votre promotion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bouton Inscrire un étudiant : affiché ou masqué selon le statut de campagne */}
            {inscriptionsOpen ? (
              <InscriptionModal
                chefLicence={chefLicence}
                chefProgramme={chefProgramme}
              />
            ) : (
              <div className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-[#DC2626] dark:text-red-400 flex items-center gap-2 font-medium">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Campagne clôturée par l&apos;Admin</span>
              </div>
            )}

            <LogoutButton />
          </div>
        </div>

        {/* ALERTE SI CAMPAGNE FERMÉE */}
        {!inscriptionsOpen && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Période d&apos;inscription clôturée :</span> L&apos;administrateur a mis fin à la phase d&apos;adhésion. Le formulaire d&apos;inscription est temporairement verrouillé. Vous conservez l&apos;accès complet à votre historique et vos comptes.
            </div>
          </div>
        )}

        {/* CARTES KPI FINANCIÈRES & STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. MONTANT TOTAL COLLECTÉ */}
          <Card className="border-l-4 border-l-[#FFA500] bg-gradient-to-br from-white to-[#FFF4D6]/30 dark:from-[#222222] dark:to-[#FFA500]/5 shadow-sm">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-medium uppercase tracking-wider">
                  Montant Total Collecté
                </p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-[#FFA500] mt-1">
                  {totalCollecte.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1 font-mono">
                  {members.length} cotisation(s) reçue(s)
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFA500] text-[#171717] flex items-center justify-center shadow-md shadow-[#FFA500]/25 shrink-0">
                <Coins className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* 2. MONTANT DÉJÀ VERSÉ AUX ADMINS */}
          <Card className="border-l-4 border-l-[#16A34A] bg-gradient-to-br from-white to-emerald-50/30 dark:from-[#222222] dark:to-emerald-950/10 shadow-sm">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium uppercase tracking-wider">
                  Montant Déjà Versé
                </p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 mt-1">
                  {totalVerse.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1 font-mono">
                  {versements.length} remise(s) validée(s) par l&apos;admin
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* 3. RESTE À VERSER (SOLDE RESTANT) */}
          <Card
            className={cn(
              "border-l-4 shadow-sm bg-gradient-to-br from-white dark:from-[#222222]",
              soldeRestant === 0 && totalCollecte > 0
                ? "border-l-emerald-500 to-emerald-50/20 dark:to-emerald-950/10"
                : "border-l-[#EAB308] to-amber-50/20 dark:to-amber-950/10"
            )}
          >
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-medium uppercase tracking-wider">
                  Reste à Verser
                </p>
                <p
                  className={cn(
                    "font-heading font-bold text-2xl sm:text-3xl mt-1 font-mono",
                    soldeRestant === 0 && totalCollecte > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {soldeRestant.toLocaleString("fr-FR")} GNF
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1">
                  {soldeRestant === 0 && totalCollecte > 0
                    ? "Comptes à jour avec le club ✅"
                    : "Solde restant en votre possession"}
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                  soldeRestant === 0 && totalCollecte > 0
                    ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                <Receipt className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* 4. CLASSE & PROMOTION VERROUILLÉE */}
          <Card className="border-l-4 border-l-[#2563EB] shadow-sm">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] font-medium uppercase tracking-wider">
                  Classe Verrouillée
                </p>
                <p className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white mt-1 truncate">
                  {chefLicence} {chefProgramme}
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1">
                  Périmètre strict CJP
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BANDEAU DÉTAILS DES ADHÉSIONS (INSCRIPTIONS VS RÉINSCRIPTIONS) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E5E5E5] dark:border-[#383838] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FFA500]" />
            <span className="text-[#737373] dark:text-[#A3A3A3]">
              Répartition des encaissements étudiants :
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono font-medium">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
              Inscriptions (20K) : {inscritsCount} = {totalInscriptions.toLocaleString("fr-FR")} GNF
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              Réinscriptions (10K) : {reinscritsCount} = {totalReinscriptions.toLocaleString("fr-FR")} GNF
            </span>
          </div>
        </div>

        {/* HISTORIQUE DES VERSEMENTS VALIDÉS PAR LES ADMINS (SI EXISTANTS) */}
        {versements.length > 0 && (
          <Card>
            <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#383838] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base">
                    Historique de vos Remises de Fonds aux Administrateurs ({versements.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reçus officiels validés par l&apos;administration lors de la transmission des cotisations.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="success" size="md" className="shrink-0 self-start sm:self-auto font-mono">
                Total Versé : {totalVerse.toLocaleString("fr-FR")} GNF
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                {versements.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                          +{v.amount.toLocaleString("fr-FR")} GNF
                        </span>
                        <Badge variant="outline" size="sm" className="text-[10px]">
                          Reçu Validé
                        </Badge>
                      </div>
                      <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] flex flex-wrap items-center gap-2">
                        <span>
                          Encaissé par :{" "}
                          <strong className="text-[#171717] dark:text-white font-medium">
                            {v.recorded_by_name || "Administration CJP"}
                          </strong>
                        </span>
                        {v.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-[#FFA500]">
                              &ldquo;{v.notes}&rdquo;
                            </span>
                          </>
                        )}
                      </div>
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
            </CardContent>
          </Card>
        )}

        {/* LISTE DES MEMBRES INSCRITS PAR CE CHEF DE CLASSE */}
        <Card>
          <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] dark:border-[#383838] pb-4">
            <div>
              <CardTitle>Étudiants Inscrits par Vous ({members.length})</CardTitle>
              <CardDescription>
                Seuls les étudiants que vous avez vous-même inscrits ou réinscrits apparaissent dans cette liste.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="md">
                Tarifs : 20K Inscription / 10K Réinscription
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500]">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="font-heading font-semibold text-lg text-[#171717] dark:text-white">
                  Aucun étudiant enregistré pour l&apos;instant
                </h4>
                <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] max-w-md">
                  {inscriptionsOpen
                    ? "Cliquez sur le bouton « Inscrire un étudiant » en haut à droite pour enregistrer le premier membre de votre classe."
                    : "Les inscriptions sont actuellement fermées."}
                </p>
                {inscriptionsOpen && (
                  <div className="pt-2">
                    <InscriptionModal
                      chefLicence={chefLicence}
                      chefProgramme={chefProgramme}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* VUE MOBILE (Cartes pleine largeur pour smartphones) */}
                <div className="block md:hidden sm:p-4 space-y-1.5">
                  {members.map((m) => {
                    const montant = m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION;
                    return (
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
                        </div>

                        <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#383838] flex items-center justify-between">
                          <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                            Montant perçu :
                          </span>
                          <span className="font-heading font-bold text-sm text-[#FFA500] font-mono">
                            {montant.toLocaleString("fr-FR")} GNF
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 text-xs text-[#737373] dark:text-[#A3A3A3] pt-0.5">
                          {m.email && (
                            <a
                              href={`mailto:${m.email}`}
                              className="flex items-center gap-1.5 hover:text-[#FFA500] transition-colors truncate"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#FFA500] shrink-0" />
                              <span className="truncate">{m.email}</span>
                            </a>
                          )}
                          {m.phone && (
                            <a
                              href={`tel:${m.phone}`}
                              className="flex items-center gap-1.5 hover:text-[#FFA500] transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#FFA500] shrink-0" />
                              <span>{m.phone}</span>
                            </a>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#FFA500]" />
                            {m.joined_at ? new Date(m.joined_at).toLocaleDateString("fr-FR") : "N/A"}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="cjp" size="sm" dot className="shrink-0">
                              {m.status || "Actif"}
                            </Badge>
                            <div className="flex items-center gap-1 pl-1.5 border-l border-[#E5E5E5] dark:border-[#383838]">
                              <EditMemberModal member={m} canChangeClass={false} />
                              <MemberDeleteButton id={m.id} name={`${m.first_name} ${m.last_name}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* VUE TABLETTE & DESKTOP (Tableau complet) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F7F7] dark:bg-[#1f1f1f] border-b border-[#E5E5E5] dark:border-[#383838] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Étudiant</th>
                        <th className="px-6 py-3.5">Classe</th>
                        <th className="px-6 py-3.5">Type & Tarif</th>
                        <th className="px-6 py-3.5">Montant Perçu</th>
                        <th className="px-6 py-3.5">Date d&apos;adhésion</th>
                        <th className="px-6 py-3.5">Statut</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                      {members.map((m) => {
                        const montant = m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION;
                        return (
                          <tr key={m.id} className="hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-[#171717] dark:text-white">
                                {m.first_name} {m.last_name}
                              </div>
                              <div className="text-xs text-[#737373] dark:text-[#A3A3A3] flex items-center gap-2 mt-0.5">
                                {m.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-[#FFA500]" />
                                    {m.email}
                                  </span>
                                )}
                                {m.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#FFA500]" />
                                    {m.phone}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-[#171717] dark:text-white">
                                {m.licence} - {m.programme}
                              </div>
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
                                {m.type_inscription === "inscrit" ? "Inscription" : "Réinscription"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-[#171717] dark:text-[#FFA500]">
                              {montant.toLocaleString("fr-FR")} GNF
                            </td>
                            <td className="px-6 py-4 text-xs text-[#737373] dark:text-[#A3A3A3]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#FFA500]" />
                                {m.joined_at ? new Date(m.joined_at).toLocaleDateString("fr-FR") : "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="cjp" size="sm" dot>
                                {m.status || "Actif"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <EditMemberModal member={m} canChangeClass={false} />
                                <MemberDeleteButton id={m.id} name={`${m.first_name} ${m.last_name}`} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
