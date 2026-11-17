"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Search,
  Coins,
  Receipt,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Membre, Organisateur, PermissionCode, SECTIONS_FORMATION, Versement } from "@/lib/types";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateUserModal } from "@/components/admin/create-user-modal";
import { InviteChefModal } from "@/components/admin/invite-chef-modal";
import { CreateOrganisateurModal } from "@/components/admin/create-organisateur-modal";
import { EditOrganisateurModal } from "@/components/admin/edit-organisateur-modal";
import { CreateMemberModal } from "@/components/admin/create-member-modal";
import { EditMemberModal } from "@/components/members/edit-member-modal";
import { MemberDeleteButton } from "@/components/members/member-delete-button";
import { UserToggleButton } from "@/components/admin/user-toggle-button";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import { OrganisateurDeleteButton } from "@/components/admin/organisateur-delete-button";
import { InviteOrganisateurButton } from "@/components/admin/invite-organisateur-button";
import { RecordVersementModal } from "@/components/admin/record-versement-modal";

interface AdminUserItem {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  permission_id: number;
  permission_code: PermissionCode;
  permission_name: string;
  first_name?: string | null;
  last_name?: string | null;
  licence?: string | null;
  programme?: string | null;
  phone?: string | null;
  classe?: string | null;
}

interface AdminTabsViewProps {
  users: AdminUserItem[];
  organisateurs: Organisateur[];
  members: Membre[];
  versements?: Versement[];
}

export function AdminTabsView({
  users,
  organisateurs,
  members,
  versements = [],
}: AdminTabsViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "organisateurs" | "members" | "versements">("organisateurs");

  // Filtres pour les versements
  const [versementSearch, setVersementSearch] = useState("");

  // Chefs de classe
  const chefsDeClasse = useMemo(() => {
    return users.filter((u) => u.permission_code === "CHEF_DE_CLASSE");
  }, [users]);

  // Filtres pour les utilisateurs
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  // Filtres pour les organisateurs
  const [orgaSearch, setOrgaSearch] = useState("");

  // Filtres pour les membres
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("ALL");
  const [memberSectionFilter, setMemberSectionFilter] = useState<string>("ALL");

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.first_name && u.first_name.toLowerCase().includes(q)) ||
        (u.last_name && u.last_name.toLowerCase().includes(q)) ||
        (u.classe && u.classe.toLowerCase().includes(q));

      const matchRole =
        userRoleFilter === "ALL" || u.permission_code === userRoleFilter;

      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Filtrage des organisateurs
  const filteredOrganisateurs = useMemo(() => {
    return organisateurs.filter((o) => {
      const q = orgaSearch.toLowerCase().trim();
      return (
        !q ||
        o.first_name.toLowerCase().includes(q) ||
        o.last_name.toLowerCase().includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        o.role.toLowerCase().includes(q) ||
        (o.phone && o.phone.toLowerCase().includes(q))
      );
    });
  }, [organisateurs, orgaSearch]);

  // Filtrage des membres
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = memberSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.licence && m.licence.toLowerCase().includes(q)) ||
        (m.programme && m.programme.toLowerCase().includes(q));

      const matchType =
        memberTypeFilter === "ALL" || m.type_inscription === memberTypeFilter;

      const matchSection =
        memberSectionFilter === "ALL" || m.section === memberSectionFilter;

      return matchSearch && matchType && matchSection;
    });
  }, [members, memberSearch, memberTypeFilter, memberSectionFilter]);

  // Helper couleur pour la section
  const getSectionBadgeClass = (sec?: string | null) => {
    if (!sec) return "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300";
    if (sec.includes("Mobile") || sec.includes("Web")) {
      return "border-[#FFA500]/40 bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500]";
    }
    if (sec.includes("Réseau") || sec.includes("Cyber")) {
      return "border-blue-400/40 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400";
    }
    return "border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* BARRE D'ONGLETS SUPÉRIEURE (GRILLE ADAPTÉE 100% MOBILE & DESKTOP) */}
      <div className="bg-[#F7F7F7] dark:bg-[#1a1a1a] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#E5E5E5] dark:border-[#383838] grid grid-cols-2 sm:grid-cols-4 gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("organisateurs")}
          className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-heading text-[11px] sm:text-sm font-semibold transition-all ${
            activeTab === "organisateurs"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Comité</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E5E5E5] dark:bg-[#383838] text-[#171717] dark:text-white shrink-0">
            {organisateurs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-heading text-[11px] sm:text-sm font-semibold transition-all ${
            activeTab === "users"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Comptes</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E5E5E5] dark:bg-[#383838] text-[#171717] dark:text-white shrink-0">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-heading text-[11px] sm:text-sm font-semibold transition-all ${
            activeTab === "members"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Membres</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E5E5E5] dark:bg-[#383838] text-[#171717] dark:text-white shrink-0">
            {members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("versements")}
          className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-heading text-[11px] sm:text-sm font-semibold transition-all ${
            activeTab === "versements"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FFA500]" />
          <span className="truncate">Versements</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#FFA500]/20 text-[#FFA500] font-bold shrink-0">
            {versements.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ONGLET 1 : GESTION DES ORGANISATEURS (COMITÉ CJP)                        */}
      {/* ========================================================================= */}
      {activeTab === "organisateurs" && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 border-b border-[#E5E5E5] dark:border-[#383838]">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base">
                  Comité & Organisateurs CJP ({filteredOrganisateurs.length})
                </CardTitle>
                <Badge variant="cjp" size="sm">
                  Officiel
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Cliquez sur le crayon pour ajouter la photo, l&apos;email ou le contact de chaque responsable.
              </CardDescription>
            </div>
            <div>
              <CreateOrganisateurModal />
            </div>
          </CardHeader>

          {/* BARRE DE RECHERCHE ORGANISATEUR */}
          <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838]">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <Input
                placeholder="Rechercher par nom ou poste..."
                value={orgaSearch}
                onChange={(e) => setOrgaSearch(e.target.value)}
                className="pl-8 text-xs py-1.5"
              />
            </div>
          </div>

          <CardContent className="p-2.5 sm:p-5">
            {filteredOrganisateurs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                Aucun organisateur ne correspond à la recherche.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                {filteredOrganisateurs.map((orga) => (
                  <div
                    key={orga.id}
                    className="group relative rounded-xl sm:rounded-2xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1e1e1e] p-3 sm:p-4 flex flex-col justify-between hover:border-[#FFA500]/60 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* PHOTO / AVATAR */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#F7F7F7] dark:bg-[#2a2a2a] border border-[#E5E5E5] dark:border-[#383838] shrink-0">
                        {orga.photo_url ? (
                          <img
                            src={orga.photo_url}
                            alt={`${orga.first_name} ${orga.last_name}`}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-heading font-bold text-base sm:text-lg text-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15">
                            {orga.first_name.charAt(0)}
                            {orga.last_name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* INFOS */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white break-words">
                          {orga.first_name} {orga.last_name}
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#FFA500] mt-0.5 line-clamp-2">
                          {orga.role}
                        </p>

                        {orga.email ? (
                          <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3] font-mono truncate mt-0.5">
                            {orga.email}
                          </p>
                        ) : (
                          <span className="inline-block text-[9px] text-[#737373]/80 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded mt-1">
                            Contact à renseigner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PIED DE CARTE ORGANISATEUR */}
                    <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between text-xs">
                      {orga.phone ? (
                        <a
                          href={`tel:${orga.phone}`}
                          className="flex items-center gap-1 text-[11px] text-[#737373] hover:text-[#FFA500] dark:text-[#A3A3A3] dark:hover:text-[#FFA500] transition-colors truncate max-w-[130px]"
                        >
                          <Phone className="w-3 h-3 text-[#FFA500] shrink-0" />
                          <span className="truncate">{orga.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#737373]/60 italic">
                          Tél. non défini
                        </span>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        <InviteOrganisateurButton organisateur={orga} />
                        <EditOrganisateurModal organisateur={orga} />
                        <OrganisateurDeleteButton
                          id={orga.id}
                          name={`${orga.first_name} ${orga.last_name}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 2 : GESTION DES UTILISATEURS & CHEFS DE CLASSE                     */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 border-b border-[#E5E5E5] dark:border-[#383838]">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base">
                  Gestion des Comptes Utilisateurs ({filteredUsers.length})
                </CardTitle>
                <Badge variant="cjp" size="sm">
                  Accès
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Comptes administrateurs, bureau et chefs de classe.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <InviteChefModal />
              <CreateUserModal />
            </div>
          </CardHeader>

          {/* BARRE DE RECHERCHE & FILTRE RÔLE */}
          <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <Input
                placeholder="Rechercher nom, email, classe..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 text-xs py-1.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#737373] dark:text-[#A3A3A3] whitespace-nowrap">
                Rôle :
              </span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#171717] dark:text-white"
              >
                <option value="ALL">Tous</option>
                <option value="CHEF_DE_CLASSE">Chefs de classe</option>
                <option value="BUREAU">Bureau</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                Aucun utilisateur trouvé pour ces critères.
              </div>
            ) : (
              <>
                {/* VUE MOBILE : Cartes Utilisateurs */}
                <div className="block sm:hidden p-2.5 space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7]/80 dark:bg-[#1c1c1c] space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-semibold text-xs text-[#171717] dark:text-white break-words">
                            {u.first_name || u.last_name
                              ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                              : "Sans nom"}
                          </h4>
                          <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] font-mono break-all mt-0.5">
                            {u.email}
                          </p>
                        </div>
                        <Badge
                          variant={u.is_active ? "success" : "error"}
                          size="sm"
                          dot
                          className="shrink-0"
                        >
                          {u.is_active ? "Actif" : "Bloqué"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E5E5E5]/60 dark:border-[#333333]">
                        <span className="text-[#737373] dark:text-[#A3A3A3]">Rôle :</span>
                        <Badge
                          variant={
                            u.permission_code === "ADMIN"
                              ? "cjp"
                              : u.permission_code === "BUREAU"
                              ? "info"
                              : "outline"
                          }
                          size="sm"
                        >
                          {u.permission_name || u.permission_code}
                        </Badge>
                      </div>

                      {u.permission_code === "CHEF_DE_CLASSE" && (() => {
                        const chefMembers = members.filter(
                          (m) =>
                            m.added_by === u.id ||
                            (u.licence && u.programme && m.licence === u.licence && m.programme === u.programme)
                        );
                        const chefCollecte = chefMembers.reduce(
                          (acc, m) =>
                            acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                          0
                        );
                        const chefVersements = versements.filter((v) => v.chef_id === u.id);
                        const chefTotalVerse = chefVersements.reduce((acc, v) => acc + v.amount, 0);
                        const chefReste = Math.max(0, chefCollecte - chefTotalVerse);

                        return (
                          <div className="pt-2 border-t border-[#E5E5E5]/60 dark:border-[#333333] space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#737373] dark:text-[#A3A3A3]">Classe :</span>
                              <span className="font-mono font-semibold text-[#FFA500] px-1.5 py-0.5 rounded bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 shrink-0">
                                {u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                              <div className="p-1 rounded bg-[#F7F7F7] dark:bg-[#252525]">
                                <div className="text-[#737373] dark:text-[#A3A3A3]">Collecté</div>
                                <div className="font-bold text-[#171717] dark:text-white font-mono">{chefCollecte.toLocaleString("fr-FR")}</div>
                              </div>
                              <div className="p-1 rounded bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                                <div>Versé</div>
                                <div className="font-bold font-mono">{chefTotalVerse.toLocaleString("fr-FR")}</div>
                              </div>
                              <div className="p-1 rounded bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                                <div>Reste</div>
                                <div className="font-bold font-mono">{chefReste.toLocaleString("fr-FR")}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-end gap-1.5">
                        {u.permission_code === "CHEF_DE_CLASSE" && (() => {
                          const chefMembers = members.filter(
                            (m) =>
                              m.added_by === u.id ||
                              (u.licence && u.programme && m.licence === u.licence && m.programme === u.programme)
                          );
                          const chefCollecte = chefMembers.reduce(
                            (acc, m) =>
                              acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                            0
                          );
                          const chefVersements = versements.filter((v) => v.chef_id === u.id);
                          const chefTotalVerse = chefVersements.reduce((acc, v) => acc + v.amount, 0);

                          return (
                            <RecordVersementModal
                              chefId={u.id}
                              chefName={
                                u.first_name || u.last_name
                                  ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                  : u.email
                              }
                              chefEmail={u.email}
                              classeName={u.classe || `${u.licence || "L2"} ${u.programme || ""}`}
                              totalCollecte={chefCollecte}
                              totalVerse={chefTotalVerse}
                              versements={chefVersements}
                            />
                          );
                        })()}
                        <EditUserModal user={u} />
                        <UserToggleButton
                          userId={u.id}
                          isActive={u.is_active}
                          userEmail={u.email}
                        />
                        <UserDeleteButton
                          id={u.id}
                          name={
                            u.first_name || u.last_name
                              ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                              : u.email
                          }
                          email={u.email}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* VUE DESKTOP : Tableau Utilisateurs */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F7F7] dark:bg-[#1f1f1f] border-b border-[#E5E5E5] dark:border-[#383838] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Utilisateur</th>
                        <th className="px-6 py-3.5">Rôle</th>
                        <th className="px-6 py-3.5">Classe assignée</th>
                        <th className="px-6 py-3.5">Statut</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-[#171717] dark:text-white">
                              {u.first_name || u.last_name
                                ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                : "Compte Utilisateur"}
                            </div>
                            <div className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono mt-0.5">
                              {u.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                u.permission_code === "ADMIN"
                                  ? "cjp"
                                  : u.permission_code === "BUREAU"
                                  ? "info"
                                  : "outline"
                              }
                              size="sm"
                            >
                              {u.permission_name || u.permission_code}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {u.permission_code === "CHEF_DE_CLASSE" ? (() => {
                              const chefMembers = members.filter(
                                (m) =>
                                  m.added_by === u.id ||
                                  (u.licence && u.programme && m.licence === u.licence && m.programme === u.programme)
                              );
                              const chefCollecte = chefMembers.reduce(
                                (acc, m) =>
                                  acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                                0
                              );
                              const chefVersements = versements.filter((v) => v.chef_id === u.id);
                              const chefTotalVerse = chefVersements.reduce((acc, v) => acc + v.amount, 0);
                              const chefReste = Math.max(0, chefCollecte - chefTotalVerse);

                              return (
                                <div className="space-y-1">
                                  <span className="font-mono font-semibold text-[#FFA500] px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 inline-block">
                                    {u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`}
                                  </span>
                                  <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] flex items-center gap-1.5 font-mono">
                                    <span>Versé : <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{chefTotalVerse.toLocaleString("fr-FR")}</strong></span>
                                    <span>•</span>
                                    <span>Reste : <strong className="text-amber-600 dark:text-amber-400 font-semibold">{chefReste.toLocaleString("fr-FR")}</strong></span>
                                  </div>
                                </div>
                              );
                            })() : (
                              <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                                Accès Global
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={u.is_active ? "success" : "error"}
                              size="sm"
                              dot
                            >
                              {u.is_active ? "Actif" : "Bloqué"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 shrink-0">
                              {u.permission_code === "CHEF_DE_CLASSE" && (() => {
                                const chefMembers = members.filter(
                                  (m) =>
                                    m.added_by === u.id ||
                                    (u.licence && u.programme && m.licence === u.licence && m.programme === u.programme)
                                );
                                const chefCollecte = chefMembers.reduce(
                                  (acc, m) =>
                                    acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                                  0
                                );
                                const chefVersements = versements.filter((v) => v.chef_id === u.id);
                                const chefTotalVerse = chefVersements.reduce((acc, v) => acc + v.amount, 0);

                                return (
                                  <RecordVersementModal
                                    chefId={u.id}
                                    chefName={
                                      u.first_name || u.last_name
                                        ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                        : u.email
                                    }
                                    chefEmail={u.email}
                                    classeName={u.classe || `${u.licence || "L2"} ${u.programme || ""}`}
                                    totalCollecte={chefCollecte}
                                    totalVerse={chefTotalVerse}
                                    versements={chefVersements}
                                  />
                                );
                              })()}
                              <EditUserModal user={u} />
                              <UserToggleButton
                                userId={u.id}
                                isActive={u.is_active}
                                userEmail={u.email}
                              />
                              <UserDeleteButton
                                id={u.id}
                                name={
                                  u.first_name || u.last_name
                                    ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                    : u.email
                                }
                                email={u.email}
                              />
                            </div>
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
      )}

      {/* ========================================================================= */}
      {/* ONGLET 3 : GESTION DES MEMBRES & INSCRIPTIONS DIRECTES                    */}
      {/* ========================================================================= */}
      {activeTab === "members" && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 border-b border-[#E5E5E5] dark:border-[#383838]">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base">Registre des Membres CJP</CardTitle>
                <Badge variant="cjp" size="sm">
                  {filteredMembers.length} adhérent(s)
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Consultez les membres, filtrez par section de formation et réalisez des inscriptions directes.
              </CardDescription>
            </div>
            <div>
              <CreateMemberModal />
            </div>
          </CardHeader>

          {/* BARRE DE RECHERCHE & MULTI-FILTRES MEMBRE */}
          <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838] flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <Input
                placeholder="Rechercher nom, email, classe..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-8 text-xs py-1.5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* FILTRE SECTION */}
              <select
                value={memberSectionFilter}
                onChange={(e) => setMemberSectionFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#171717] dark:text-white"
              >
                <option value="ALL">Toutes les sections</option>
                {SECTIONS_FORMATION.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* FILTRE TYPE D'INSCRIPTION */}
              <select
                value={memberTypeFilter}
                onChange={(e) => setMemberTypeFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#171717] dark:text-white"
              >
                <option value="ALL">Tous les types</option>
                <option value="inscrit">Inscription (20K)</option>
                <option value="reinscrit">Réinscription (10K)</option>
              </select>
            </div>
          </div>

          <CardContent className="p-0">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                Aucun membre trouvé pour ces critères.
              </div>
            ) : (
              <>
                {/* VUE MOBILE : Cartes Membres */}
                <div className="block md:hidden p-2.5 space-y-2">
                  {filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7]/80 dark:bg-[#1c1c1c] space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white break-words">
                            {m.first_name} {m.last_name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                            <GraduationCap className="w-3 h-3 text-[#FFA500] shrink-0" />
                            <span>
                              {m.licence || "N/A"} - {m.programme || "N/A"}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={m.type_inscription === "inscrit" ? "success" : "warning"}
                          size="sm"
                          className="shrink-0 text-[10px]"
                        >
                          {m.type_inscription === "inscrit" ? "Inscription" : "Réinscription"}
                        </Badge>
                      </div>

                      {/* SECTION DE FORMATION */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getSectionBadgeClass(
                            m.section
                          )}`}
                        >
                          {m.section || "Dev Mobile & Site Web"}
                        </span>
                      </div>

                      {/* CONTACT */}
                      <div className="flex flex-col gap-0.5 text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                        {m.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-[#FFA500] shrink-0" />
                            <span className="truncate">{m.email}</span>
                          </div>
                        )}
                        {m.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#FFA500] shrink-0" />
                            <span>{m.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* BAS DE CARTE */}
                      <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between text-[10px] text-[#737373] dark:text-[#A3A3A3]">
                        <span>
                          Par :{" "}
                          <strong className="text-[#171717] dark:text-white">
                            {m.added_by_name || "Système"}
                          </strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="cjp" size="sm" dot className="shrink-0 text-[10px]">
                            {m.status || "Actif"}
                          </Badge>
                          <div className="flex items-center gap-1 pl-1 border-l border-[#E5E5E5] dark:border-[#383838]">
                            <EditMemberModal member={m} canChangeClass={true} />
                            <MemberDeleteButton id={m.id} name={`${m.first_name} ${m.last_name}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VUE TABLETTE & DESKTOP : Tableau complet */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F7F7F7] dark:bg-[#1f1f1f] border-b border-[#E5E5E5] dark:border-[#383838] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Adhérent</th>
                        <th className="px-6 py-3.5">Classe</th>
                        <th className="px-6 py-3.5">Section de Formation</th>
                        <th className="px-6 py-3.5">Type & Tarif</th>
                        <th className="px-6 py-3.5">Inscrit par</th>
                        <th className="px-6 py-3.5">Statut</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                      {filteredMembers.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors"
                        >
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
                            <div className="flex items-center gap-1.5 font-medium text-[#171717] dark:text-white">
                              <GraduationCap className="w-3.5 h-3.5 text-[#FFA500]" />
                              {m.licence || "N/A"} - {m.programme || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-md border ${getSectionBadgeClass(
                                m.section
                              )}`}
                            >
                              {m.section || "Dev Mobile & Site Web"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={m.type_inscription === "inscrit" ? "success" : "warning"}
                              size="sm"
                            >
                              {m.type_inscription === "inscrit" ? "Inscription" : "Réinscription"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#737373] dark:text-[#A3A3A3]">
                            {m.added_by_name || "Système"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={m.status === "actif" ? "cjp" : "neutral"}
                              size="sm"
                              dot
                            >
                              {m.status || "Actif"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <EditMemberModal member={m} canChangeClass={true} />
                              <MemberDeleteButton id={m.id} name={`${m.first_name} ${m.last_name}`} />
                            </div>
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
      )}

      {/* ========================================================================= */}
      {/* ONGLET 4 : SUIVI DES VERSEMENTS & REMISES DES CHEFS DE CLASSE             */}
      {/* ========================================================================= */}
      {activeTab === "versements" && (() => {
        const totalCollecteChefs = chefsDeClasse.reduce((sum, chef) => {
          const chefMembers = members.filter(
            (m) =>
              m.added_by === chef.id ||
              (chef.licence && chef.programme && m.licence === chef.licence && m.programme === chef.programme)
          );
          return (
            sum +
            chefMembers.reduce(
              (acc, m) =>
                acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
              0
            )
          );
        }, 0);

        const totalVerseChefs = versements.reduce((sum, v) => sum + v.amount, 0);
        const totalResteChefs = Math.max(0, totalCollecteChefs - totalVerseChefs);

        const filteredChefs = chefsDeClasse.filter((chef) => {
          const q = versementSearch.toLowerCase().trim();
          if (!q) return true;
          return (
            chef.email.toLowerCase().includes(q) ||
            (chef.first_name && chef.first_name.toLowerCase().includes(q)) ||
            (chef.last_name && chef.last_name.toLowerCase().includes(q)) ||
            (chef.classe && chef.classe.toLowerCase().includes(q)) ||
            (chef.licence && chef.licence.toLowerCase().includes(q)) ||
            (chef.programme && chef.programme.toLowerCase().includes(q))
          );
        });

        return (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* CARTE EN-TÊTE FINANCIÈRE DE L'ONGLET VERSEMENTS */}
            <Card className="border-[#FFA500]/30 shadow-sm overflow-hidden">
              <CardHeader className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#383838] bg-gradient-to-r from-[#FFF4D6]/30 via-transparent to-transparent dark:from-[#FFA500]/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#FFA500]" />
                        Suivi des Versements & Remises de Fonds
                      </CardTitle>
                      <Badge variant="cjp" size="sm">
                        {chefsDeClasse.length} Chefs
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      Contrôlez les cotisations collectées par chaque chef de classe et enregistrez les montants remis à l&apos;administration.
                    </CardDescription>
                  </div>
                </div>

                {/* 3 STATS CLÉS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-[#E5E5E5] dark:border-[#383838]">
                    <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] uppercase font-medium">
                      Total Collecté (Chefs)
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white mt-0.5 font-mono">
                      {totalCollecteChefs.toLocaleString("fr-FR")} GNF
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-medium">
                      Déjà Versé au Club
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                      {totalVerseChefs.toLocaleString("fr-FR")} GNF
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-amber-200 dark:border-amber-900/50">
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 uppercase font-medium">
                      Reste à Recouvrer
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                      {totalResteChefs.toLocaleString("fr-FR")} GNF
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* BARRE DE RECHERCHE */}
              <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838] flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <Input
                    placeholder="Rechercher un chef de classe, une promotion..."
                    value={versementSearch}
                    onChange={(e) => setVersementSearch(e.target.value)}
                    className="pl-8 text-xs py-1.5"
                  />
                </div>
                <div className="text-xs text-[#737373] dark:text-[#A3A3A3] hidden sm:block font-mono">
                  {filteredChefs.length} classe(s)
                </div>
              </div>

              {/* TABLEAU / CARTES DES CHEFS DE CLASSE */}
              <CardContent className="p-0">
                {filteredChefs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Aucun chef de classe trouvé pour cette recherche.
                  </div>
                ) : (
                  <>
                    {/* VUE MOBILE */}
                    <div className="block md:hidden p-2.5 space-y-2">
                      {filteredChefs.map((chef) => {
                        const chefMembers = members.filter(
                          (m) =>
                            m.added_by === chef.id ||
                            (chef.licence && chef.programme && m.licence === chef.licence && m.programme === chef.programme)
                        );
                        const chefCollecte = chefMembers.reduce(
                          (acc, m) =>
                            acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                          0
                        );
                        const chefVersements = versements.filter((v) => v.chef_id === chef.id);
                        const chefTotalVerse = chefVersements.reduce((acc, v) => acc + v.amount, 0);
                        const chefReste = Math.max(0, chefCollecte - chefTotalVerse);
                        const chefName = chef.first_name || chef.last_name
                          ? `${chef.first_name || ""} ${chef.last_name || ""}`.trim()
                          : chef.email;

                        return (
                          <div
                            key={chef.id}
                            className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] space-y-2.5 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white">
                                  {chefName}
                                </h4>
                                <span className="font-mono text-[11px] font-semibold text-[#FFA500]">
                                  {chef.classe || `${chef.licence || "L2"} ${chef.programme || ""}`}
                                </span>
                              </div>
                              {chefReste === 0 && chefCollecte > 0 ? (
                                <Badge variant="success" size="sm" className="text-[10px]">
                                  À jour ✅
                                </Badge>
                              ) : chefReste > 0 ? (
                                <Badge variant="warning" size="sm" className="text-[10px]">
                                  Reste dû
                                </Badge>
                              ) : null}
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                              <div className="p-1.5 rounded-lg bg-[#F7F7F7] dark:bg-[#252525]">
                                <div className="text-[#737373] dark:text-[#A3A3A3]">Collecté</div>
                                <div className="font-bold font-mono text-[#171717] dark:text-white mt-0.5">
                                  {chefCollecte.toLocaleString("fr-FR")}
                                </div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                                <div>Versé</div>
                                <div className="font-bold font-mono mt-0.5">
                                  {chefTotalVerse.toLocaleString("fr-FR")}
                                </div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                                <div>Reste</div>
                                <div className="font-bold font-mono mt-0.5">
                                  {chefReste.toLocaleString("fr-FR")}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-end">
                              <RecordVersementModal
                                chefId={chef.id}
                                chefName={chefName}
                                chefEmail={chef.email}
                                classeName={chef.classe || `${chef.licence || "L2"} ${chef.programme || ""}`}
                                totalCollecte={chefCollecte}
                                totalVerse={chefTotalVerse}
                                versements={chefVersements}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* VUE TABLETTE & DESKTOP */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#F7F7F7] dark:bg-[#1f1f1f] border-b border-[#E5E5E5] dark:border-[#383838] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                          <tr>
                            <th className="px-6 py-3.5">Chef de Classe</th>
                            <th className="px-6 py-3.5">Classe & Département</th>
                            <th className="px-6 py-3.5">Étudiants</th>
                            <th className="px-6 py-3.5">Total Collecté</th>
                            <th className="px-6 py-3.5">Déjà Versé</th>
                            <th className="px-6 py-3.5">Reste à Verser</th>
                            <th className="px-6 py-3.5 text-right">Action Versement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                          {filteredChefs.map((chef) => {
                            const chefMembers = members.filter(
                              (m) =>
                                m.added_by === chef.id ||
                                (chef.licence && chef.programme && m.licence === chef.licence && m.programme === chef.programme)
                            );
                            const chefCollecte = chefMembers.reduce(
                              (acc, m) =>
                                acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                              0
                            );
                            const chefVersements = versements.filter((v) => v.chef_id === chef.id);
                            const chefTotalVerse = chefVersements.reduce((acc, v) => acc + v.amount, 0);
                            const chefReste = Math.max(0, chefCollecte - chefTotalVerse);
                            const chefName = chef.first_name || chef.last_name
                              ? `${chef.first_name || ""} ${chef.last_name || ""}`.trim()
                              : chef.email;

                            return (
                              <tr
                                key={chef.id}
                                className="hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-[#171717] dark:text-white">
                                    {chefName}
                                  </div>
                                  <div className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono mt-0.5">
                                    {chef.email} {chef.phone ? `• ${chef.phone}` : ""}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-mono font-semibold text-[#FFA500] px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 inline-block">
                                    {chef.classe || `${chef.licence || "L2"} ${chef.programme || ""}`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-medium">
                                  {chefMembers.length} inscrit(s)
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-[#171717] dark:text-white">
                                  {chefCollecte.toLocaleString("fr-FR")} GNF
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {chefTotalVerse.toLocaleString("fr-FR")} GNF
                                </td>
                                <td className="px-6 py-4">
                                  {chefReste === 0 && chefCollecte > 0 ? (
                                    <Badge variant="success" size="sm" className="font-mono">
                                      0 GNF (À jour ✅)
                                    </Badge>
                                  ) : chefReste > 0 ? (
                                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                      {chefReste.toLocaleString("fr-FR")} GNF
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono">
                                      0 GNF
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end">
                                    <RecordVersementModal
                                      chefId={chef.id}
                                      chefName={chefName}
                                      chefEmail={chef.email}
                                      classeName={chef.classe || `${chef.licence || "L2"} ${chef.programme || ""}`}
                                      totalCollecte={chefCollecte}
                                      totalVerse={chefTotalVerse}
                                      versements={chefVersements}
                                    />
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

            {/* JOURNAL GÉNÉRAL DE TOUS LES VERSEMENTS REÇUS */}
            <Card>
              <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#383838]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base">
                      Journal Général des Versements Encaissés ({versements.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Historique de toutes les remises de cotisations remises par les chefs de classe.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="success" size="md" className="font-mono shrink-0 self-start sm:self-auto">
                  Total Encaissé : {totalVerseChefs.toLocaleString("fr-FR")} GNF
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {versements.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Aucun versement n&apos;a encore été enregistré. Cliquez sur « Versements » sur une ligne de chef de classe pour enregistrer la première remise.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                    {versements.map((v) => {
                      const chef = users.find((u) => u.id === v.chef_id);
                      const chefName = chef
                        ? (chef.first_name || chef.last_name
                          ? `${chef.first_name || ""} ${chef.last_name || ""}`.trim()
                          : chef.email)
                        : `Chef #${v.chef_id}`;
                      const classeStr = chef?.classe || (chef?.licence && chef?.programme ? `${chef.licence} ${chef.programme}` : "");

                      return (
                        <div
                          key={v.id}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-mono">
                                +{v.amount.toLocaleString("fr-FR")} GNF
                              </span>
                              <Badge variant="outline" size="sm" className="text-[10px]">
                                Reçu Officiel
                              </Badge>
                            </div>

                            <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] flex flex-wrap items-center gap-2">
                              <span>
                                Reçu de : <strong className="text-[#171717] dark:text-white font-medium">{chefName}</strong>
                                {classeStr ? ` (${classeStr})` : ""}
                              </span>
                              <span>•</span>
                              <span>
                                Validé par : <strong className="text-[#171717] dark:text-white font-medium">{v.recorded_by_name || "Admin"}</strong>
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

                          <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] flex items-center gap-1 font-mono shrink-0">
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
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
