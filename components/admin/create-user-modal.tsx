"use client";

import React, { useState, useTransition } from "react";
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
        setErrorMessage(res.error || "Erreur lors de la création de l'utilisateur.");
        return;
      }

      setSuccessMessage(`Compte ${role} pour ${firstName} ${lastName} créé avec succès !`);
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
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Créer un Utilisateur</h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Attribution des accès au système CJP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-1.5 rounded-xl border border-[#E5E5E5] dark:border-[#383838] text-[#737373] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MESSAGES D'ALERTE */}
            {errorMessage && (
              <div className="my-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="my-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 text-xs text-[#16A34A] dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* CHOIX DU RÔLE */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] mb-2">
                  Rôle & Niveau d&apos;Accès
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CHEF_DE_CLASSE", "BUREAU", "ADMIN"] as PermissionCode[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        role === r
                          ? "border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/15 ring-2 ring-[#FFA500]/30 font-semibold text-[#FFA500]"
                          : "border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#1f1f1f] text-[#737373] dark:text-[#A3A3A3] hover:opacity-100"
                      }`}
                    >
                      <p className="text-xs font-medium truncate">
                        {r === "CHEF_DE_CLASSE" ? "Chef Classe" : r === "BUREAU" ? "Bureau" : "Admin"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SI CHEF DE CLASSE : SÉLECTION LICENCE ET PROGRAMME */}
              {role === "CHEF_DE_CLASSE" && (
                <div className="p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E5E5E5] dark:border-[#383838] space-y-3">
                  <p className="text-xs font-semibold text-[#171717] dark:text-white flex items-center justify-between">
                    <span>Promotion & Classe Assignée</span>
                    <Badge variant="cjp" size="sm">Verrouillage Strict</Badge>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                        Licence
                      </label>
                      <select
                        value={licence}
                        onChange={(e) => setLicence(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white outline-none focus:border-[#FFA500]"
                      >
                        <option value="L1">Licence 1 (L1)</option>
                        <option value="L2">Licence 2 (L2)</option>
                        <option value="L3">Licence 3 (L3)</option>
                        <option value="L4">Licence 4 (L4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                        Programme / Filière
                      </label>
                      <select
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white outline-none focus:border-[#FFA500]"
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

              {/* PRÉNOM & NOM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  required
                  placeholder="ex: Mamadou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom"
                  required
                  placeholder="ex: Bah"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* EMAIL & MOT DE PASSE */}
              <Input
                label="Adresse Email de connexion"
                type="email"
                required
                placeholder="ex: chef.l1@cjp.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Mot de passe initial"
                type="text"
                required
                placeholder="ex: Secret@2026!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Transmettez ce mot de passe à l'utilisateur pour sa première connexion."
              />

              {/* BOUTONS D'ACTION */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#383838]">
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
                  Créer le compte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
