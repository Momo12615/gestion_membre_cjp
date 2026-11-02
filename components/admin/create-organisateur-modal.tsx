"use client";

import React, { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserCheck, X, AlertCircle, CheckCircle2, Camera, Upload, Briefcase, Mail, Phone, User } from "lucide-react";
import { createOrganisateur } from "@/actions/organisateurs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image-utils";

export function CreateOrganisateurModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Responsable Logistique");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("Responsable Logistique");
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoName(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Veuillez sélectionner un fichier image valide.");
      return;
    }

    try {
      const compressed = await compressImage(file, 800, 0.85);
      setPhotoName(compressed.name);
      setPhotoPreview(compressed.base64);
      setPhotoBase64(compressed.base64);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Erreur lors de la lecture ou compression de l'image.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim() || !role.trim()) {
      setErrorMessage("Veuillez renseigner au moins le prénom, le nom et le rôle.");
      return;
    }

    startTransition(async () => {
      const res = await createOrganisateur({
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        phone: phone || undefined,
        role: role,
        photo_base64: photoBase64 || undefined,
        photo_name: photoName || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de l'enregistrement.");
        return;
      }

      setSuccessMessage(`Organisateur ${firstName} ${lastName} enregistré avec succès !`);
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
        leftIcon={<UserCheck className="w-4 h-4 text-[#171717]" />}
      >
        <span>Ajouter un organisateur</span>
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
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Ajouter un Organisateur</h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Membre de l&apos;équipe d&apos;organisation CJP avec photo
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
              {/* PHOTO UPLOAD AVEC PRÉVISUALISATION */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F7F7F7] dark:bg-[#1c1c1c] border border-[#E5E5E5] dark:border-[#383838]">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-[#252525] border-2 border-dashed border-[#FFA500]/50 flex items-center justify-center shrink-0">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Aperçu photo organisateur"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-[#FFA500]" />
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#171717] dark:text-white">
                    Photo de l&apos;organisateur
                  </p>
                  <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                    Fichier PNG ou JPEG (max. 5 Mo).
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#292929] border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white hover:border-[#FFA500] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FFA500]" />
                    <span>{photoPreview ? "Changer la photo" : "Choisir une photo"}</span>
                  </button>
                </div>
              </div>

              {/* PRÉNOM & NOM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  required
                  placeholder="ex: Souleymane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom"
                  required
                  placeholder="ex: Camara"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* RÔLE / FONCTION DANS L'ORGANISATION */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#171717] dark:text-white mb-1.5">
                  Fonction / Rôle au CJP
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1f1f1f] border border-[#E5E5E5] dark:border-[#383838] text-sm text-[#171717] dark:text-white outline-none focus:border-[#FFA500] focus:ring-2 focus:ring-[#FFA500]/25 transition-all"
                >
                  <option value="Coordinateur Général">Coordinateur Général</option>
                  <option value="Responsable Logistique">Responsable Logistique</option>
                  <option value="Lead Formateur / Mentor">Lead Formateur / Mentor</option>
                  <option value="Chargé de Communication">Chargé de Communication</option>
                  <option value="Trésorier / Gestionnaire">Trésorier / Gestionnaire</option>
                  <option value="Responsable Hackathons & Événements">Responsable Hackathons & Événements</option>
                </select>
              </div>

              {/* EMAIL & TÉLÉPHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Adresse Email (optionnel)"
                  type="email"
                  placeholder="ex: organisateur@cjp.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Téléphone (WhatsApp)"
                  placeholder="+224 62X XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

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
                  Enregistrer l&apos;organisateur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
