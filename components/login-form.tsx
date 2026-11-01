"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CodeIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "./icons";
import { loginAction, seedInitialAdmin } from "@/actions/auth";

interface LoginFormProps {
  initialHasUsers: boolean;
}

export default function LoginForm({ initialHasUsers }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode initialisation premier admin si la base est vide
  const [isSetupMode, setIsSetupMode] = useState(!initialHasUsers);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Champs formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    startTransition(async () => {
      if (isSetupMode) {
        if (!prenom || !nom) {
          setErrorMessage("Veuillez renseigner votre prénom et nom.");
          return;
        }

        const res = await seedInitialAdmin(email, password, prenom, nom);
        if (!res.success) {
          setErrorMessage(res.error || "Erreur lors de l'initialisation.");
          return;
        }

        // Connexion automatique après création
        const loginRes = await loginAction(email, password);
        if (loginRes.success) {
          router.push("/admin");
          router.refresh();
        } else {
          setSuccessMessage("Compte Administrateur créé ! Vous pouvez maintenant vous connecter.");
          setIsSetupMode(false);
        }
      } else {
        const res = await loginAction(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Email ou mot de passe incorrect.");
          return;
        }

        const role = res.user?.permission_code;
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "BUREAU") {
          router.push("/bureau");
        } else if (role === "CHEF_DE_CLASSE") {
          router.push("/classe");
        } else {
          router.push("/profil");
        }
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-7 md:p-8 shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] transition-all">
      {/* En-tête avec Logo et Badge */}
      <div className="flex flex-col items-center text-center mb-7">
        <div className="relative mb-3 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
          <CodeIcon className="w-7 h-7 text-white stroke-[2.2]" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#090d16] rounded-full animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          CJP <span className="text-indigo-400 font-semibold text-lg">PORTAL</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {isSetupMode
            ? "Initialisation du compte Super-Administrateur"
            : "Club des Jeunes Programmeurs • Espace de Gestion"}
        </p>
      </div>

      {/* Bannière de première installation */}
      {!initialHasUsers && !successMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-300">
          <SparklesIcon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-white">Premier démarrage détecté :</span> Votre base Turso est prête.
            Créez votre compte Super-Admin pour commencer.
          </div>
        </div>
      )}

      {/* Messages d'erreur ou de succès */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-xs text-red-300 animate-fadeIn">
          <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champs supplémentaires pour le mode Setup initial */}
        {isSetupMode && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Prénom</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Mamadou"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nom</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Diallo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Adresse email</label>
          <div className="relative">
            <MailIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@cjp.org"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">Mot de passe</label>
          </div>
          <div className="relative">
            <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bouton de validation */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{isSetupMode ? "Créer et se connecter" : "Se connecter"}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Rôles supportés */}
      <div className="mt-7 pt-5 border-t border-slate-800/60">
        <p className="text-[11px] text-center text-slate-500 mb-2">Accès multi-rôles sécurisé</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
            Admin
          </span>
          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium">
            Bureau
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
            Chef de classe
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-slate-300 font-medium">
            Membre
          </span>
        </div>
      </div>
    </div>
  );
}
