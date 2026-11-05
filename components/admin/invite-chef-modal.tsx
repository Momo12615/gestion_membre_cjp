"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Send,
  X,
  Smartphone,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";
import { inviteChefDeClasseAction } from "@/actions/invitations";
import { PROGRAMMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LICENCES = ["L1", "L2", "L3", "L4", "Master 1", "Master 2"];

interface InviteChefModalProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function InviteChefModal({ className, size = "sm" }: InviteChefModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licence, setLicence] = useState("L2");
  const [programme, setProgramme] = useState<string>(PROGRAMMES[0]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    invitationUrl?: string;
    smsSent?: boolean;
    smsError?: string;
    phone?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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
    setFullName("");
    setPhone("");
    setEmail("");
    setLicence("L2");
    setProgramme(PROGRAMMES[0]);
    setErrorMessage(null);
    setSuccessResult(null);
    setCopied(false);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isPending) {
      setIsOpen(false);
      if (successResult) {
        router.refresh();
      }
    }
  };

  const handleCopy = () => {
    if (successResult?.invitationUrl) {
      navigator.clipboard.writeText(successResult.invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessResult(null);

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage("Veuillez renseigner le nom complet et le numéro de téléphone.");
      return;
    }

    startTransition(async () => {
      const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await inviteChefDeClasseAction({
        fullName: fullName.trim(),
        phone: phone.trim(),
        licence,
        programme,
        email: email.trim() || undefined,
        clientOrigin,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de l'envoi de l'invitation.");
        return;
      }

      setSuccessResult({
        invitationUrl: res.invitationUrl,
        smsSent: res.smsSent,
        smsError: res.smsError,
        phone: res.phone,
      });
      router.refresh();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size={size}
        onClick={handleOpen}
        leftIcon={<Smartphone className="w-4 h-4 text-[#171717]" />}
        className={cn(
          "bg-gradient-to-r from-[#FFA500] via-[#FFB800] to-[#FF8C00] text-[#171717] font-semibold shadow-xs hover:shadow-md cursor-pointer",
          className
        )}
      >
        <span>Inviter Chef (SMS)</span>
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
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base sm:text-lg truncate">
                      Inviter un Chef de Classe
                    </h3>
                    <Badge variant="cjp" size="sm" className="hidden xs:inline-flex text-[10px]">
                      Nimba SMS
                    </Badge>
                  </div>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate">
                    Invitation par SMS avec lien sécurisé d&apos;activation
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
              id="invite-chef-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain"
            >
              {/* MESSAGES D'ALERTE */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* RÉSULTAT DU SUCCÈS D'ENVOI */}
              {successResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Invitation générée avec succès !</p>
                      <p className="mt-0.5 text-xs">
                        {successResult.smsSent ? (
                          <>
                            SMS envoyé avec succès au numéro{" "}
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                              {successResult.phone}
                            </span>{" "}
                            via la passerelle Nimba SMS (Expéditeur : GuineeEcole).
                          </>
                        ) : (
                          <>
                            L&apos;invitation a été enregistrée, mais l&apos;envoi automatique du SMS
                            a rencontré une alerte ({successResult.smsError || "Erreur SMS"}).
                            Vous pouvez copier le lien ci-dessous et lui envoyer directement.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {successResult.invitationUrl && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 block">
                        Lien d&apos;invitation unique (48h) :
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={successResult.invitationUrl}
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-emerald-300 dark:border-emerald-800 text-xs font-mono select-all text-[#171717] dark:text-white"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleCopy}
                          className="gap-1.5 text-xs h-9 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NOM COMPLET */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FFA500]" />
                  Nom complet du Chef de classe *
                </label>
                <Input
                  required
                  placeholder="Ex: Mamadou Bah ou Aïssatou Diallo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* TÉLÉPHONE GUINÉE (NIMBA SMS) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FFA500]" />
                    Numéro de Téléphone (destinataire SMS) *
                  </span>
                  <span className="text-[10px] text-[#FFA500] font-mono">Format : 6XX XX XX XX</span>
                </label>
                <Input
                  type="tel"
                  required
                  placeholder="Ex: 620 00 00 00 ou +224 620 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                />
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                  Le SMS d&apos;invitation sera expédié automatiquement à ce numéro.
                </p>
              </div>

              {/* CLASSE ET PROMOTION ASSIGNÉE */}
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#171717] dark:text-white">
                    <GraduationCap className="w-4 h-4 text-[#FFA500]" />
                    <span>Classe & Promotion Assignée</span>
                  </div>
                  <Badge variant="cjp" size="sm" className="text-[10px]">
                    Verrouillage Strict
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block mb-1">
                      Niveau / Licence *
                    </label>
                    <select
                      value={licence}
                      onChange={(e) => setLicence(e.target.value)}
                      disabled={isPending}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500] cursor-pointer"
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
                      Programme / Filière *
                    </label>
                    <select
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      disabled={isPending}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500] cursor-pointer"
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

              {/* EMAIL OPTIONNEL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FFA500]" />
                    Adresse Email (Optionnelle)
                  </span>
                  <span className="text-[10px] text-[#737373] dark:text-[#A3A3A3]">Auto-généré si vide</span>
                </label>
                <Input
                  type="email"
                  placeholder="Ex: chef.classe@cjp.edu (facultatif)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* APERÇU DU MESSAGE SMS */}
              <div className="p-3 rounded-xl bg-[#FFF4D6]/50 dark:bg-[#FFA500]/10 border border-[#FFA500]/25 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#171717] dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#FFA500]" />
                    Aperçu du SMS envoyé (Expéditeur : GuineeEcole)
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#737373] dark:text-[#D4D4D4] leading-relaxed bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-[#FFA500]/15">
                  &ldquo;CJP: Bonjour {fullName || "[Nom complet]"}, vous etes designe(e) Chef de classe ({licence} - {programme}). Activez votre acces ici : https://.../invitation?token=...&rdquo;
                </p>
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
                {successResult ? "Fermer" : "Annuler"}
              </Button>
              <Button
                type="submit"
                form="invite-chef-form"
                variant="primary"
                size="md"
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-[#171717] font-bold shadow-xs cursor-pointer"
              >
                {isPending ? (
                  <span>Envoi du SMS en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#171717]" />
                    <span>Envoyer l&apos;invitation par SMS</span>
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

