"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { UserPlus, X, AlertCircle, CheckCircle2, Shield, Lock, Mail, User } from "lucide-react";
import { createUser } from "@/actions/users";
import { PermissionCode } from "@/lib/types";
import { PROGRAMMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function CreateUserModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PermissionCode>("CHEF_DE_CLASSE");
  const [licence, setLicence] = useState("L2");
  const [programme, setProgramme] = useState<string>(PROGRAMMES[0]);

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
    setPassword("");
    setRole("CHEF_DE_CLASSE");
    setLicence("L2");
    setProgramme(PROGRAMMES[0]);
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

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    startTransition(async () => {
      const res = await createUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        permission_code: role,
        licence: role === "CHEF_DE_CLASSE" ? licence : undefined,
        programme: role === "CHEF_DE_CLASSE" ? programme : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de la création.");
        return;
      }

      setSuccessMessage("Utilisateur créé avec succès !");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    });
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={handleOpen}
        leftIcon={<UserPlus className="w-4 h-4 text-[#171717]" />}
      >
        <span>Créer un utilisateur</span>
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
            {/* EN-TÊTE FIXE */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/20 flex items-center justify-center text-[#FFA500] shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-base sm:text-lg truncate">Créer un Utilisateur</h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate">
                    Attribution des accès au système CJP
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

            {/* CORPS DU FORMULAIRE SCROLLABLE */}
            <form
              id="create-user-form"
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

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 text-xs text-[#16A34A] dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* SÉLECTION DU RÔLE */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] dark:text-white">
                  RÔLE & NIVEAU D&apos;ACCÈS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("CHEF_DE_CLASSE")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      role === "CHEF_DE_CLASSE"
                        ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500]"
                        : "border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#A3A3A3]"
                    }`}
                  >
                    Chef Classe
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("BUREAU")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      role === "BUREAU"
                        ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500]"
                        : "border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#A3A3A3]"
                    }`}
                  >
                    Bureau
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      role === "ADMIN"
                        ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500]"
                        : "border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7] dark:bg-[#1a1a1a] text-[#737373] dark:text-[#A3A3A3]"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* CLASSE ASSIGNÉE SI CHEF DE CLASSE */}
              {role === "CHEF_DE_CLASSE" && (
                <div className="p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#171717] dark:text-white">
                      Promotion & Classe Assignée
                    </span>
                    <Badge variant="cjp" size="sm">
                      Verrouillage Strict
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#737373] dark:text-[#A3A3A3] block mb-1">
                        Licence
                      </label>
                      <select
                        value={licence}
                        onChange={(e) => setLicence(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500]"
                      >
                        <option value="L1">Licence 1 (L1)</option>
                        <option value="L2">Licence 2 (L2)</option>
                        <option value="L3">Licence 3 (L3)</option>
                        <option value="L4">Licence 4 (L4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#737373] dark:text-[#A3A3A3] block mb-1">
                        Programme / Filière
                      </label>
                      <select
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-[#171717] dark:text-white focus:outline-hidden focus:border-[#FFA500]"
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

              {/* IDENTITÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  placeholder="ex: Mamadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isPending}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom"
                  placeholder="ex: Bah"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              {/* IDENTIFIANTS */}
              <Input
                label="Adresse Email de connexion"
                type="email"
                placeholder="ex: chef.l1@cjp.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Mot de passe initial"
                type="password"
                placeholder="ex: Secret@2026!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Transmettez ce mot de passe à l'utilisateur pour sa première connexion."
              />
            </form>

            {/* PIED DE PAGE FIXE */}
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
                form="create-user-form"
                variant="primary"
                size="md"
                isLoading={isPending}
                className="cursor-pointer"
              >
                Créer le compte
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
