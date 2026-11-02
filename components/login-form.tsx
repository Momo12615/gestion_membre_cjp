"use client";

import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { loginAction, seedInitialAdmin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LoginFormProps {
  initialHasUsers: boolean;
}

export default function LoginForm({ initialHasUsers }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode initialisation premier admin si la base est vide
  const [isSetupMode, setIsSetupMode] = useState(!initialHasUsers);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
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
      setErrorMessage("Veuillez renseigner tous les champs obligatoires.");
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
          setSuccessMessage(
            "Compte Super-Administrateur créé avec succès ! Connectez-vous."
          );
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
    <Card className="w-full bg-white/90 dark:bg-[#222222]/90 backdrop-blur-2xl border-[#E5E5E5] dark:border-[#383838] shadow-xl shadow-black/5 dark:shadow-[#FFA500]/5 transition-all">
      <CardContent className="p-5 sm:p-8">
        {/* En-tête avec Logo Officiel CJP */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white dark:bg-[#171717] ring-1 ring-[#FFA500]/40 shadow-md shadow-[#FFA500]/15">
            <Image
              src="/cjp-logo.png"
              alt="Logo officiel Club des Jeunes Programmeurs"
              width={72}
              height={72}
              priority
              className="object-contain w-full h-full"
            />
          </div>

          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white flex items-center gap-2">
            CJP{" "}
            <span className="text-[#FFA500] font-semibold text-base sm:text-lg px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 border border-[#FFA500]/30">
              PORTAL
            </span>
          </h1>
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-1.5 max-w-xs">
            {isSetupMode
              ? "Initialisation du compte Super-Administrateur"
              : "Club des Jeunes Programmeurs • Espace de Gestion"}
          </p>
        </div>

        {/* Bannière de première installation (Setup mode) */}
        {!initialHasUsers && !successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-start gap-3 text-xs text-[#171717] dark:text-amber-200">
            <Sparkles className="w-4 h-4 text-[#FFA500] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-[#171717] dark:text-[#FFA500]">
                Premier démarrage détecté :
              </span>{" "}
              Votre base Turso est prête. Configurez votre compte Super-Admin en 1 clic.
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3 text-xs text-[#DC2626] dark:text-red-400 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Messages de succès */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3 text-xs text-[#16A34A] dark:text-emerald-400 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulaire de connexion / setup */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champs Prénom & Nom pour le Setup initial */}
          {isSetupMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Prénom"
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Mamadou"
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Nom"
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Diallo"
              />
            </div>
          )}

          {/* Email */}
          <Input
            label="Adresse email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: membre@cjp.org"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-medium text-[#171717] dark:text-white">
                Mot de passe
              </label>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3] z-10">
                <Lock className="w-4 h-4" />
              </div>
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white dark:bg-[#1f1f1f] border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white placeholder-[#737373]/60 dark:placeholder-[#A3A3A3]/50 text-sm focus:border-[#FFA500] focus:ring-2 focus:ring-[#FFA500]/25 dark:focus:ring-[#FFA500]/30 outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => {
                  // Synchroniser la valeur si le navigateur a prérempli le champ via autofill
                  if (passwordInputRef.current && !password && passwordInputRef.current.value) {
                    setPassword(passwordInputRef.current.value);
                  }
                  setShowPassword((prev) => !prev);
                }}
                className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center z-20 text-[#737373] hover:text-[#FFA500] dark:text-[#A3A3A3] dark:hover:text-[#FFA500] active:text-[#FFA500] focus:outline-none cursor-pointer transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-[#FFA500]" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Bouton de validation officiel Orange #FFA500 */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4 text-[#171717]" />}
          >
            {isSetupMode ? "Créer et se connecter" : "Se connecter"}
          </Button>
        </form>

        {/* Badges des rôles supportés */}
        <div className="mt-8 pt-6 border-t border-[#E5E5E5] dark:border-[#383838]">
          <p className="text-[11px] text-center text-[#737373] dark:text-[#A3A3A3] mb-2.5 font-medium">
            Accès sécurisé CJP par profil
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Badge variant="cjp" size="sm" dot>
              Admin
            </Badge>
            <Badge variant="warning" size="sm" dot>
              Bureau
            </Badge>
            <Badge variant="success" size="sm" dot>
              Chef de classe
            </Badge>
            <Badge variant="neutral" size="sm">
              Membre
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
