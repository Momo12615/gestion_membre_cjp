"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Coins,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Trash2,
  Plus,
  Loader2,
  User,
  FileText,
} from "lucide-react";
import { recordVersement, deleteVersement } from "@/actions/versements";
import { Versement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecordVersementModalProps {
  chefId: number;
  chefName: string;
  chefEmail: string;
  classeName?: string;
  totalCollecte: number;
  totalVerse: number;
  versements: Versement[];
  className?: string;
}

export function RecordVersementModal({
  chefId,
  chefName,
  chefEmail,
  classeName,
  totalCollecte,
  totalVerse,
  versements,
  className,
}: RecordVersementModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resteAVerser = Math.max(0, totalCollecte - totalVerse);

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
    setAmount("");
    setNotes("");
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

    const parsedAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Veuillez saisir un montant valide supérieur à 0 GNF.");
      return;
    }

    startTransition(async () => {
      const res = await recordVersement({
        chef_id: chefId,
        amount: parsedAmount,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de l'enregistrement du versement.");
        return;
      }

      setSuccessMessage(
        `Versement de ${parsedAmount.toLocaleString("fr-FR")} GNF enregistré avec succès !`
      );
      resetForm();
      router.refresh();
    });
  };

  const handleDeleteVersement = (versementId: number, versementAmount: number) => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le versement de ${versementAmount.toLocaleString(
          "fr-FR"
        )} GNF ?\n\nCette action recalcule automatiquement le solde restant du chef de classe.`
      )
    ) {
      setDeletingId(versementId);
      startTransition(async () => {
        const res = await deleteVersement(versementId);
        setDeletingId(null);
        if (!res.success) {
          alert(res.error || "Erreur lors de la suppression du versement.");
        } else {
          router.refresh();
        }
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={cn(
          "text-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFF4D6] dark:hover:bg-[#FFA500]/15 border-[#FFA500]/40 cursor-pointer h-8 px-2.5 gap-1.5 shrink-0 text-xs font-semibold",
          className
        )}
        title="Gérer les versements de ce chef de classe"
      >
        <Coins className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Versements</span>
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
                  <Coins className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-base sm:text-lg truncate">
                    Versements & Remises de Fonds
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate">
                    {chefName} {classeName ? `• ${classeName}` : ""}
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
              {/* MESSAGES D'ALERTE */}
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

              {/* CARTE RÉCAPITULATIF FINANCIER */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F7F7F7] to-[#FFF4D6]/30 dark:from-[#222222] dark:to-[#FFA500]/5 border border-[#FFA500]/25 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#171717] dark:text-white">
                  <span>Situation Financière de la Classe</span>
                  {resteAVerser === 0 && totalCollecte > 0 ? (
                    <Badge variant="success" size="sm" className="text-[10px]">
                      Entièrement Réglé ✅
                    </Badge>
                  ) : resteAVerser > 0 ? (
                    <Badge variant="warning" size="sm" className="text-[10px]">
                      Solde Dû
                    </Badge>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#383838]">
                    <div className="text-[10px] text-[#737373] dark:text-[#A3A3A3] uppercase font-medium">
                      Collecté
                    </div>
                    <div className="font-heading font-bold text-xs sm:text-sm text-[#171717] dark:text-white mt-0.5">
                      {totalCollecte.toLocaleString("fr-FR")} GNF
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-emerald-200 dark:border-emerald-900/50">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-medium">
                      Déjà Versé
                    </div>
                    <div className="font-heading font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {totalVerse.toLocaleString("fr-FR")} GNF
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-amber-200 dark:border-amber-900/50">
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-medium">
                      Reste à Verser
                    </div>
                    <div className="font-heading font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                      {resteAVerser.toLocaleString("fr-FR")} GNF
                    </div>
                  </div>
                </div>
              </div>

              {/* FORMULAIRE D'ENREGISTREMENT */}
              <form
                id="record-versement-form"
                onSubmit={handleSubmit}
                className="p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#202020] border border-[#E5E5E5] dark:border-[#383838] space-y-3"
              >
                <div className="text-xs font-semibold text-[#171717] dark:text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#FFA500]" />
                  Enregistrer une nouvelle remise d&apos;argent
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] flex items-center justify-between">
                    <span>Montant perçu en GNF *</span>
                    {resteAVerser > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(resteAVerser))}
                        className="text-[10px] text-[#FFA500] hover:underline cursor-pointer font-semibold"
                      >
                        Saisir tout le reste ({resteAVerser.toLocaleString("fr-FR")} GNF)
                      </button>
                    )}
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 50000"
                    min="1"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isPending}
                    className="bg-white dark:bg-[#1a1a1a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] block">
                    Mode ou note (optionnel)
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Espèces à la permanence, Orange Money, Reçu #04..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isPending}
                    className="bg-white dark:bg-[#1a1a1a]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending || !amount.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-[#171717] font-bold cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement du versement...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>Valider l&apos;encaissement</span>
                    </>
                  )}
                </Button>
              </form>

              {/* HISTORIQUE DES VERSEMENTS */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#171717] dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FFA500]" />
                    Historique des versements ({versements.length})
                  </span>
                  <span className="text-[10px] text-[#737373] dark:text-[#A3A3A3]">
                    Total versé : {totalVerse.toLocaleString("fr-FR")} GNF
                  </span>
                </div>

                {versements.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#E5E5E5] dark:border-[#383838] text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Aucun versement n&apos;a encore été enregistré pour ce chef de classe.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {versements.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#202020] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                              +{v.amount.toLocaleString("fr-FR")} GNF
                            </span>
                            <span className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                              le {new Date(v.created_at).toLocaleDateString("fr-FR")} à{" "}
                              {new Date(v.created_at).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3] flex items-center gap-2">
                            <span>
                              Reçu par :{" "}
                              <strong className="text-[#171717] dark:text-white font-medium">
                                {v.recorded_by_name || "Admin"}
                              </strong>
                            </span>
                            {v.notes && (
                              <span className="italic truncate text-[10px] text-[#FFA500]">
                                &ldquo;{v.notes}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVersement(v.id, v.amount)}
                          disabled={isPending || deletingId === v.id}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 shrink-0 cursor-pointer"
                          title="Supprimer ce versement"
                        >
                          {deletingId === v.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. PIED DE PAGE FIXE */}
            <div className="p-3.5 sm:p-4 border-t border-[#E5E5E5] dark:border-[#333333] shrink-0 bg-[#F7F7F7]/95 dark:bg-[#171717]/95 backdrop-blur-md flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClose}
                disabled={isPending}
                className="cursor-pointer"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
