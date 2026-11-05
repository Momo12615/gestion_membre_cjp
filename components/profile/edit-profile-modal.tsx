"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  UserCog,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateOwnProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditProfileModalProps {
  user: {
    id: number;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    permission_name?: string | null;
  };
  trigger?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EditProfileModal({
  user,
  trigger,
  className,
  size = "sm",
}: EditProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleOpen = () => {
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
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

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Veuillez renseigner votre prénom et votre nom de famille.");
      return;
    }

    if (password.trim() && password.trim().length < 6) {
      setErrorMessage("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password.trim() && password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    startTransition(async () => {
      const res = await updateOwnProfile({
        first_name: firstName,
        last_name: lastName,
        password: password.trim() ? password.trim() : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de la mise à jour du profil.");
        return;
      }

      setSuccessMessage("Votre profil a été mis à jour avec succès !");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1000);
    });
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpen} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          size={size}
          onClick={handleOpen}
          leftIcon={<UserCog className="w-4 h-4 text-[#FFA500]" />}
          className={cn("hover:border-[#FFA500]/50", className)}
        >
          <span>Modifier mon profil</span>
        </Button>
      )}

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
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] dark:text-white truncate">
                    Modifier mon profil
                  </h2>
                  <Badge variant="cjp" size="sm" className="shrink-0">
                    {user.permission_name || "Bureau"}
                  </Badge>
                </div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5 truncate">
                  Mettez à jour vos informations personnelles et identifiants.
                </p>
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
              id="edit-profile-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain"
            >
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Prénom & Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom *"
                  type="text"
                  required
                  placeholder="ex: Mamadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom de famille *"
                  type="text"
                  required
                  placeholder="ex: Diallo"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* Adresse Email (verrouillée) */}
              <div>
                <label className="block text-xs font-medium text-[#171717] dark:text-white mb-1.5">
                  Adresse Email de connexion
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-10 px-3 pl-9 rounded-xl bg-[#F7F7F7] dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#333333] text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] cursor-not-allowed select-none"
                  />
                  <Mail className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-[#737373] bg-[#E5E5E5] dark:bg-[#2B2B2B] px-1.5 py-0.5 rounded">
                    Fixe
                  </span>
                </div>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-1">
                  L&apos;adresse email officielle est verrouillée pour des raisons de sécurité.
                </p>
              </div>

              {/* Nouveau mot de passe */}
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717] dark:text-white">
                    <Lock className="w-3.5 h-3.5 text-[#FFA500]" />
                    <span>Changer de mot de passe (optionnel)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#737373] hover:text-[#171717] dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Masquer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Afficher</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nouveau mot de passe"
                    type={showPassword ? "text" : "password"}
                    placeholder="Laisser vide si inchangé"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    label="Confirmer le mot de passe"
                    type={showPassword ? "text" : "password"}
                    placeholder="Répéter le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3]">
                  Laissez ces champs vides si vous souhaitez conserver votre mot de passe actuel.
                </p>
              </div>
            </form>

            {/* 3. PIED DE PAGE FIXE */}
            <div className="p-3.5 sm:p-4 border-t border-[#E5E5E5] dark:border-[#333333] shrink-0 bg-[#F7F7F7]/95 dark:bg-[#171717]/95 backdrop-blur-md flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isPending}
                className="cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="edit-profile-form"
                variant="primary"
                size="sm"
                isLoading={isPending}
                className="cursor-pointer"
              >
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
