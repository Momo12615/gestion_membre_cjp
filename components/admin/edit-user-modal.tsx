"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Shield,
  GraduationCap,
} from "lucide-react";
import { updateUser } from "@/actions/users";
import { PermissionCode } from "@/lib/types";
import { PROGRAMMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface EditUserModalProps {
  user: {
    id: number;
    email: string;
    is_active: boolean;
    permission_id: number;
    permission_code: PermissionCode;
    permission_name: string;
    first_name?: string | null;
    last_name?: string | null;
    licence?: string | null;
    programme?: string | null;
    phone?: string | null;
    classe?: string | null;
  };
}

export function EditUserModal({ user }: EditUserModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PermissionCode>(user.permission_code);
  const [licence, setLicence] = useState(user.licence || "L2");
  const [programme, setProgramme] = useState(user.programme || PROGRAMMES[0]);
  const [isActive, setIsActive] = useState(user.is_active);

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
    setEmail(user.email || "");
    setPassword("");
    setRole(user.permission_code);
    setLicence(user.licence || "L2");
    setProgramme(user.programme || PROGRAMMES[0]);
    setIsActive(user.is_active);
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

    if (!email.trim()) {
      setErrorMessage("L'adresse email est requise.");
      return;
    }

    startTransition(async () => {
      const res = await updateUser(user.id, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password.trim() ? password.trim() : undefined,
        permission_code: role,
        licence: role === "CHEF_DE_CLASSE" ? licence : undefined,
        programme: role === "CHEF_DE_CLASSE" ? programme : undefined,
        is_active: isActive,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de la modification de l'utilisateur.");
        return;
      }

      setSuccessMessage("Compte utilisateur mis à jour avec succès !");
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
        className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#FFA500] hover:border-[#FFA500]/50 cursor-pointer"
        title="Modifier ce compte utilisateur"
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
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] dark:text-white truncate">
                    Modifier l&apos;utilisateur
                  </h2>
                  <Badge variant="cjp" size="sm" className="shrink-0">
                    ID #{user.id}
                  </Badge>
                </div>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5 truncate">
                  Mettez à jour les identifiants, le rôle ou les accès.
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
              id="edit-user-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain"
            >
              {/* Alertes */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-shake">
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
                  label="Prénom"
                  type="text"
                  placeholder="ex: Mamadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom de famille"
                  type="text"
                  placeholder="ex: Diallo"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* Email */}
              <Input
                label="Adresse Email *"
                type="email"
                required
                placeholder="ex: m.diallo@cjp.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              {/* Nouveau Mot de passe */}
              <Input
                label="Nouveau mot de passe (optionnel)"
                type="password"
                placeholder="Laisser vide pour conserver l'actuel"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Renseignez ce champ uniquement si vous souhaitez réinitialiser son mot de passe."
              />

              {/* Rôle du compte */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171717] dark:text-white">
                  Rôle & Droits d&apos;accès *
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as PermissionCode)}
                    className="w-full h-10 px-3 pl-9 rounded-xl bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838] text-xs sm:text-sm text-[#171717] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 transition-all cursor-pointer"
                  >
                    <option value="CHEF_DE_CLASSE">Chef de classe (Inscriptions de sa classe)</option>
                    <option value="BUREAU">Membre du Bureau (Consultation générale)</option>
                    <option value="ADMIN">Administrateur (Contrôle total)</option>
                    <option value="MEMBRE">Membre standard</option>
                  </select>
                  <Shield className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Classe assignée (si Chef de classe) */}
              {role === "CHEF_DE_CLASSE" && (
                <div className="p-3.5 rounded-2xl bg-[#FFA500]/5 border border-[#FFA500]/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFA500]">
                    <GraduationCap className="w-4 h-4" />
                    <span>Périmètre de classe sous sa responsabilité</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]">
                        Niveau / Licence
                      </label>
                      <select
                        value={licence}
                        onChange={(e) => setLicence(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838] text-xs text-[#171717] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 cursor-pointer"
                      >
                        <option value="L1">Licence 1 (L1)</option>
                        <option value="L2">Licence 2 (L2)</option>
                        <option value="L3">Licence 3 (L3)</option>
                        <option value="L4">Licence 4 (L4)</option>
                        <option value="Master 1">Master 1</option>
                        <option value="Master 2">Master 2</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]">
                        Filière / Programme
                      </label>
                      <select
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838] text-xs text-[#171717] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 cursor-pointer"
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
              )}

              {/* Statut d'activation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#383838]">
                <div>
                  <div className="text-xs font-medium text-[#171717] dark:text-white">
                    Statut du compte
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                    {isActive
                      ? "Le compte est actif et peut se connecter."
                      : "Le compte est bloqué, l'accès est refusé."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
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
                form="edit-user-form"
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
