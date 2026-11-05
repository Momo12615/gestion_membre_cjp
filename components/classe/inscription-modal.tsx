"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X, UserPlus, GraduationCap, AlertCircle, CheckCircle2, ShieldCheck, Mail, Phone, User, BookOpen } from "lucide-react";
import { createMember } from "@/actions/members";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
import { SECTIONS_FORMATION } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface InscriptionModalProps {
  chefLicence: string;
  chefProgramme: string;
}

export function InscriptionModal({ chefLicence, chefProgramme }: InscriptionModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isL1 = chefLicence.toUpperCase().includes("L1") || chefLicence.toUpperCase().includes("LICENCE 1");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [typeInscription, setTypeInscription] = useState<"inscrit" | "reinscrit">("inscrit");
  const [section, setSection] = useState<string>("Dev Mobile & Site Web");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setTypeInscription("inscrit");
    setSection("Dev Mobile & Site Web");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleOpen = () => {
    resetForm();
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
      setErrorMessage("Veuillez remplir le prénom, le nom et l'email de l'étudiant.");
      return;
    }

    startTransition(async () => {
      const finalType = isL1 ? "inscrit" : typeInscription;
      const res = await createMember({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || undefined,
        licence: chefLicence,
        programme: chefProgramme,
        role_club: "Membre",
        type_inscription: finalType,
        section: section as any,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de l'enregistrement de l'étudiant.");
        return;
      }

      setSuccessMessage(
        `Étudiant ${firstName} ${lastName} inscrit avec succès (${
          finalType === "inscrit" ? "20 000 GNF" : "10 000 GNF"
        }) !`
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    });
  };

  const montantActuel = isL1 || typeInscription === "inscrit" ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION;

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={handleOpen}
        leftIcon={<Plus className="w-4 h-4 text-[#171717]" />}
      >
        <span>Inscrire un étudiant</span>
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
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-base sm:text-lg truncate">Inscrire un Étudiant</h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate">
                    Enregistrement officiel pour votre classe
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

            {/* 2. CORPS DU FORMULAIRE SCROLLABLE */}
            <form
              id="inscription-etudiant-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain"
            >
              {/* VERROUILLAGE CLASSE */}
              <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#737373] dark:text-[#A3A3A3]">
                  <GraduationCap className="w-4 h-4 text-[#FFA500]" />
                  Classe verrouillée :
                </span>
                <span className="font-heading font-bold text-[#FFA500] px-2 py-0.5 rounded-lg bg-[#FFA500]/10 border border-[#FFA500]/20">
                  {chefLicence} - {chefProgramme}
                </span>
              </div>

              {/* MESSAGES D'ALERTE */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 text-xs text-[#16A34A] dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* IDENTITÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom *"
                  placeholder="ex: Mamadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isPending}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom *"
                  placeholder="ex: Diallo"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              {/* CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Adresse Email *"
                  type="email"
                  placeholder="etudiant@cjp.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Numéro de Téléphone"
                  type="tel"
                  placeholder="ex: +224 620 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              {/* DOMAINE DE FORMATION (SECTION) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#FFA500]" />
                  Domaine de formation souhaité (Section) *
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
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] ring-1 ring-[#FFA500]"
                            : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#737373] dark:text-[#A3A3A3] hover:border-[#FFA500]/50"
                        }`}
                      >
                        <span className="font-heading font-semibold text-xs text-[#171717] dark:text-white leading-tight">
                          {sec}
                        </span>
                        <span className="text-[10px] mt-1 text-[#737373] dark:text-[#A3A3A3]">
                          {sec === "Dev Mobile & Site Web"
                            ? "Flutter, React, Web"
                            : sec === "Réseau & Cybersécurité"
                            ? "Cisco, Sécurité, Linux"
                            : "Bureautique, Outils Pro"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TYPE D'INSCRIPTION & TARIF */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#171717] dark:text-white flex items-center justify-between">
                  <span>Type d&apos;adhésion & Tarif</span>
                  {isL1 && (
                    <Badge variant="cjp" size="sm">
                      L1 : Inscription Forcée
                    </Badge>
                  )}
                </label>

                {isL1 ? (
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Première Inscription (L1 Obligatoire)
                      </p>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                        Tous les étudiants de Licence 1 sont de nouveaux membres.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      20 000 GNF
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTypeInscription("inscrit")}
                      disabled={isPending}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        typeInscription === "inscrit"
                          ? "border-[#16A34A] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500"
                          : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#737373] dark:text-[#A3A3A3]"
                      }`}
                    >
                      <div className="font-semibold text-xs text-[#171717] dark:text-white">
                        Nouvelle Inscription
                      </div>
                      <div className="font-mono font-bold text-sm text-[#16A34A] mt-1">
                        20 000 GNF
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTypeInscription("reinscrit")}
                      disabled={isPending}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        typeInscription === "reinscrit"
                          ? "border-[#EAB308] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500"
                          : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#737373] dark:text-[#A3A3A3]"
                      }`}
                    >
                      <div className="font-semibold text-xs text-[#171717] dark:text-white">
                        Réinscription
                      </div>
                      <div className="font-mono font-bold text-sm text-[#EAB308] mt-1">
                        10 000 GNF
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* ENCAISSEMENT RÉSUMÉ */}
              <div className="p-3.5 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#FFA500] shrink-0" />
                  <span className="font-medium text-[#171717] dark:text-white">
                    Montant à percevoir :
                  </span>
                </div>
                <span className="font-heading font-bold text-base text-[#171717] dark:text-[#FFA500] font-mono shrink-0">
                  {montantActuel.toLocaleString("fr-FR")} GNF
                </span>
              </div>
            </form>

            {/* 3. PIED DE PAGE FIXE */}
            <div className="p-3.5 sm:p-4 border-t border-[#E5E5E5] dark:border-[#333333] shrink-0 bg-[#F7F7F7]/95 dark:bg-[#171717]/95 backdrop-blur-md flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isPending}
                onClick={handleClose}
                className="cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="inscription-etudiant-form"
                variant="primary"
                size="md"
                isLoading={isPending}
                className="cursor-pointer"
              >
                Encaisser et Inscrire
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
