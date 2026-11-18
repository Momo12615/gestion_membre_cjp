"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Coins,
  X,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { createMember } from "@/actions/members";
import { updateOrganisateur } from "@/actions/organisateurs";
import { TARIF_REINSCRIPTION, PROGRAMMES } from "@/lib/constants";
import { SECTIONS_FORMATION, SectionFormation, Organisateur } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const LICENCES = ["L2", "L3", "L4", "Master 1", "Master 2"];

interface ReinscrireOrganisateurModalProps {
  organisateur: Organisateur;
  trigger?: React.ReactNode;
}

export function ReinscrireOrganisateurModal({
  organisateur,
  trigger,
}: ReinscrireOrganisateurModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState(organisateur.email || "");
  const [phone, setPhone] = useState(organisateur.phone || "");
  const [licence, setLicence] = useState("L3");
  const [programme, setProgramme] = useState<string>(PROGRAMMES[0]);
  const [customProgramme, setCustomProgramme] = useState("");
  const [section, setSection] = useState<SectionFormation>("Dev Mobile & Site Web");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setEmail(organisateur.email || "");
      setPhone(organisateur.phone || "");
      setErrorMessage(null);
      setSuccessMessage(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, organisateur]);

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
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage("L'adresse email est requise pour réinscrire ce responsable.");
      return;
    }

    const finalProgramme = programme === "Autre" ? customProgramme.trim() : programme.trim();
    if (!finalProgramme) {
      setErrorMessage("Veuillez renseigner le programme / filière d'études.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createMember({
          first_name: organisateur.first_name.trim(),
          last_name: organisateur.last_name.trim(),
          email: emailTrimmed.toLowerCase(),
          phone: phone.trim() || undefined,
          licence: licence.trim(),
          programme: finalProgramme,
          role_club: organisateur.role,
          type_inscription: "reinscrit",
          section: section,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Impossible d'enregistrer la réinscription.");
          return;
        }

        // Si l'organisateur n'avait pas son email ou téléphone dans la table organisateur, on synchronise
        if (!organisateur.email || !organisateur.phone) {
          try {
            await updateOrganisateur({
              id: organisateur.id,
              first_name: organisateur.first_name,
              last_name: organisateur.last_name,
              role: organisateur.role,
              email: emailTrimmed.toLowerCase(),
              phone: phone.trim() || undefined,
            });
          } catch (_) {
            // Ignorer l'erreur secondaire de synchronisation
          }
        }

        setSuccessMessage("Réinscription du membre du comité validée avec succès ! (10 000 GNF)");
        router.refresh();

        setTimeout(() => {
          handleClose();
        }, 1200);
      } catch (err: any) {
        setErrorMessage(err.message || "Une erreur inattendue est survenue.");
      }
    });
  };

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen}>{trigger}</span>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleOpen}
          className="h-7 px-2.5 text-[11px] font-medium border-[#FFA500]/40 text-[#FFA500] hover:bg-[#FFA500]/10 hover:border-[#FFA500] gap-1 cursor-pointer shrink-0"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Réinscrire</span>
        </Button>
      )}

      {mounted &&
        isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reinscrire-orga-title"
          >
            <div
              className="fixed inset-0"
              onClick={() => {
                if (!isPending) handleClose();
              }}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-3xl border border-[#E5E5E5] dark:border-[#383838] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#171717] dark:text-white">
              {/* EN-TÊTE DE LA MODAL */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#333333] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] shrink-0 border border-[#FFA500]/30">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="reinscrire-orga-title"
                      className="font-heading font-bold text-base sm:text-lg leading-tight flex items-center gap-2"
                    >
                      <span>Réinscription Membre Comité</span>
                      <Badge variant="cjp" size="sm">
                        Obligatoire
                      </Badge>
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                      {organisateur.first_name} {organisateur.last_name} • {organisateur.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="p-1.5 sm:p-2 rounded-xl text-[#737373] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#262626] transition-colors cursor-pointer shrink-0"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CORPS DU FORMULAIRE */}
              <form
                id="reinscrire-orga-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
              >
                {/* BANDEAU TARIF RÉINSCRIPTION OBLIGATOIRE */}
                <div className="p-3.5 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-[#B45309] dark:text-[#FFA500]">
                      Cotisation annuelle Comité CJP
                    </span>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                      Tarif de réinscription fixé pour les membres du bureau
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-sm sm:text-base text-[#FFA500]">
                      {TARIF_REINSCRIPTION.toLocaleString("fr-FR")} GNF
                    </span>
                    <span className="block text-[9px] text-[#737373] dark:text-[#A3A3A3]">
                      Statut Réinscrit
                    </span>
                  </div>
                </div>

                {/* MESSAGES DE STATUT */}
                {errorMessage && (
                  <div
                    className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 animate-in fade-in"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in"
                    role="alert"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* IDENTITÉ DU MEMBRE */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#737373] dark:text-[#A3A3A3]">
                    Responsable du Comité
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#FFA500]" />
                      <span className="font-semibold text-[#171717] dark:text-white">
                        {organisateur.first_name} {organisateur.last_name}
                      </span>
                    </div>
                    <Badge variant="outline" size="sm" className="font-medium text-[10px]">
                      {organisateur.role}
                    </Badge>
                  </div>
                </div>

                {/* EMAIL & TÉLÉPHONE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="orga-email"
                      className="block text-xs font-medium text-[#737373] dark:text-[#A3A3A3]"
                    >
                      Email officiel ou personnel <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                      <Input
                        id="orga-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@cjp.edu"
                        className="pl-8 text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="orga-phone"
                      className="block text-xs font-medium text-[#737373] dark:text-[#A3A3A3]"
                    >
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                      <Input
                        id="orga-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+224 6XX XX XX XX"
                        className="pl-8 text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* FILIÈRE UNIVERSITAIRE (LICENCE & PROGRAMME) */}
                <div className="p-3.5 rounded-2xl bg-[#F7F7F7]/60 dark:bg-[#222222]/50 border border-[#E5E5E5] dark:border-[#333333] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717] dark:text-white">
                    <GraduationCap className="w-4 h-4 text-[#FFA500]" />
                    <span>Cursus universitaire du responsable</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="orga-licence"
                        className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]"
                      >
                        Niveau / Licence <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="orga-licence"
                        value={licence}
                        onChange={(e) => setLicence(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838] text-xs text-[#171717] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 cursor-pointer"
                      >
                        {LICENCES.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="orga-programme"
                        className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]"
                      >
                        Programme / Filière <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="orga-programme"
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838] text-xs text-[#171717] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 cursor-pointer"
                      >
                        {PROGRAMMES.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {programme === "Autre" && (
                    <div className="space-y-1">
                      <label
                        htmlFor="orga-custom-prog"
                        className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]"
                      >
                        Précisez la filière
                      </label>
                      <Input
                        id="orga-custom-prog"
                        type="text"
                        required
                        value={customProgramme}
                        onChange={(e) => setCustomProgramme(e.target.value)}
                        placeholder="Ex: Électronique, MIAGE..."
                        className="text-xs h-9"
                      />
                    </div>
                  )}
                </div>

                {/* SECTION DE FORMATION CJP SOUHAITÉE */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#737373] dark:text-[#A3A3A3]">
                    Section de formation CJP assignée
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SECTIONS_FORMATION.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSection(sec)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          section === sec
                            ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] shadow-xs"
                            : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#737373] dark:text-[#A3A3A3] hover:border-[#FFA500]/40"
                        }`}
                      >
                        <span className="text-[11px] font-semibold block leading-tight">{sec}</span>
                        <span className="text-[9px] mt-1 opacity-80 block">Atelier & Projets</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* PIED DE MODAL AVEC ACTIONS */}
              <div className="p-3.5 sm:p-5 border-t border-[#E5E5E5] dark:border-[#333333] shrink-0 bg-[#F7F7F7]/95 dark:bg-[#171717]/95 backdrop-blur-md flex items-center justify-end gap-2.5">
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
                  form="reinscrire-orga-form"
                  variant="primary"
                  size="md"
                  isLoading={isPending}
                  className="cursor-pointer font-semibold shadow-xs"
                >
                  Valider la Réinscription (10 000 GNF)
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
