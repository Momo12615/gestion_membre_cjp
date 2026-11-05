"use client";

import React, { useState, useTransition } from "react";
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

interface EditProfileModalProps {
  user: {
    id: number;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    permission_name?: string | null;
  };
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        leftIcon={<UserCog className="w-4 h-4 text-[#FFA500]" />}
        className="hover:border-[#FFA500]/50"
      >
        <span>Modifier mon profil</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/20 text-[#171717] dark:text-white"
            role="dialog"
            aria-modal="true"
          >
            {/* Entête */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#E5E5E5] dark:border-[#333333]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] dark:text-white">
                    Modifier mon profil
                  </h2>
                  <Badge variant="cjp" size="sm">
                    {user.permission_name || "Bureau"}
                  </Badge>
                </div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                  Mettez à jour vos informations personnelles et vos identifiants.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-1 rounded-lg text-[#737373] hover:text-[#171717] dark:hover:text-white hover:bg-[#F2F2F2] dark:hover:bg-[#2B2B2B] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alertes */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="text-[11px] text-[#737373] hover:text-[#171717] dark:hover:text-white flex items-center gap-1 transition-colors"
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

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E5E5] dark:border-[#333333]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPending}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

