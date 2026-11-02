"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UserPlus, GraduationCap, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { createMember } from "@/actions/members";
import { TARIF_INSCRIPTION, TARIF_REINSCRIPTION } from "@/lib/constants";
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
    if (!isPending) {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage("Veuillez renseigner le prénom, le nom et l'email de l'étudiant.");
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
        role_club: "Membre Étudiant",
        type_inscription: finalType,
        section: section,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de l'enregistrement.");
        return;
      }

      setSuccessMessage(
        `Étudiant ${firstName} ${lastName} enregistré avec succès (${section} • ${
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
        variant="primary"
        size="md"
        onClick={handleOpen}
        leftIcon={<Plus className="w-4 h-4 text-[#171717]" />}
      >
        <span>Inscrire un étudiant</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/20 text-[#171717] dark:text-white"
            role="dialog"
            aria-modal="true"
          >
            {/* EN-TÊTE MODALE */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-[#383838]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Inscrire un Étudiant</h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Enregistrement officiel pour votre classe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-1.5 rounded-xl border border-[#E5E5E5] dark:border-[#383838] text-[#737373] hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VERROUILLAGE CLASSE (RÈGLE MÉTIER CJP) */}
            <div className="my-4 p-3 rounded-2xl bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E5E5E5] dark:border-[#383838] flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#737373] dark:text-[#A3A3A3]">
                <GraduationCap className="w-4 h-4 text-[#FFA500]" />
                Classe d&apos;affectation verrouillée :
              </span>
              <span className="font-bold text-[#FFA500] font-mono px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15">
                {chefLicence} - {chefProgramme}
              </span>
            </div>

            {/* MESSAGES D'ALERTE */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 text-xs text-[#16A34A] dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SÉLECTEUR DE TYPE D'ADHÉSION & TARIF (RÈGLE L1 vs L2+) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] mb-2">
                  Type d&apos;Opération & Tarif
                </label>
                {isL1 ? (
                  <div className="p-3.5 rounded-2xl border border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 ring-2 ring-[#FFA500]/30 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-sm">Première Inscription</span>
                        <Badge variant="cjp" size="sm">20 000 GNF</Badge>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                        Obligatoire pour les promotions de Licence 1 (L1)
                      </p>
                    </div>
                    <Badge variant="neutral" size="sm">
                      L1 Imposé
                    </Badge>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTypeInscription("inscrit")}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all ${
                        typeInscription === "inscrit"
                          ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 ring-2 ring-[#FFA500]/30"
                          : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-heading font-semibold text-sm">Inscription</span>
                        <Badge variant="cjp" size="sm">20 000 GNF</Badge>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1">
                        Nouvel adhérent CJP
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTypeInscription("reinscrit")}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all ${
                        typeInscription === "reinscrit"
                          ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 ring-2 ring-[#FFA500]/30"
                          : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-heading font-semibold text-sm">Réinscription</span>
                        <Badge variant="warning" size="sm">10 000 GNF</Badge>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1">
                        Renouvellement annuel
                      </p>
                    </button>
                  </div>
                )}
              </div>

              {/* SÉLECTEUR DE DOMAINE DE FORMATION (SECTION) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] mb-2">
                  Domaine de Formation (Section)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: "Dev Mobile & Site Web", label: "Dev Mobile & Web", desc: "Flutter, React, Web" },
                    { key: "Réseau & Cybersécurité", label: "Réseau & Sécurité", desc: "Cisco, Linux, Sécurité" },
                    { key: "Outil Informatique", label: "Outils & Bureautique", desc: "Bureautique, Tech, IA" },
                  ].map((sec) => (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => setSection(sec.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        section === sec.key
                          ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 ring-2 ring-[#FFA500]/30 font-medium"
                          : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#171717] dark:text-white leading-tight">
                        {sec.label}
                      </p>
                      <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                        {sec.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CHAMPS PRÉNOM & NOM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom de l'étudiant"
                  required
                  placeholder="ex: Fanta"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Nom de l'étudiant"
                  required
                  placeholder="ex: Condé"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* EMAIL & TÉLÉPHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Adresse Email"
                  type="email"
                  required
                  placeholder="ex: fanta.conde@etudiant.cjp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Téléphone (WhatsApp)"
                  placeholder="+224 62X XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* RÉSUMÉ FINANCIER DE L'OPÉRATION */}
              <div className="p-3.5 rounded-2xl bg-[#FFF4D6]/60 dark:bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-center justify-between gap-2">
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

              {/* BOUTONS D'ACTION */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isPending}
                  className="w-full sm:w-auto"
                >
                  Encaisser et Inscrire
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
