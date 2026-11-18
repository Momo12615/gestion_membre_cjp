"use client";

import React, { useState, useMemo } from "react";
import { Membre } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EditMemberModal } from "@/components/members/edit-member-modal";
import { MemberDeleteButton } from "@/components/members/member-delete-button";
import { CreateMemberModal } from "@/components/admin/create-member-modal";
import { Search, Users, RotateCcw, ArrowUpDown } from "lucide-react";

interface BureauMembersViewProps {
  members: Membre[];
  currentUserId: number;
}

export function BureauMembersView({
  members,
  currentUserId,
}: BureauMembersViewProps) {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "MINE">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [registrarFilter, setRegistrarFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "name_asc" | "class_asc" | "added_by_asc">("date_desc");

  const myMembersCount = useMemo(
    () => members.filter((m) => m.added_by === currentUserId).length,
    [members, currentUserId]
  );

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

  // Liste unique des personnes qui enregistrent
  const uniqueRegistrars = useMemo(() => {
    const regMap = new Map<string, { name: string; count: number }>();
    members.forEach((m) => {
      const key = m.added_by ? String(m.added_by) : (m.added_by_name || "Système");
      const name = m.added_by === currentUserId ? "Vous-même" : (m.added_by_name || "Système");
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
  }, [members, currentUserId]);

  const filteredMembers = useMemo(() => {
    const result = members.filter((m) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.licence && m.licence.toLowerCase().includes(q)) ||
        (m.programme && m.programme.toLowerCase().includes(q)) ||
        (m.added_by_name && m.added_by_name.toLowerCase().includes(q));

      const matchScope =
        scopeFilter === "ALL" || m.added_by === currentUserId;

      const matchType =
        typeFilter === "ALL" || m.type_inscription === typeFilter;

      const memberClassName = m.licence && m.programme
        ? `${m.licence} - ${m.programme}`
        : m.licence || m.programme || "Classe non définie";
      const matchClass =
        classFilter === "ALL" || memberClassName === classFilter;

      const registrarKey = m.added_by ? String(m.added_by) : (m.added_by_name || "Système");
      const matchRegistrar =
        registrarFilter === "ALL" || registrarKey === registrarFilter;

      return matchSearch && matchScope && matchType && matchClass && matchRegistrar;
    });

    // Tri
    return result.sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.first_name + " " + a.last_name).localeCompare(b.first_name + " " + b.last_name);
      }
      if (sortBy === "class_asc") {
        const classA = `${a.licence || ""} ${a.programme || ""}`;
        const classB = `${b.licence || ""} ${b.programme || ""}`;
        return classA.localeCompare(classB);
      }
      if (sortBy === "added_by_asc") {
        return (a.added_by_name || "").localeCompare(b.added_by_name || "");
      }
      if (sortBy === "date_asc") {
        return (new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime()) || (a.id - b.id);
      }
      // date_desc
      return (new Date(b.joined_at || 0).getTime() - new Date(a.joined_at || 0).getTime()) || (b.id - a.id);
    });
  }, [members, search, scopeFilter, typeFilter, classFilter, registrarFilter, sortBy, currentUserId]);

  const hasActiveFilters =
    search ||
    scopeFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    classFilter !== "ALL" ||
    registrarFilter !== "ALL" ||
    sortBy !== "date_desc";

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[#E5E5E5] dark:border-white/[0.08] bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl shadow-xl shadow-black/[0.03] dark:shadow-black/25 overflow-hidden">
      {/* EN-TÊTE DE LA SECTION MEMBRES */}
      <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white">
              Supervision des Membres CJP
            </h2>
            <Badge variant="cjp" size="sm">
              {filteredMembers.length} affiché(s)
            </Badge>
          </div>
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
            Suivi des adhésions enregistrées par le Bureau et les chefs de classe.
          </p>
        </div>

        <div className="hidden sm:block">
          <CreateMemberModal size="sm" />
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="p-3 sm:p-4 bg-[#F7F7F7]/60 dark:bg-[#1f1f1f]/60 border-b border-[#E5E5E5] dark:border-white/[0.08] space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Rechercher nom, email, classe, inscrit par..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs py-1.5"
            />
          </div>

          {/* SÉLECTEUR DE TRI */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-[#737373] dark:text-[#A3A3A3] font-medium hidden sm:inline">
              Trier :
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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

        {/* LIGNE DE FILTRES : SCOPE, CLASSE, INSCRIT PAR, TYPE */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E5E5E5]/60 dark:border-white/10">
          {/* ONGLETS SCOPE (TOUS VS MES INSCRIPTIONS) */}
          <div className="flex items-center bg-white dark:bg-[#262626] p-0.5 rounded-xl border border-[#E5E5E5] dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setScopeFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                scopeFilter === "ALL"
                  ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                  : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717]"
              }`}
            >
              Tous ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter("MINE")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                scopeFilter === "MINE"
                  ? "bg-[#FFA500] text-[#171717] font-semibold shadow-xs"
                  : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717]"
              }`}
            >
              Inscrits par Vous ({myMembersCount})
            </button>
          </div>

          {/* FILTRE CLASSE */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#222222] text-[#171717] dark:text-white max-w-[190px] truncate"
            title="Filtrer par Classe"
          >
            <option value="ALL">Toutes les classes ({uniqueClasses.length})</option>
            {uniqueClasses.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          {/* FILTRE INSCRIT PAR */}
          <select
            value={registrarFilter}
            onChange={(e) => setRegistrarFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#222222] text-[#171717] dark:text-white max-w-[190px] truncate"
            title="Filtrer par personne qui a inscrit"
          >
            <option value="ALL">Tous les enregistreurs ({uniqueRegistrars.length})</option>
            {uniqueRegistrars.map((r) => (
              <option key={r.id} value={r.id}>
                Inscrit par : {r.name} ({r.count})
              </option>
            ))}
          </select>

          {/* FILTRE TYPE D'INSCRIPTION */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#222222] text-[#171717] dark:text-white"
          >
            <option value="ALL">Tous les types</option>
            <option value="inscrit">Inscription (20K)</option>
            <option value="reinscrit">Réinscription (10K)</option>
          </select>

          {/* BOUTON RÉINITIALISER */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setScopeFilter("ALL");
                setTypeFilter("ALL");
                setClassFilter("ALL");
                setRegistrarFilter("ALL");
                setSortBy("date_desc");
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

      {/* CONTENU : LISTE OU TABLEAU */}
      <div>
        {filteredMembers.length === 0 ? (
          <div className="p-8 sm:p-14 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500]">
              <Users className="w-7 h-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#171717] dark:text-white">
                Aucun adhérent trouvé
              </h3>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                {scopeFilter === "MINE"
                  ? "Vous n'avez pas encore inscrit d'adhérent sous votre compte."
                  : "Aucun membre ne correspond à vos filtres actuels."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* VUE MOBILE */}
            <div className="block md:hidden p-3 space-y-2.5">
              {filteredMembers.map((m) => {
                const initials =
                  (m.first_name?.[0] || "") + (m.last_name?.[0] || "") || "CJP";
                const isMine = m.added_by === currentUserId;

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border bg-white dark:bg-[#202020] shadow-xs space-y-3 transition-all ${
                      isMine
                        ? "border-[#FFA500]/50 ring-1 ring-[#FFA500]/20"
                        : "border-[#E5E5E5] dark:border-white/[0.08]"
                    }`}
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
                        {m.type_inscription === "inscrit" ? "20 000 GNF" : "10 000 GNF"}
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
                        <strong className={isMine ? "text-[#FFA500] font-bold" : "text-[#171717] dark:text-white font-medium"}>
                          {isMine ? "Vous-même" : m.added_by_name || "Système"}
                        </strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="cjp" size="sm" dot className="text-[10px]">
                          {m.status || "Actif"}
                        </Badge>
                        <div className="flex items-center gap-1 pl-1 border-l border-[#E5E5E5] dark:border-white/10">
                          <EditMemberModal member={m} canChangeClass={true} />
                          <MemberDeleteButton id={m.id} name={`${m.first_name} ${m.last_name}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VUE TABLETTE & DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F7F7F7] dark:bg-[#202020] border-b border-[#E5E5E5] dark:border-white/[0.08] text-[#737373] dark:text-[#A3A3A3] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:text-[#FFA500] transition-colors select-none"
                      onClick={() => setSortBy(sortBy === "name_asc" ? "date_desc" : "name_asc")}
                      title="Cliquer pour trier par nom"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Adhérent</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortBy === "name_asc" ? "text-[#FFA500]" : "opacity-40"}`} />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:text-[#FFA500] transition-colors select-none"
                      onClick={() => setSortBy(sortBy === "class_asc" ? "date_desc" : "class_asc")}
                      title="Cliquer pour trier par classe"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Classe & Section</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortBy === "class_asc" ? "text-[#FFA500]" : "opacity-40"}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3.5">Type & Tarif</th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:text-[#FFA500] transition-colors select-none"
                      onClick={() => setSortBy(sortBy === "added_by_asc" ? "date_desc" : "added_by_asc")}
                      title="Cliquer pour trier par personne ayant enregistré"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Inscrit par</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortBy === "added_by_asc" ? "text-[#FFA500]" : "opacity-40"}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] dark:divide-white/[0.06]">
                  {filteredMembers.map((m) => {
                    const isMine = m.added_by === currentUserId;

                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors ${
                          isMine
                            ? "bg-[#FFF4D6]/20 dark:bg-[#FFA500]/5 hover:bg-[#FFF4D6]/30 dark:hover:bg-[#FFA500]/10"
                            : "hover:bg-[#F7F7F7]/60 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-[#171717] dark:text-white">
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{m.first_name} {m.last_name}</span>
                            {isMine && (
                              <Badge variant="cjp" size="sm" className="text-[9px]">
                                Par vous
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-[#737373] dark:text-[#A3A3A3] font-mono mt-0.5">
                            {m.email} {m.phone ? `• ${m.phone}` : ""}
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
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={m.type_inscription === "inscrit" ? "success" : "warning"}
                              size="sm"
                            >
                              {m.type_inscription === "inscrit" ? "Inscription" : "Réinscription"}
                            </Badge>
                            <span className="font-mono text-xs font-bold text-[#FFA500]">
                              {m.type_inscription === "inscrit" ? "20 000 GNF" : "10 000 GNF"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {isMine ? (
                            <strong className="text-[#FFA500] font-bold">
                              Vous-même
                            </strong>
                          ) : (
                            <span className="text-[#737373] dark:text-[#A3A3A3]">
                              {m.added_by_name || "Système"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <EditMemberModal member={m} canChangeClass={true} />
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
      </div>
    </div>
  );
}
