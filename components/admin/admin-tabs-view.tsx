"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
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
  AlertCircle,
  Calendar,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
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
import { ReinscrireOrganisateurModal } from "@/components/admin/reinscrire-organisateur-modal";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<"users" | "organisateurs" | "members" | "versements">("organisateurs");

  // Filtres pour les versements
  const [versementSearch, setVersementSearch] = useState("");
  const [versementRoleFilter, setVersementRoleFilter] = useState<string>("ALL");

  // Collecteurs d'inscriptions (Chefs de classe, Membres du Bureau, Admins, ou utilisateurs ayant inscrit des membres)
  const collectors = useMemo(() => {
    return users.filter((u) => {
      const hasAddedMembers = members.some((m) => m.added_by === u.id);
      const isEligibleRole = ["CHEF_DE_CLASSE", "BUREAU", "ADMIN"].includes(u.permission_code);
      return isEligibleRole || hasAddedMembers;
    });
  }, [users, members]);

  // Filtres pour les utilisateurs
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  // Filtres pour les organisateurs
  const [orgaSearch, setOrgaSearch] = useState("");
  const [orgaReinsFilter, setOrgaReinsFilter] = useState<"ALL" | "REINSCRIT" | "NON_REINSCRIT">("ALL");

  // Correspondance entre un membre du comité et sa fiche d'adhésion membre CJP
  const orgaMembershipMap = useMemo(() => {
    const map = new Map<number, Membre>();
    organisateurs.forEach((orga) => {
      const orgaEmail = orga.email?.trim().toLowerCase();
      const orgaFullName = `${orga.first_name} ${orga.last_name}`.trim().toLowerCase();
      const orgaPhoneDigits = orga.phone ? orga.phone.replace(/\D/g, "") : null;

      const matched = members.find((m) => {
        const mEmail = m.email?.trim().toLowerCase();
        if (orgaEmail && mEmail && orgaEmail === mEmail) return true;

        const mFullName = `${m.first_name} ${m.last_name}`.trim().toLowerCase();
        if (orgaFullName && mFullName && orgaFullName === mFullName) return true;

        if (orgaPhoneDigits && orgaPhoneDigits.length >= 8 && m.phone) {
          const mPhoneDigits = m.phone.replace(/\D/g, "");
          if (mPhoneDigits.endsWith(orgaPhoneDigits.slice(-8))) return true;
        }

        return false;
      });

      if (matched) {
        map.set(orga.id, matched);
      }
    });
    return map;
  }, [organisateurs, members]);

  const orgaReinscritsCount = useMemo(() => {
    return organisateurs.filter((o) => orgaMembershipMap.has(o.id)).length;
  }, [organisateurs, orgaMembershipMap]);

  const orgaNonReinscritsCount = organisateurs.length - orgaReinscritsCount;

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
      const matchSearch =
        !q ||
        o.first_name.toLowerCase().includes(q) ||
        o.last_name.toLowerCase().includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        o.role.toLowerCase().includes(q) ||
        (o.phone && o.phone.toLowerCase().includes(q));

      const isReinscrit = orgaMembershipMap.has(o.id);
      const matchReins =
        orgaReinsFilter === "ALL" ||
        (orgaReinsFilter === "REINSCRIT" && isReinscrit) ||
        (orgaReinsFilter === "NON_REINSCRIT" && !isReinscrit);

      return matchSearch && matchReins;
    });
  }, [organisateurs, orgaSearch, orgaReinsFilter, orgaMembershipMap]);

  // Filtres et tri pour les membres
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("ALL");
  const [memberSectionFilter, setMemberSectionFilter] = useState<string>("ALL");
  const [memberClassFilter, setMemberClassFilter] = useState<string>("ALL");
  const [memberRegistrarFilter, setMemberRegistrarFilter] = useState<string>("ALL");
  const [memberSortBy, setMemberSortBy] = useState<"date_desc" | "date_asc" | "name_asc" | "class_asc" | "added_by_asc">("date_desc");

  // Liste unique des classes
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, number>();
    members.forEach((m) => {
      const className = m.licence && m.programme
        ? `${m.licence} - ${m.programme}`
        : m.licence || m.programme || "Classe non définie";
      classMap.set(className, (classMap.get(className) || 0) + 1);
    });
    return Array.from(classMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  // Liste unique des personnes qui enregistrent (Inscrit par)
  const uniqueRegistrars = useMemo(() => {
    const regMap = new Map<string, { name: string; count: number }>();
    members.forEach((m) => {
      const key = m.added_by ? String(m.added_by) : (m.added_by_name || "Système");
      const name = m.added_by_name || "Système";
      const existing = regMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        regMap.set(key, { name, count: 1 });
      }
    });
    return Array.from(regMap.entries())
      .map(([id, data]) => ({ id, name: data.name, count: data.count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  // Filtrage et tri des membres
  const filteredMembers = useMemo(() => {
    const result = members.filter((m) => {
      const q = memberSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.licence && m.licence.toLowerCase().includes(q)) ||
        (m.programme && m.programme.toLowerCase().includes(q)) ||
        (m.added_by_name && m.added_by_name.toLowerCase().includes(q));

      const matchType =
        memberTypeFilter === "ALL" || m.type_inscription === memberTypeFilter;

      const matchSection =
        memberSectionFilter === "ALL" || m.section === memberSectionFilter;

      const memberClassName = m.licence && m.programme
        ? `${m.licence} - ${m.programme}`
        : m.licence || m.programme || "Classe non définie";
      const matchClass =
        memberClassFilter === "ALL" || memberClassName === memberClassFilter;

      const registrarKey = m.added_by ? String(m.added_by) : (m.added_by_name || "Système");
      const matchRegistrar =
        memberRegistrarFilter === "ALL" || registrarKey === memberRegistrarFilter;

      return matchSearch && matchType && matchSection && matchClass && matchRegistrar;
    });

    // Tri
    return result.sort((a, b) => {
      if (memberSortBy === "name_asc") {
        return (a.first_name + " " + a.last_name).localeCompare(b.first_name + " " + b.last_name);
      }
      if (memberSortBy === "class_asc") {
        const classA = `${a.licence || ""} ${a.programme || ""}`;
        const classB = `${b.licence || ""} ${b.programme || ""}`;
        return classA.localeCompare(classB);
      }
      if (memberSortBy === "added_by_asc") {
        return (a.added_by_name || "").localeCompare(b.added_by_name || "");
      }
      if (memberSortBy === "date_asc") {
        return (new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime()) || (a.id - b.id);
      }
      // date_desc (défaut)
      return (new Date(b.joined_at || 0).getTime() - new Date(a.joined_at || 0).getTime()) || (b.id - a.id);
    });
  }, [
    members,
    memberSearch,
    memberTypeFilter,
    memberSectionFilter,
    memberClassFilter,
    memberRegistrarFilter,
    memberSortBy,
  ]);

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
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-0">
      {/* ========================================================================= */}
      {/* 1. BARRE D'ONGLETS DESKTOP (HAUT DE PAGE)                                 */}
      {/* ========================================================================= */}
      <div className="hidden sm:grid bg-[#F7F7F7] dark:bg-[#1a1a1a] p-1.5 rounded-2xl border border-[#E5E5E5] dark:border-[#383838] grid-cols-4 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("organisateurs")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "organisateurs"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Comité</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E5E5E5] dark:bg-[#383838] text-[#171717] dark:text-white shrink-0">
            {organisateurs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="truncate">Comptes</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E5E5E5] dark:bg-[#383838] text-[#171717] dark:text-white shrink-0">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="truncate">Membres</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E5E5E5] dark:bg-[#383838] text-[#171717] dark:text-white shrink-0">
            {members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("versements")}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "versements"
              ? "bg-white dark:bg-[#262626] text-[#FFA500] shadow-xs ring-1 ring-[#FFA500]/30"
              : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white"
          }`}
        >
          <Coins className="w-4 h-4 shrink-0 text-[#FFA500]" />
          <span className="truncate">Versements</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#FFA500]/20 text-[#FFA500] font-bold shrink-0">
            {versements.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM NAVIGATION BAR MOBILE / ANDROID (PORTAL DIRECTEMENT DANS BODY)  */}
      {/* ========================================================================= */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <nav
            aria-label="Navigation principale mobile"
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white dark:bg-[#141414] border-t border-[#E5E5E5] dark:border-[#2b2b2b] shadow-2xl px-2 pt-1.5 pb-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] m-0"
            style={{ bottom: 0, left: 0, right: 0 }}
          >
            <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
              {/* COMITÉ */}
              <button
                type="button"
                onClick={() => setActiveTab("organisateurs")}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "organisateurs"
                    ? "text-[#FFA500]"
                    : "text-[#737373] dark:text-[#999999] hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <UserCheck className={`w-5 h-5 transition-transform ${activeTab === "organisateurs" ? "scale-110" : ""}`} />
                  <span className="absolute -top-1.5 -right-3 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center bg-[#E5E5E5] dark:bg-[#333333] text-[#171717] dark:text-white">
                    {organisateurs.length}
                  </span>
                </div>
                <span className={`text-[10px] mt-1 font-heading tracking-tight truncate max-w-full ${activeTab === "organisateurs" ? "font-bold text-[#FFA500]" : "font-medium"}`}>
                  Comité
                </span>
                {activeTab === "organisateurs" && (
                  <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#FFA500]" />
                )}
              </button>

              {/* COMPTES */}
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "text-[#FFA500]"
                    : "text-[#737373] dark:text-[#999999] hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Users className={`w-5 h-5 transition-transform ${activeTab === "users" ? "scale-110" : ""}`} />
                  <span className="absolute -top-1.5 -right-3 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center bg-[#E5E5E5] dark:bg-[#333333] text-[#171717] dark:text-white">
                    {users.length}
                  </span>
                </div>
                <span className={`text-[10px] mt-1 font-heading tracking-tight truncate max-w-full ${activeTab === "users" ? "font-bold text-[#FFA500]" : "font-medium"}`}>
                  Comptes
                </span>
                {activeTab === "users" && (
                  <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#FFA500]" />
                )}
              </button>

              {/* MEMBRES */}
              <button
                type="button"
                onClick={() => setActiveTab("members")}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "members"
                    ? "text-[#FFA500]"
                    : "text-[#737373] dark:text-[#999999] hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <GraduationCap className={`w-5 h-5 transition-transform ${activeTab === "members" ? "scale-110" : ""}`} />
                  <span className="absolute -top-1.5 -right-3 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center bg-[#E5E5E5] dark:bg-[#333333] text-[#171717] dark:text-white">
                    {members.length}
                  </span>
                </div>
                <span className={`text-[10px] mt-1 font-heading tracking-tight truncate max-w-full ${activeTab === "members" ? "font-bold text-[#FFA500]" : "font-medium"}`}>
                  Membres
                </span>
                {activeTab === "members" && (
                  <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#FFA500]" />
                )}
              </button>

              {/* VERSEMENTS */}
              <button
                type="button"
                onClick={() => setActiveTab("versements")}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "versements"
                    ? "text-[#FFA500]"
                    : "text-[#737373] dark:text-[#999999] hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Coins className={`w-5 h-5 transition-transform ${activeTab === "versements" ? "scale-110 text-[#FFA500]" : "text-[#737373] dark:text-[#999999]"}`} />
                  <span className="absolute -top-1.5 -right-3 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center bg-[#FFA500]/25 text-[#FFA500]">
                    {versements.length}
                  </span>
                </div>
                <span className={`text-[10px] mt-1 font-heading tracking-tight truncate max-w-full ${activeTab === "versements" ? "font-bold text-[#FFA500]" : "font-medium"}`}>
                  Versements
                </span>
                {activeTab === "versements" && (
                  <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#FFA500]" />
                )}
              </button>
            </div>
          </nav>,
          document.body
        )}

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

          {/* BANDEAU SUIVI RÉINSCRIPTION COMITÉ */}
          <div className="p-3 sm:p-4 bg-[#FFF4D6]/50 dark:bg-[#FFA500]/10 border-b border-[#FFA500]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFA500]/20 text-[#FFA500] flex items-center justify-center font-bold text-xs shrink-0 border border-[#FFA500]/30 font-mono">
                {orgaReinscritsCount}/{organisateurs.length}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white">
                    Cotisations Réinscription Comité
                  </span>
                  <Badge variant="cjp" size="sm" className="text-[10px]">
                    10 000 GNF / pers.
                  </Badge>
                </div>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                  {orgaNonReinscritsCount === 0
                    ? "Tous les membres du comité sont réinscrits au CJP ✅ (100% à jour)"
                    : `${orgaNonReinscritsCount} responsable(s) doivent encore valider leur réinscription obligatoire.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-[#737373] dark:text-[#A3A3A3] block">Total perçu comité</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-[#FFA500]">
                  {(orgaReinscritsCount * TARIF_REINSCRIPTION).toLocaleString("fr-FR")} GNF
                </span>
              </div>
              {orgaNonReinscritsCount === 0 ? (
                <Badge variant="success" size="sm" dot>100% à jour</Badge>
              ) : (
                <Badge variant="warning" size="sm" dot>{orgaNonReinscritsCount} en attente</Badge>
              )}
            </div>
          </div>

          {/* BARRE DE RECHERCHE ORGANISATEUR & FILTRE DE RÉINSCRIPTION */}
          <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <Input
                placeholder="Rechercher par nom ou poste..."
                value={orgaSearch}
                onChange={(e) => setOrgaSearch(e.target.value)}
                className="pl-8 text-xs py-1.5"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setOrgaReinsFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  orgaReinsFilter === "ALL"
                    ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                    : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                }`}
              >
                Tous ({organisateurs.length})
              </button>
              <button
                type="button"
                onClick={() => setOrgaReinsFilter("NON_REINSCRIT")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  orgaReinsFilter === "NON_REINSCRIT"
                    ? "bg-amber-500 text-white font-semibold shadow-xs"
                    : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                }`}
              >
                À réinscrire ({orgaNonReinscritsCount})
              </button>
              <button
                type="button"
                onClick={() => setOrgaReinsFilter("REINSCRIT")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  orgaReinsFilter === "REINSCRIT"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                }`}
              >
                Réinscrits ({orgaReinscritsCount})
              </button>
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

                    {/* STATUT RÉINSCRIPTION ADHÉSION CJP */}
                    {(() => {
                      const membership = orgaMembershipMap.get(orga.id);
                      if (membership) {
                        return (
                          <div className="mt-2.5 pt-2 border-t border-[#E5E5E5]/60 dark:border-[#333333] flex items-center justify-between text-[11px]">
                            <span className="text-[#737373] dark:text-[#A3A3A3] text-[10px]">Adhésion CJP :</span>
                            <Badge variant="success" size="sm" className="text-[10px] gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>{membership.type_inscription === "reinscrit" ? "Réinscrit (10 000 GNF)" : "Inscrit (20 000 GNF)"}</span>
                            </Badge>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-2.5 pt-2 border-t border-[#E5E5E5]/60 dark:border-[#333333] flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[10px] shrink-0">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Non réinscrit</span>
                          </div>
                          <ReinscrireOrganisateurModal organisateur={orga} />
                        </div>
                      );
                    })()}

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
                <div className="block sm:hidden p-2 space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7]/80 dark:bg-[#1c1c1c] space-y-2 shadow-xs overflow-hidden"
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
                        <span className="text-[#737373] dark:text-[#A3A3A3] shrink-0">Rôle :</span>
                        <Badge
                          variant={
                            u.permission_code === "ADMIN"
                              ? "cjp"
                              : u.permission_code === "BUREAU"
                              ? "info"
                              : "outline"
                          }
                          size="sm"
                          className="truncate max-w-[70%]"
                        >
                          {u.permission_name || u.permission_code}
                        </Badge>
                      </div>

                      {["CHEF_DE_CLASSE", "BUREAU", "ADMIN"].includes(u.permission_code) && (() => {
                        const userMembers = members.filter((m) => m.added_by === u.id);
                        const userVersements = versements.filter((v) => v.chef_id === u.id);
                        if (u.permission_code !== "CHEF_DE_CLASSE" && userMembers.length === 0 && userVersements.length === 0) {
                          return null;
                        }

                        const userCollecte = userMembers.reduce(
                          (acc, m) =>
                            acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                          0
                        );
                        const userTotalVerse = userVersements.reduce((acc, v) => acc + v.amount, 0);
                        const userReste = Math.max(0, userCollecte - userTotalVerse);

                        return (
                          <div className="pt-2 border-t border-[#E5E5E5]/60 dark:border-[#333333] space-y-1.5">
                            <div className="flex items-start justify-between gap-2 text-[11px]">
                              <span className="text-[#737373] dark:text-[#A3A3A3] shrink-0 whitespace-nowrap pt-0.5">Périmètre :</span>
                              <span
                                className="font-mono font-semibold text-[#FFA500] px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 text-right break-words max-w-[70%] text-[10.5px] leading-snug"
                                title={
                                  u.permission_code === "CHEF_DE_CLASSE"
                                    ? (u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`)
                                    : "Accès Global"
                                }
                              >
                                {u.permission_code === "CHEF_DE_CLASSE"
                                  ? (u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`)
                                  : "Accès Global"}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                              <div className="p-1 rounded bg-[#F7F7F7] dark:bg-[#252525]">
                                <div className="text-[#737373] dark:text-[#A3A3A3]">Collecté</div>
                                <div className="font-bold text-[#171717] dark:text-white font-mono">{userCollecte.toLocaleString("fr-FR")}</div>
                              </div>
                              <div className="p-1 rounded bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                                <div>Versé</div>
                                <div className="font-bold font-mono">{userTotalVerse.toLocaleString("fr-FR")}</div>
                              </div>
                              <div className="p-1 rounded bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                                <div>Reste</div>
                                <div className="font-bold font-mono">{userReste.toLocaleString("fr-FR")}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-end gap-1.5 flex-wrap">
                        {["CHEF_DE_CLASSE", "BUREAU", "ADMIN"].includes(u.permission_code) && (() => {
                          const userMembers = members.filter((m) => m.added_by === u.id);
                          const userVersements = versements.filter((v) => v.chef_id === u.id);
                          if (u.permission_code !== "CHEF_DE_CLASSE" && userMembers.length === 0 && userVersements.length === 0) {
                            return null;
                          }

                          const userCollecte = userMembers.reduce(
                            (acc, m) =>
                              acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                            0
                          );
                          const userTotalVerse = userVersements.reduce((acc, v) => acc + v.amount, 0);

                          return (
                            <RecordVersementModal
                              chefId={u.id}
                              chefName={
                                u.first_name || u.last_name
                                  ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                  : u.email
                              }
                              chefEmail={u.email}
                              roleLabel={
                                u.permission_code === "CHEF_DE_CLASSE"
                                  ? "Chef de classe"
                                  : u.permission_code === "BUREAU"
                                  ? "Bureau Exécutif"
                                  : "Administrateur"
                              }
                              classeName={
                                u.permission_code === "CHEF_DE_CLASSE"
                                  ? (u.classe || `${u.licence || "L2"} ${u.programme || ""}`)
                                  : "Accès Global"
                              }
                              totalCollecte={userCollecte}
                              totalVerse={userTotalVerse}
                              versements={userVersements}
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
                            {(() => {
                              const userMembers = members.filter((m) => m.added_by === u.id);
                              const userVersements = versements.filter((v) => v.chef_id === u.id);
                              const isChef = u.permission_code === "CHEF_DE_CLASSE";

                              if (!isChef && userMembers.length === 0 && userVersements.length === 0) {
                                return (
                                  <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                                    Accès Global
                                  </span>
                                );
                              }

                              const userCollecte = userMembers.reduce(
                                (acc, m) =>
                                  acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                                0
                              );
                              const userTotalVerse = userVersements.reduce((acc, v) => acc + v.amount, 0);
                              const userReste = Math.max(0, userCollecte - userTotalVerse);

                              return (
                                <div className="space-y-1">
                                  <span
                                    className="font-mono font-semibold text-[#FFA500] px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 inline-block break-words max-w-xs leading-snug"
                                    title={isChef ? (u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`) : "Accès Global"}
                                  >
                                    {isChef ? (u.classe || `${u.licence || "L2"} ${u.programme || "GL"}`) : "Accès Global"}
                                  </span>
                                  <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] flex items-center gap-1.5 font-mono">
                                    <span>Inscrits : <strong>{userMembers.length}</strong></span>
                                    <span>•</span>
                                    <span>Versé : <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{userTotalVerse.toLocaleString("fr-FR")}</strong></span>
                                    <span>•</span>
                                    <span>Reste : <strong className="text-amber-600 dark:text-amber-400 font-semibold">{userReste.toLocaleString("fr-FR")}</strong></span>
                                  </div>
                                </div>
                              );
                            })()}
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
                              {["CHEF_DE_CLASSE", "BUREAU", "ADMIN"].includes(u.permission_code) && (() => {
                                const userMembers = members.filter((m) => m.added_by === u.id);
                                const userVersements = versements.filter((v) => v.chef_id === u.id);
                                if (u.permission_code !== "CHEF_DE_CLASSE" && userMembers.length === 0 && userVersements.length === 0) {
                                  return null;
                                }

                                const userCollecte = userMembers.reduce(
                                  (acc, m) =>
                                    acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                                  0
                                );
                                const userTotalVerse = userVersements.reduce((acc, v) => acc + v.amount, 0);

                                return (
                                  <RecordVersementModal
                                    chefId={u.id}
                                    chefName={
                                      u.first_name || u.last_name
                                        ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                        : u.email
                                    }
                                    chefEmail={u.email}
                                    roleLabel={
                                      u.permission_code === "CHEF_DE_CLASSE"
                                        ? "Chef de classe"
                                        : u.permission_code === "BUREAU"
                                        ? "Bureau Exécutif"
                                        : "Administrateur"
                                    }
                                    classeName={
                                      u.permission_code === "CHEF_DE_CLASSE"
                                        ? (u.classe || `${u.licence || "L2"} ${u.programme || ""}`)
                                        : "Accès Global"
                                    }
                                    totalCollecte={userCollecte}
                                    totalVerse={userTotalVerse}
                                    versements={userVersements}
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
          <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838] space-y-2.5">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                <Input
                  placeholder="Rechercher nom, email, classe, inscrit par..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 text-xs py-1.5"
                />
              </div>

              {/* TRI RAPIDE */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#737373] dark:text-[#A3A3A3] font-medium hidden sm:inline">
                  Trier :
                </span>
                <select
                  value={memberSortBy}
                  onChange={(e) => setMemberSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-[#FFA500]/40 bg-[#FFF4D6]/30 dark:bg-[#FFA500]/10 text-[#FFA500] font-semibold cursor-pointer"
                  title="Ordre d'affichage"
                >
                  <option value="date_desc">📅 Plus récents d&apos;abord</option>
                  <option value="date_asc">📅 Plus anciens d&apos;abord</option>
                  <option value="class_asc">🎓 Classe (A → Z)</option>
                  <option value="added_by_asc">✍️ Inscrit par (A → Z)</option>
                  <option value="name_asc">👤 Nom adhérent (A → Z)</option>
                </select>
              </div>
            </div>

            {/* SÉLECTEURS DE FILTRES : CLASSE, INSCRIT PAR, SECTION, TYPE */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E5E5E5]/60 dark:border-[#2e2e2e]">
              {/* FILTRE CLASSE */}
              <select
                value={memberClassFilter}
                onChange={(e) => setMemberClassFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#171717] dark:text-white max-w-[190px] truncate"
                title="Filtrer par Classe"
              >
                <option value="ALL">Toutes les classes ({uniqueClasses.length})</option>
                {uniqueClasses.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>

              {/* FILTRE INSCRIT PAR (PERSONNE QUI ENREGISTRE) */}
              <select
                value={memberRegistrarFilter}
                onChange={(e) => setMemberRegistrarFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#171717] dark:text-white max-w-[190px] truncate"
                title="Filtrer par personne qui a enregistré"
              >
                <option value="ALL">Tous les enregistreurs ({uniqueRegistrars.length})</option>
                {uniqueRegistrars.map((r) => (
                  <option key={r.id} value={r.id}>
                    Inscrit par : {r.name} ({r.count})
                  </option>
                ))}
              </select>

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

              {/* BOUTON RÉINITIALISER SI FILTRE ACTIF */}
              {(memberSearch ||
                memberClassFilter !== "ALL" ||
                memberRegistrarFilter !== "ALL" ||
                memberSectionFilter !== "ALL" ||
                memberTypeFilter !== "ALL" ||
                memberSortBy !== "date_desc") && (
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearch("");
                    setMemberClassFilter("ALL");
                    setMemberRegistrarFilter("ALL");
                    setMemberSectionFilter("ALL");
                    setMemberTypeFilter("ALL");
                    setMemberSortBy("date_desc");
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Réinitialiser tous les filtres"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Effacer filtres</span>
                </button>
              )}
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
                <div className="block md:hidden p-2 space-y-2">
                  {filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7]/80 dark:bg-[#1c1c1c] space-y-2 shadow-xs overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white break-words">
                            {m.first_name} {m.last_name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                            <GraduationCap className="w-3 h-3 text-[#FFA500] shrink-0" />
                            <span className="break-words line-clamp-2">
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
                        <th
                          className="px-6 py-3.5 cursor-pointer hover:text-[#FFA500] transition-colors select-none"
                          onClick={() => setMemberSortBy(memberSortBy === "name_asc" ? "date_desc" : "name_asc")}
                          title="Cliquer pour trier par nom"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Adhérent</span>
                            <ArrowUpDown className={`w-3 h-3 ${memberSortBy === "name_asc" ? "text-[#FFA500]" : "opacity-40"}`} />
                          </div>
                        </th>
                        <th
                          className="px-6 py-3.5 cursor-pointer hover:text-[#FFA500] transition-colors select-none"
                          onClick={() => setMemberSortBy(memberSortBy === "class_asc" ? "date_desc" : "class_asc")}
                          title="Cliquer pour trier par classe"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Classe</span>
                            <ArrowUpDown className={`w-3 h-3 ${memberSortBy === "class_asc" ? "text-[#FFA500]" : "opacity-40"}`} />
                          </div>
                        </th>
                        <th className="px-6 py-3.5">Section de Formation</th>
                        <th className="px-6 py-3.5">Type & Tarif</th>
                        <th
                          className="px-6 py-3.5 cursor-pointer hover:text-[#FFA500] transition-colors select-none"
                          onClick={() => setMemberSortBy(memberSortBy === "added_by_asc" ? "date_desc" : "added_by_asc")}
                          title="Cliquer pour trier par personne ayant enregistré"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Inscrit par</span>
                            <ArrowUpDown className={`w-3 h-3 ${memberSortBy === "added_by_asc" ? "text-[#FFA500]" : "opacity-40"}`} />
                          </div>
                        </th>
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
      {/* ONGLET 4 : SUIVI DES VERSEMENTS & REMISES (CHEFS, BUREAU & ADMINS)        */}
      {/* ========================================================================= */}
      {activeTab === "versements" && (() => {
        const totalCollecteGlobal = members.reduce(
          (acc, m) =>
            acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
          0
        );
        const totalVerseGlobal = versements.reduce((sum, v) => sum + v.amount, 0);
        const totalResteGlobal = Math.max(0, totalCollecteGlobal - totalVerseGlobal);

        // Répartition des collecteurs par rôle
        const chefsCount = collectors.filter((c) => c.permission_code === "CHEF_DE_CLASSE").length;
        const bureauCount = collectors.filter((c) => c.permission_code === "BUREAU").length;
        const adminCount = collectors.filter((c) => c.permission_code === "ADMIN").length;

        const filteredCollectors = collectors.filter((c) => {
          const q = versementSearch.toLowerCase().trim();
          const matchSearch =
            !q ||
            c.email.toLowerCase().includes(q) ||
            (c.first_name && c.first_name.toLowerCase().includes(q)) ||
            (c.last_name && c.last_name.toLowerCase().includes(q)) ||
            (c.classe && c.classe.toLowerCase().includes(q)) ||
            (c.licence && c.licence.toLowerCase().includes(q)) ||
            (c.programme && c.programme.toLowerCase().includes(q));

          const matchRole =
            versementRoleFilter === "ALL" || c.permission_code === versementRoleFilter;

          return matchSearch && matchRole;
        });

        return (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* CARTE EN-TÊTE FINANCIÈRE DE L'ONGLET VERSEMENTS */}
            <Card className="border-[#FFA500]/30 shadow-sm overflow-hidden">
              <CardHeader className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#383838] bg-gradient-to-r from-[#FFF4D6]/30 via-transparent to-transparent dark:from-[#FFA500]/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#FFA500]" />
                        Suivi des Versements & Remises de Fonds
                      </CardTitle>
                      <Badge variant="cjp" size="sm">
                        {collectors.length} Collecteurs (Chefs, Bureau, Admins)
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      Contrôlez les cotisations encaissées lors des adhésions (Chefs de classe, Bureau Exécutif et Administrateurs) et enregistrez les montants remis à la caisse centrale.
                    </CardDescription>
                  </div>
                </div>

                {/* 3 STATS CLÉS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-[#E5E5E5] dark:border-[#383838]">
                    <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] uppercase font-medium">
                      Total Recettes Collectées (Club)
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white mt-0.5 font-mono">
                      {totalCollecteGlobal.toLocaleString("fr-FR")} GNF
                    </div>
                    <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                      {members.length} adhésion(s) enregistrée(s)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-medium">
                      Déjà Versé au Club (Caisse Centrale)
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                      {totalVerseGlobal.toLocaleString("fr-FR")} GNF
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {versements.length} versement(s) validé(s)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-amber-200 dark:border-amber-900/50">
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 uppercase font-medium">
                      Reste Global à Recouvrer
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                      {totalResteGlobal.toLocaleString("fr-FR")} GNF
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                      En cours auprès des collecteurs
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* BARRE DE RECHERCHE & FILTRE DE RÔLE */}
              <div className="p-2.5 sm:p-3.5 bg-[#F7F7F7]/50 dark:bg-[#1a1a1a]/50 border-b border-[#E5E5E5] dark:border-[#383838] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <Input
                    placeholder="Rechercher par nom, email, classe..."
                    value={versementSearch}
                    onChange={(e) => setVersementSearch(e.target.value)}
                    className="pl-8 text-xs py-1.5"
                  />
                </div>

                {/* FILTRES PAR RÔLE */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setVersementRoleFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      versementRoleFilter === "ALL"
                        ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                        : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                    }`}
                  >
                    Tous ({collectors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersementRoleFilter("CHEF_DE_CLASSE")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      versementRoleFilter === "CHEF_DE_CLASSE"
                        ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                        : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                    }`}
                  >
                    Chefs ({chefsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersementRoleFilter("BUREAU")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      versementRoleFilter === "BUREAU"
                        ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                        : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                    }`}
                  >
                    Bureau ({bureauCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersementRoleFilter("ADMIN")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      versementRoleFilter === "ADMIN"
                        ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                        : "bg-white dark:bg-[#262626] text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] border border-[#E5E5E5] dark:border-[#383838]"
                    }`}
                  >
                    Admins ({adminCount})
                  </button>
                </div>
              </div>

              {/* TABLEAU / CARTES DES COLLECTEURS */}
              <CardContent className="p-0">
                {filteredCollectors.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Aucun collecteur trouvé pour cette recherche ou ce filtre.
                  </div>
                ) : (
                  <>
                    {/* VUE MOBILE */}
                    <div className="block md:hidden p-2 space-y-2">
                      {filteredCollectors.map((c) => {
                        const userMembers = members.filter((m) => m.added_by === c.id);
                        const userCollecte = userMembers.reduce(
                          (acc, m) =>
                            acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                          0
                        );
                        const userVersements = versements.filter((v) => v.chef_id === c.id);
                        const userTotalVerse = userVersements.reduce((acc, v) => acc + v.amount, 0);
                        const userReste = Math.max(0, userCollecte - userTotalVerse);
                        const collectorName = c.first_name || c.last_name
                          ? `${c.first_name || ""} ${c.last_name || ""}`.trim()
                          : c.email;

                        const isChef = c.permission_code === "CHEF_DE_CLASSE";

                        return (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] space-y-2.5 shadow-xs overflow-hidden"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-heading font-semibold text-xs sm:text-sm text-[#171717] dark:text-white truncate">
                                    {collectorName}
                                  </h4>
                                  <Badge
                                    variant={
                                      c.permission_code === "ADMIN"
                                        ? "cjp"
                                        : c.permission_code === "BUREAU"
                                        ? "info"
                                        : "warning"
                                    }
                                    size="sm"
                                    className="text-[9px]"
                                  >
                                    {c.permission_code === "CHEF_DE_CLASSE"
                                      ? "Chef de classe"
                                      : c.permission_code === "BUREAU"
                                      ? "Bureau"
                                      : "Admin"}
                                  </Badge>
                                </div>
                                <span
                                  className="font-mono text-[11px] text-[#FFA500] break-words line-clamp-2 block mt-0.5"
                                  title={
                                    isChef
                                      ? (c.classe || `${c.licence || "L2"} ${c.programme || ""}`)
                                      : "Accès Global (Tous niveaux)"
                                  }
                                >
                                  {isChef
                                    ? (c.classe || `${c.licence || "L2"} ${c.programme || ""}`)
                                    : "Accès Global (Tous niveaux)"}
                                </span>
                              </div>
                              {userReste === 0 && userCollecte > 0 ? (
                                <Badge variant="success" size="sm" className="text-[10px] shrink-0">
                                  À jour ✅
                                </Badge>
                              ) : userReste > 0 ? (
                                <Badge variant="warning" size="sm" className="text-[10px] shrink-0">
                                  Reste dû
                                </Badge>
                              ) : null}
                            </div>

                            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                              <div className="p-1.5 rounded-lg bg-[#F7F7F7] dark:bg-[#252525]">
                                <div className="text-[#737373] dark:text-[#A3A3A3]">Inscrits</div>
                                <div className="font-bold font-mono text-[#171717] dark:text-white mt-0.5">
                                  {userMembers.length}
                                </div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-[#F7F7F7] dark:bg-[#252525]">
                                <div className="text-[#737373] dark:text-[#A3A3A3]">Collecté</div>
                                <div className="font-bold font-mono text-[#171717] dark:text-white mt-0.5">
                                  {userCollecte.toLocaleString("fr-FR")}
                                </div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                                <div>Versé</div>
                                <div className="font-bold font-mono mt-0.5">
                                  {userTotalVerse.toLocaleString("fr-FR")}
                                </div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                                <div>Reste</div>
                                <div className="font-bold font-mono mt-0.5">
                                  {userReste.toLocaleString("fr-FR")}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#333333] flex items-center justify-end">
                              <RecordVersementModal
                                chefId={c.id}
                                chefName={collectorName}
                                chefEmail={c.email}
                                roleLabel={
                                  c.permission_code === "CHEF_DE_CLASSE"
                                    ? "Chef de classe"
                                    : c.permission_code === "BUREAU"
                                    ? "Bureau Exécutif"
                                    : "Administrateur"
                                }
                                classeName={
                                  isChef
                                    ? (c.classe || `${c.licence || "L2"} ${c.programme || ""}`)
                                    : "Accès Global"
                                }
                                totalCollecte={userCollecte}
                                totalVerse={userTotalVerse}
                                versements={userVersements}
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
                            <th className="px-6 py-3.5">Collecteur / Responsable</th>
                            <th className="px-6 py-3.5">Rôle & Périmètre</th>
                            <th className="px-6 py-3.5">Étudiants</th>
                            <th className="px-6 py-3.5">Total Collecté</th>
                            <th className="px-6 py-3.5">Déjà Versé</th>
                            <th className="px-6 py-3.5">Reste à Verser</th>
                            <th className="px-6 py-3.5 text-right">Action Versement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                          {filteredCollectors.map((c) => {
                            const userMembers = members.filter((m) => m.added_by === c.id);
                            const userCollecte = userMembers.reduce(
                              (acc, m) =>
                                acc + (m.type_inscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION),
                              0
                            );
                            const userVersements = versements.filter((v) => v.chef_id === c.id);
                            const userTotalVerse = userVersements.reduce((acc, v) => acc + v.amount, 0);
                            const userReste = Math.max(0, userCollecte - userTotalVerse);
                            const collectorName = c.first_name || c.last_name
                              ? `${c.first_name || ""} ${c.last_name || ""}`.trim()
                              : c.email;

                            const isChef = c.permission_code === "CHEF_DE_CLASSE";

                            return (
                              <tr
                                key={c.id}
                                className="hover:bg-[#F7F7F7]/60 dark:hover:bg-[#222222]/80 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-[#171717] dark:text-white">
                                    {collectorName}
                                  </div>
                                  <div className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono mt-0.5">
                                    {c.email} {c.phone ? `• ${c.phone}` : ""}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <Badge
                                        variant={
                                          c.permission_code === "ADMIN"
                                            ? "cjp"
                                            : c.permission_code === "BUREAU"
                                            ? "info"
                                            : "warning"
                                        }
                                        size="sm"
                                        className="text-[10px]"
                                      >
                                        {c.permission_code === "CHEF_DE_CLASSE"
                                          ? "Chef de classe"
                                          : c.permission_code === "BUREAU"
                                          ? "Bureau"
                                          : "Admin"}
                                      </Badge>
                                    </div>
                                    <span className="font-mono text-xs font-semibold text-[#FFA500] inline-block">
                                      {isChef
                                        ? (c.classe || `${c.licence || "L2"} ${c.programme || ""}`)
                                        : "Accès Global (Tous niveaux)"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-medium">
                                  {userMembers.length} inscrit(s)
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-[#171717] dark:text-white">
                                  {userCollecte.toLocaleString("fr-FR")} GNF
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {userTotalVerse.toLocaleString("fr-FR")} GNF
                                </td>
                                <td className="px-6 py-4">
                                  {userReste === 0 && userCollecte > 0 ? (
                                    <Badge variant="success" size="sm" className="font-mono">
                                      0 GNF (À jour ✅)
                                    </Badge>
                                  ) : userReste > 0 ? (
                                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                      {userReste.toLocaleString("fr-FR")} GNF
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
                                      chefId={c.id}
                                      chefName={collectorName}
                                      chefEmail={c.email}
                                      roleLabel={
                                        c.permission_code === "CHEF_DE_CLASSE"
                                          ? "Chef de classe"
                                          : c.permission_code === "BUREAU"
                                          ? "Bureau Exécutif"
                                          : "Administrateur"
                                      }
                                      classeName={
                                        isChef
                                          ? (c.classe || `${c.licence || "L2"} ${c.programme || ""}`)
                                          : "Accès Global"
                                      }
                                      totalCollecte={userCollecte}
                                      totalVerse={userTotalVerse}
                                      versements={userVersements}
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
                      Historique complet de toutes les remises de cotisations effectuées par les responsables (Chefs, Bureau, Admins).
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="success" size="md" className="font-mono shrink-0 self-start sm:self-auto">
                  Total Encaissé : {totalVerseGlobal.toLocaleString("fr-FR")} GNF
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {versements.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Aucun versement n&apos;a encore été enregistré. Cliquez sur « Versements » sur une ligne de responsable pour enregistrer la première remise.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E5E5] dark:divide-[#383838]">
                    {versements.map((v) => {
                      const collector = users.find((u) => u.id === v.chef_id);
                      const collectorName = collector
                        ? (collector.first_name || collector.last_name
                          ? `${collector.first_name || ""} ${collector.last_name || ""}`.trim()
                          : collector.email)
                        : `Collecteur #${v.chef_id}`;

                      const isChef = collector?.permission_code === "CHEF_DE_CLASSE";
                      const roleBadgeText = isChef
                        ? "Chef"
                        : collector?.permission_code === "BUREAU"
                        ? "Bureau"
                        : collector?.permission_code === "ADMIN"
                        ? "Admin"
                        : "Collecteur";

                      const classeStr = isChef
                        ? (collector?.classe || (collector?.licence && collector?.programme ? `${collector.licence} ${collector.programme}` : ""))
                        : "Accès Global";

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
                              <Badge
                                variant={
                                  collector?.permission_code === "ADMIN"
                                    ? "cjp"
                                    : collector?.permission_code === "BUREAU"
                                    ? "info"
                                    : "warning"
                                }
                                size="sm"
                                className="text-[9px]"
                              >
                                {roleBadgeText}
                              </Badge>
                            </div>

                            <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] flex flex-wrap items-center gap-2">
                              <span>
                                Reçu de : <strong className="text-[#171717] dark:text-white font-medium">{collectorName}</strong>
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
