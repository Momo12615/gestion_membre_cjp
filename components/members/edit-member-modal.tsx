"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Check,
} from "lucide-react";
import { updateMember } from "@/actions/members";
import {
  Membre,
  SectionFormation,
  TypeInscription,
  SECTIONS_FORMATION,
} from "@/lib/types";
import { PROGRAMMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LICENCES = ["L1", "L2", "L3", "L4", "Master 1", "Master 2"];

interface EditMemberModalProps {
  member: Membre;
  canChangeClass?: boolean;
  className?: string;
}

export function EditMemberModal({
  member,
  canChangeClass = false,
  className,
}: EditMemberModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isCustomInit = member.programme
    ? !(PROGRAMMES as readonly string[]).includes(member.programme)
    : false;

  const [firstName, setFirstName] = useState(member.first_name || "");
  const [lastName, setLastName] = useState(member.last_name || "");
  const [email, setEmail] = useState(member.email || "");
  const [phone, setPhone] = useState(member.phone || "");
  const [licence, setLicence] = useState(member.licence || "L2");
  const [programme, setProgramme] = useState(
    isCustomInit ? "__AUTRE__" : member.programme || PROGRAMMES[0]
  );
  const [customProgramme, setCustomProgramme] = useState(
    isCustomInit ? member.programme || "" : ""
  );
  const [section, setSection] = useState<SectionFormation>(
    (member.section as SectionFormation) || "Dev Mobile & Site Web"
  );
  const [typeInscription, setTypeInscription] = useState<TypeInscription>(
    member.type_inscription || "inscrit"
  );
  const [status, setStatus] = useState<"actif" | "inactif" | "suspendu">(
    member.status || "actif"
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isL1 =
    licence.toUpperCase().includes("L1") ||
    licence.toUpperCase().includes("LICENCE 1");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending]);

  const handleOpen = () => {
    const isCustom = member.programme
      ? !(PROGRAMMES as readonly string[]).includes(member.programme)
      : false;
    setFirstName(member.first_name || "");
    setLastName(member.last_name || "");
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setLicence(member.licence || "L2");
    setProgramme(isCustom ? "__AUTRE__" : member.programme || PROGRAMMES[0]);
    setCustomProgramme(isCustom ? member.programme || "" : "");
    setSection(
      (member.section as SectionFormation) || "Dev Mobile & Site Web"
    );
    setTypeInscription(member.type_inscription || "inscrit");
    setStatus(member.status || "actif");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isPending) setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage("Veuillez renseigner le prénom, le nom et l'email.");
      return;
    }

    const finalProgramme = canChangeClass
      ? programme === "__AUTRE__"
        ? customProgramme.trim()
        : programme.trim()
      : undefined;

    if (canChangeClass && !finalProgramme) {
      setErrorMessage("Veuillez spécifier le département / filière.");
      return;
    }

    const finalType = isL1 ? "inscrit" : typeInscription;

    startTransition(async () => {
      const res = await updateMember(member.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        licence: canChangeClass ? licence : undefined,
        programme: finalProgramme,
        section,
        type_inscription: finalType,
        status,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de la mise à jour du membre.");
        return;
      }

      setSuccessMessage("Modifications enregistrées avec succès !");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 900);
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={cn(
          "text-[#737373] dark:text-[#A3A3A3] hover:text-[#FFA500] hover:border-[#FFA500]/50 cursor-pointer h-8 w-8 p-0 shrink-0",
          className
        )}
        title={`Modifier ${member.first_name} ${member.last_name}`}
        aria-label={`Modifier ${member.first_name} ${member.last_name}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) {
              handleClose();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-3xl border border-[#E5E5E5] dark:border-[#383838] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#171717] dark:text-white"
          >
            {/* 1. EN-TÊTE FIXE */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/20 flex items-center justify-center text-[#FFA500] shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-base sm:text-lg truncate">
                    Modifier l&apos;étudiant
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate">
                    {member.licence} - {member.programme}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-2 rounded-xl text-[#737373] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#262626] transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. CORPS SCROLLABLE */}
            <form
              id="edit-member-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain"
            >
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* IDENTITÉ */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FFA500]" />
                  Identité de l&apos;étudiant
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Prénom *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isPending}
                  />
                  <Input
                    label="Nom *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* COORDONNÉES */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Email *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isPending}
                    leftIcon={<Mail className="w-4 h-4 text-[#737373]" />}
                  />
                  <Input
                    label="Téléphone (optionnel)"
                    type="tel"
                    placeholder="Ex: 620 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isPending}
                    leftIcon={<Phone className="w-4 h-4 text-[#737373]" />}
                  />
                </div>
              </div>

              {/* CLASSE & DÉPARTEMENT */}
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#171717] dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#FFA500]" />
                    Classe & Programme
                  </span>
                  {!canChangeClass && (
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      Verrouillé à votre classe
                    </Badge>
                  )}
                </div>

                {canChangeClass ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block mb-1">
                          Niveau / Licence *
                        </label>
                        <select
                          value={licence}
                          onChange={(e) => {
                            setLicence(e.target.value);
                            if (
                              e.target.value.toUpperCase().includes("L1") ||
                              e.target.value.toUpperCase().includes("LICENCE 1")
                            ) {
                              setTypeInscription("inscrit");
                            }
                          }}
                          disabled={isPending}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500]"
                        >
                          {LICENCES.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block mb-1">
                          Département / Filière *
                        </label>
                        <select
                          value={programme}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProgramme(val);
                            if (val !== "__AUTRE__") setCustomProgramme("");
                          }}
                          disabled={isPending}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500]"
                        >
                          {PROGRAMMES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                          <option value="__AUTRE__">
                            ➕ Autre département (saisie libre)...
                          </option>
                        </select>
                      </div>
                    </div>

                    {programme === "__AUTRE__" && (
                      <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#383838] space-y-1 animate-in fade-in duration-200">
                        <label className="text-[11px] font-semibold text-[#FFA500] block">
                          Nom du département personnalisé *
                        </label>
                        <Input
                          autoFocus
                          required
                          placeholder="Ex: Génie Civil, Droit, Philosophie..."
                          value={customProgramme}
                          onChange={(e) => setCustomProgramme(e.target.value)}
                          disabled={isPending}
                          className="bg-white dark:bg-[#1a1a1a]"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#383838] text-xs font-semibold text-[#171717] dark:text-white">
                    {member.licence} - {member.programme}
                  </div>
                )}
              </div>

              {/* DOMAINE DE FORMATION (SECTION) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#FFA500]" />
                  Domaine de formation (Section CJP) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SECTIONS_FORMATION.map((sec) => {
                    const isSelected = section === sec;
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => setSection(sec)}
                        disabled={isPending}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between cursor-pointer",
                          isSelected
                            ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#171717] dark:text-white font-medium shadow-xs"
                            : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] text-[#737373] dark:text-[#A3A3A3] hover:border-[#FFA500]/50"
                        )}
                      >
                        <span className="font-semibold">{sec}</span>
                        {isSelected && (
                          <span className="text-[10px] text-[#FFA500] font-bold flex items-center gap-0.5 mt-1">
                            <Check className="w-3 h-3" /> Sélectionné
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TYPE D'ADHÉSION & TARIF */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center justify-between">
                  <span>Type d&apos;adhésion & Tarif *</span>
                  {isL1 && (
                    <span className="text-[10px] text-[#FFA500] font-normal">
                      Obligatoirement Inscription pour L1
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTypeInscription("inscrit")}
                    disabled={isPending}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer",
                      typeInscription === "inscrit"
                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                        : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] opacity-70 hover:opacity-100"
                    )}
                  >
                    <div className="font-semibold text-xs">Inscription</div>
                    <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      20 000 GNF
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isL1) setTypeInscription("reinscrit");
                    }}
                    disabled={isPending || isL1}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      isL1
                        ? "border-[#E5E5E5] dark:border-[#383838] bg-gray-100 dark:bg-[#1a1a1a] opacity-40 cursor-not-allowed"
                        : typeInscription === "reinscrit"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 cursor-pointer"
                        : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] opacity-70 hover:opacity-100 cursor-pointer"
                    )}
                  >
                    <div className="font-semibold text-xs">Réinscription</div>
                    <div className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      10 000 GNF
                    </div>
                  </button>
                </div>
              </div>

              {/* STATUT */}
              <div>
                <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block mb-1">
                  Statut du membre
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500]"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </form>

            {/* 3. PIED DE PAGE FIXE */}
            <div className="p-3.5 sm:p-4 border-t border-[#E5E5E5] dark:border-[#333333] shrink-0 bg-[#F7F7F7]/95 dark:bg-[#171717]/95 backdrop-blur-md flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClose}
                disabled={isPending}
                className="cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="edit-member-form"
                variant="primary"
                size="md"
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-[#171717] font-bold shadow-xs cursor-pointer"
              >
                {isPending ? (
                  <span>Enregistrement...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#171717]" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

