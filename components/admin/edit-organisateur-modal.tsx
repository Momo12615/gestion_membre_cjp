"use client";

import React, { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  AlertCircle,
  CheckCircle2,
  Camera,
  Upload,
  Briefcase,
  Mail,
  Phone,
  User,
  Trash2,
} from "lucide-react";
import { updateOrganisateur } from "@/actions/organisateurs";
import { Organisateur } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image-utils";

interface EditOrganisateurModalProps {
  organisateur: Organisateur;
}

export function EditOrganisateurModal({ organisateur }: EditOrganisateurModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(organisateur.first_name);
  const [lastName, setLastName] = useState(organisateur.last_name);
  const [email, setEmail] = useState(organisateur.email || "");
  const [phone, setPhone] = useState(organisateur.phone || "");
  const [role, setRole] = useState(organisateur.role);

  const [photoPreview, setPhotoPreview] = useState<string | null>(organisateur.photo_url || null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpen = () => {
    setFirstName(organisateur.first_name);
    setLastName(organisateur.last_name);
    setEmail(organisateur.email || "");
    setPhone(organisateur.phone || "");
    setRole(organisateur.role);
    setPhotoPreview(organisateur.photo_url || null);
    setPhotoBase64(null);
    setPhotoName(null);
    setRemovePhoto(false);
    setErrorMessage(null);
    setSuccessMessage(null);
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
      setRemovePhoto(false);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Erreur lors de la lecture ou compression de l'image.");
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoName(null);
    setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim() || !role.trim()) {
      setErrorMessage("Le prénom, le nom et le poste sont obligatoires.");
      return;
    }

    startTransition(async () => {
      const res = await updateOrganisateur({
        id: organisateur.id,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        role: role,
        photo_base64: photoBase64 || undefined,
        photo_name: photoName || undefined,
        remove_photo: removePhoto,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Erreur lors de la mise à jour.");
        return;
      }

      setSuccessMessage("Organisateur mis à jour avec succès !");
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
        className="text-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFF4D6] dark:hover:bg-[#FFA500]/15 border-[#FFA500]/30"
        title="Modifier cet organisateur"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg my-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E5E5] dark:border-[#383838] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* EN-TÊTE MODALE */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between bg-radial from-[#FFA500]/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/20 flex items-center justify-center text-[#FFA500]">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#171717] dark:text-white">
                    Modifier l&apos;Organisateur
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                    Ajoutez la photo, l&apos;email et le numéro de contact
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#262626] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* SECTION PHOTO */}
              <div className="p-3.5 rounded-xl border border-dashed border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7]/50 dark:bg-[#222222]/50 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#E5E5E5] dark:bg-[#2d2d2d] border border-[#FFA500]/40 shrink-0 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Prévisualisation"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-[#737373]" />
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id={`edit-photo-${organisateur.id}`}
                      disabled={isPending}
                    />
                    <label
                      htmlFor={`edit-photo-${organisateur.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFA500] hover:bg-[#FFA500]/90 text-black cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{photoPreview ? "Changer la photo" : "Ajouter une photo"}</span>
                    </label>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Retirer</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                    JPG, PNG ou WebP (max 5 Mo)
                  </p>
                </div>
              </div>

              {/* POSTE / RÔLE */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#FFA500]" />
                  Poste / Rôle CJP *
                </label>
                <Input
                  required
                  placeholder="Ex: Président, 1er Chargé à l'Organisation..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* IDENTITÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FFA500]" />
                    Prénom *
                  </label>
                  <Input
                    required
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FFA500]" />
                    Nom *
                  </label>
                  <Input
                    required
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* CONTACTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FFA500]" />
                    Email (optionnel)
                  </label>
                  <Input
                    type="email"
                    placeholder="organisateur@cjp.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717] dark:text-[#E5E5E5] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FFA500]" />
                    Téléphone (optionnel)
                  </label>
                  <Input
                    type="tel"
                    placeholder="Ex: +224 620 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* BOUTONS */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5E5E5] dark:border-[#333333]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
