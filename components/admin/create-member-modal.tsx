"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  X,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { createMember } from "@/actions/members";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
import { SECTIONS_FORMATION, SectionFormation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const LICENCES = ["L1", "L2", "L3", "L4", "Master 1", "Master 2"];
const PROGRAMMES = [
  "Génie Logiciel",
  "Systèmes d'Information (MSI)",
  "Réseaux & Télécommunications",
  "MIAGE",
  "Sécurité & Cyberdéfense",
  "Autre",
];

export function CreateMemberModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licence, setLicence] = useState("L1");
  const [programme, setProgramme] = useState("Génie Logiciel");
  const [typeInscription, setTypeInscription] = useState<"inscrit" | "reinscrit">("inscrit");
  const [section, setSection] = useState<SectionFormation>("Dev Mobile & Site Web");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isL1 = licence.toUpperCase().includes("L1") || licence.toUpperCase().includes("LICENCE 1");

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setLicence("L1");
    setProgramme("Génie Logiciel");
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

  const handleLicenceChange = (val: string) => {
    setLicence(val);
    if (val.toUpperCase().includes("L1") || val.toUpperCase().includes("LICENCE 1")) {
      setTypeInscription("inscrit");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage("Veuillez remplir le prénom, le nom et l'email du membre.");
      return;
    }

    startTransition(async () => {
      const finalType = isL1 ? "inscrit" : typeInscription;
      const res = await createMember({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || undefined,
        licence: licence,
        programme: programme,
        role_club: "Membre",
        type_inscription: finalType,
        section: section,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de l'enregistrement du membre.");
        return;
      }

      setSuccessMessage(
        `Membre ${firstName} ${lastName} inscrit avec succès (${section} • ${
          finalType === "inscrit" ? "20 000 GNF" : "10 000 GNF"
        }) !`
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    });
  };

  const montantActuel = (isL1 || typeInscription === "inscrit") ? TARIF_INSCRIPTION : TARIF_REINSCRIPTION;

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="primary"
        size="md"
        className="w-full sm:w-auto shadow-sm gap-2"
      >
        <UserPlus className="w-4 h-4" />
        <span>Inscrire un Membre</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg my-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E5E5] dark:border-[#383838] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* EN-TÊTE MODALE */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between bg-radial from-[#FFA500]/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/20 flex items-center justify-center text-[#FFA500]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#171717] dark:text-white">
                    Inscrire un Nouveau Membre
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Enregistrement direct dans le registre CJP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#262626] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* IDENTITÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FFA500]" />
                    Prénom *
                  </label>
                  <Input
                    required
                    placeholder="Ex: Ibrahima"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FFA500]" />
                    Nom *
                  </label>
                  <Input
                    required
                    placeholder="Ex: Diallo"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FFA500]" />
                    Email *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="etudiant@cjp.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FFA500]" />
                    Téléphone (optionnel)
                  </label>
                  <Input
                    type="tel"
                    placeholder="Ex: +224 620 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* CLASSE & PROMOTION */}
              <div className="p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#171717] dark:text-white">
                  <GraduationCap className="w-4 h-4 text-[#FFA500]" />
                  <span>Classe & Niveau de l&apos;étudiant</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block mb-1">
                      Niveau / Licence *
                    </label>
                    <select
                      value={licence}
                      onChange={(e) => handleLicenceChange(e.target.value)}
                      disabled={isPending}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1c1c1c] text-[#171717] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFA500]"
                    >
                      {LICENCES.map((l) => (
                        <option key={l} value={l}>
                          {l} {l === "L1" ? "(Obligatoirement Inscription)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block mb-1">
                      Programme / Filière *
                    </label>
                    <select
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      disabled={isPending}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1c1c1c] text-[#171717] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFA500]"
                    >
                      {PROGRAMMES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center justify-between">
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
                      className={`p-3 rounded-xl border text-left transition-all ${
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
                      className={`p-3 rounded-xl border text-left transition-all ${
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

              {/* RÉSUMÉ */}
              <div className="p-3 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-center justify-between">
                <span className="text-xs text-[#737373] dark:text-[#E5E5E5]">
                  Montant à percevoir :
                </span>
                <span className="font-mono font-bold text-base text-[#FFA500]">
                  {montantActuel.toLocaleString("fr-FR")} GNF
                </span>
              </div>

              {/* BOUTONS ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5E5E5] dark:border-[#333333]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? (
                    <span>Enregistrement en cours...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Valider l&apos;Inscription</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
