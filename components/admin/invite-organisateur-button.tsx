"use client";

import React, { useState, useTransition } from "react";
import {
  Send,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  X,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Organisateur } from "@/lib/types";
import { createCommitteeInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InviteOrganisateurButtonProps {
  organisateur: Organisateur;
}

export function InviteOrganisateurButton({
  organisateur,
}: InviteOrganisateurButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setError(null);
    setCopied(false);
    setIsOpen(true);

    // Récupération dynamique de l'origine du navigateur (window.location.origin)
    const browserOrigin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    startTransition(async () => {
      const res = await createCommitteeInvitation(
        organisateur.id,
        browserOrigin
      );
      if (!res.success || !res.invitationUrl) {
        setError(res.error || "Impossible de générer le lien d'invitation.");
      } else {
        setInvitationUrl(res.invitationUrl);
      }
    });
  };

  const handleCopy = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      // Fallback si clipboard API bloqué
      const input = document.createElement("input");
      input.value = invitationUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Générer un lien d'activation de compte"
        className="p-1.5 rounded-lg text-[#737373] hover:text-[#FFA500] hover:bg-[#FFF4D6] dark:text-[#A3A3A3] dark:hover:text-[#FFA500] dark:hover:bg-[#FFA500]/10 transition-colors"
      >
        <Send className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#E5E5E5] dark:border-[#383838] shadow-2xl p-6 overflow-hidden">
            {/* Bouton fermer */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* En-tête de la modale */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30 flex items-center justify-center text-[#FFA500] shrink-0">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-base text-[#171717] dark:text-white">
                  Lien d&apos;invitation & Activation
                </h3>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                  {organisateur.first_name} {organisateur.last_name} • {organisateur.role}
                </p>
              </div>
            </div>

            {/* Contenu */}
            {isPending ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#FFA500] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                  Génération du lien sécurisé avec l&apos;adresse du navigateur...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 my-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F9F9F9] dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#383838] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#737373] dark:text-[#A3A3A3] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FFA500]" />
                      Lien unique d&apos;activation (48h) :
                    </span>
                    <Badge variant="cjp" size="sm">
                      Pré-rempli & Verrouillé
                    </Badge>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333333] font-mono text-[11px] text-[#171717] dark:text-white break-all select-all">
                    {invitationUrl}
                  </div>
                </div>

                <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] leading-relaxed">
                  Ce lien utilise l&apos;adresse actuelle de votre navigateur. En cliquant dessus, l&apos;organisateur aura son prénom, nom, email et rôle pré-remplis et verrouillés, et n&apos;aura plus qu&apos;à définir son mot de passe.
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleCopy}
                    className="flex-1"
                    leftIcon={
                      copied ? (
                        <Check className="w-4 h-4 text-emerald-900" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                  >
                    {copied ? "Lien copié dans le presse-papier !" : "Copier le lien d'invitation"}
                  </Button>

                  {invitationUrl && (
                    <a
                      href={invitationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-10 px-3 rounded-xl border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] transition-colors"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
