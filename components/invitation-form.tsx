"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Award,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { acceptInvitationAction, InvitationData } from "@/actions/invitations";

interface InvitationFormProps {
  invitation: InvitationData;
}

export default function InvitationForm({ invitation }: InvitationFormProps) {
  const [isPending, startTransition] = useTransition();

  // Mots de passe
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Retours utilisateur
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation en direct
  const hasMinLength = password.length >= 6;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const showMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!hasMinLength) {
      setErrorMessage("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    startTransition(async () => {
      const res = await acceptInvitationAction({
        token: invitation.token,
        password,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Une erreur est survenue lors de l'activation.");
        return;
      }

      setSuccessMessage(
        "Félicitations ! Votre compte est activé avec succès. Redirection vers votre espace..."
      );

      // Redirection après succès
      const target = res.redirectUrl || "/bureau";
      setTimeout(() => {
        window.location.href = target;
      }, 1000);
    });
  };

  return (
    <Card className="w-full bg-white/95 dark:bg-[#222222]/95 backdrop-blur-2xl border-[#E5E5E5] dark:border-[#383838] shadow-2xl shadow-black/5 dark:shadow-[#FFA500]/5 transition-all">
      <CardContent className="p-6 sm:p-8">
        {/* En-tête avec Logo et Badge Officiel */}
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#171717] dark:text-[#FFA500] border border-[#FFA500]/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFA500]" />
            <span>Invitation Officielle CJP</span>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
            Création de votre mot de passe
          </h1>
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-1 max-w-sm">
            Bienvenue au sein du Comité d&apos;Organisation CJP (2026-2027). Finalisez l&apos;activation de votre compte officiel.
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-xs text-[#DC2626] dark:text-red-400 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 text-xs text-[#16A34A] dark:text-emerald-400 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bloc des informations pré-remplies et verrouillées */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#1a1a1a] p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-[#2e2e2e]">
              <span className="text-xs font-semibold text-[#171717] dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFA500]" />
                Informations officielles verrouillées
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                Lecture seule
              </span>
            </div>

            {/* Prénom & Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                  Prénom
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={invitation.first_name}
                    readOnly
                    tabIndex={-1}
                    className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-neutral-200 text-xs sm:text-sm py-2 pl-9 pr-8 cursor-not-allowed select-none focus:outline-none"
                  />
                  <div className="absolute right-2.5 text-neutral-400 dark:text-neutral-500">
                    <Lock className="w-3 h-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                  Nom
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={invitation.last_name}
                    readOnly
                    tabIndex={-1}
                    className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-neutral-200 text-xs sm:text-sm py-2 pl-9 pr-8 cursor-not-allowed select-none focus:outline-none"
                  />
                  <div className="absolute right-2.5 text-neutral-400 dark:text-neutral-500">
                    <Lock className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Email officiel */}
            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                Adresse email officielle
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  value={invitation.email}
                  readOnly
                  tabIndex={-1}
                  className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-neutral-200 text-xs sm:text-sm py-2 pl-9 pr-8 cursor-not-allowed select-none focus:outline-none"
                />
                <div className="absolute right-2.5 text-neutral-400 dark:text-neutral-500">
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Rôle officiel au sein du CJP */}
            <div>
              <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                Rôle officiel attribué
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none text-[#FFA500]">
                  <Award className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={invitation.role}
                  readOnly
                  tabIndex={-1}
                  className="w-full font-semibold rounded-lg bg-[#FFF4D6]/60 dark:bg-[#FFA500]/10 border border-[#FFA500]/30 text-[#171717] dark:text-[#FFA500] text-xs sm:text-sm py-2 pl-9 pr-8 cursor-not-allowed select-none focus:outline-none"
                />
                <div className="absolute right-2.5 text-[#FFA500]">
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Classe & Promotion (si Chef de classe) */}
            {invitation.licence && invitation.programme && (
              <div>
                <label className="block text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3] mb-1">
                  Classe & Promotion sous votre responsabilité
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none text-[#FFA500]">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={`${invitation.licence} • ${invitation.programme}`}
                    readOnly
                    tabIndex={-1}
                    className="w-full font-semibold rounded-lg bg-[#FFF4D6]/60 dark:bg-[#FFA500]/10 border border-[#FFA500]/30 text-[#171717] dark:text-[#FFA500] text-xs sm:text-sm py-2 pl-9 pr-8 cursor-not-allowed select-none focus:outline-none"
                  />
                  <div className="absolute right-2.5 text-[#FFA500]">
                    <Lock className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Définition du mot de passe */}
          <div className="space-y-4 pt-1">
            {/* Nouveau mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-medium text-[#171717] dark:text-white">
                  Définir votre mot de passe personnel
                </label>
                {hasMinLength && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Longueur valide
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3] z-10">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  disabled={isPending}
                  className="w-full rounded-xl bg-white dark:bg-[#1f1f1f] border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white placeholder-[#737373]/60 dark:placeholder-[#A3A3A3]/50 text-sm py-2.5 pl-10 pr-11 transition-all duration-200 outline-none focus:border-[#FFA500] focus:ring-2 focus:ring-[#FFA500]/25 dark:focus:ring-[#FFA500]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 rounded-md text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white transition-colors"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-medium text-[#171717] dark:text-white">
                  Confirmer le mot de passe
                </label>
                {passwordsMatch && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Correspondance parfaite
                  </span>
                )}
                {showMismatch && (
                  <span className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Ne correspond pas
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3] z-10">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  disabled={isPending}
                  className={`w-full rounded-xl bg-white dark:bg-[#1f1f1f] border text-[#171717] dark:text-white placeholder-[#737373]/60 dark:placeholder-[#A3A3A3]/50 text-sm py-2.5 pl-10 pr-11 transition-all duration-200 outline-none ${
                    showMismatch
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : passwordsMatch
                      ? "border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      : "border-[#E5E5E5] dark:border-[#383838] focus:border-[#FFA500] focus:ring-2 focus:ring-[#FFA500]/25 dark:focus:ring-[#FFA500]/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 p-1 rounded-md text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bouton de validation & activation */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 font-semibold text-sm sm:text-base group"
            isLoading={isPending}
            disabled={isPending || !hasMinLength || !passwordsMatch}
            rightIcon={
              !isPending ? (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              ) : undefined
            }
          >
            {isPending ? "Activation de votre compte..." : "Activer mon compte & Accéder"}
          </Button>

          {/* Indication de sécurité */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#737373] dark:text-[#A3A3A3]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFA500]" />
            <span>Chiffrement de sécurité bcrypt conforme CJP</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
