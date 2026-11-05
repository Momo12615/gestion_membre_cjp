"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Search,
} from "lucide-react";
import { Membre, Organisateur, PermissionCode, SECTIONS_FORMATION } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateUserModal } from "@/components/admin/create-user-modal";
import { InviteChefModal } from "@/components/admin/invite-chef-modal";
import { CreateOrganisateurModal } from "@/components/admin/create-organisateur-modal";
import { EditOrganisateurModal } from "@/components/admin/edit-organisateur-modal";
import { CreateMemberModal } from "@/components/admin/create-member-modal";
import { UserToggleButton } from "@/components/admin/user-toggle-button";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import { OrganisateurDeleteButton } from "@/components/admin/organisateur-delete-button";
import { InviteOrganisateurButton } from "@/components/admin/invite-organisateur-button";

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
}

export function AdminTabsView({ users, organisateurs, members }: AdminTabsViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "organisateurs" | "members">("organisateurs");

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
      {/* BARRE D'ONGLETS SUPÉRIEURE (GRILLE ADAPTÉE 100% MOBILE) */}
      <div className="bg-[#F7F7F7] dark:bg-[#1a1a1a] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#E5E5E5] dark:border-[#383838] grid grid-cols-3 gap-1 shadow-xs">
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

                      {u.permission_code === "CHEF_DE_CLASSE" && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#737373] dark:text-[#A3A3A3]">Classe :</span>
                          <span className="font-mono font-semibold text-[#FFA500] px-1.5 py-0.5 rounded bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 shrink-0">
                            {u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-end gap-1.5">
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
                            {u.permission_code === "CHEF_DE_CLASSE" ? (
                              <span className="font-mono font-semibold text-[#FFA500] px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30">
                                {u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`}
                              </span>
                            ) : (
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
                        <Badge variant="cjp" size="sm" dot className="shrink-0 text-[10px]">
                          {m.status || "Actif"}
                        </Badge>
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
    </div>
  );
}
