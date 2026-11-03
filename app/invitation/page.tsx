import { Metadata } from "next";
import Link from "next/link";
import { getInvitationByToken } from "@/actions/invitations";
import InvitationForm from "@/components/invitation-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AlertCircle, Clock, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Activation de compte & Mot de passe",
  description:
    "Page de définition de mot de passe et d'activation de compte officiel pour les membres du comité CJP.",
};

interface InvitationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvitationPage({
  searchParams,
}: InvitationPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawToken = resolvedSearchParams.token;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  let invitationData = null;
  let errorMessage = null;

  if (!token) {
    errorMessage =
      "Aucun jeton d'invitation n'a été spécifié. Veuillez utiliser le lien complet reçu dans votre invitation.";
  } else {
    const res = await getInvitationByToken(token);
    if (!res.success || !res.data) {
      errorMessage =
        res.error || "Ce lien d'invitation est invalide, expiré ou déjà utilisé.";
    } else {
      invitationData = res.data;
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#FFFFFF] dark:bg-[#171717] text-[#171717] dark:text-white overflow-hidden transition-colors duration-200">
      {/* Bouton de bascule thème */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Halos d'ambiance aux couleurs CJP */}
      <div className="absolute top-[-12%] left-[-10%] w-[520px] h-[520px] bg-[#FFA500]/10 dark:bg-[#FFA500]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-10%] w-[500px] h-[500px] bg-[#F5B51B]/10 dark:bg-[#F5B51B]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grille de fond subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFA50008_1px,transparent_1px),linear-gradient(to_bottom,#FFA50008_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Contenu central */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn my-8">
        {invitationData ? (
          <InvitationForm invitation={invitationData} />
        ) : (
          <Card className="w-full bg-white/95 dark:bg-[#222222]/95 backdrop-blur-2xl border-[#E5E5E5] dark:border-[#383838] shadow-2xl shadow-black/5 dark:shadow-[#FFA500]/5 transition-all">
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center">
              <div className="relative mb-4 flex items-center justify-center w-16 h-16 rounded-2xl p-1 bg-white dark:bg-[#171717] ring-1 ring-[#FFA500]/40 shadow-md">
                <Image
                  src="/cjp-logo.png"
                  alt="Logo officiel Club des Jeunes Programmeurs"
                  width={64}
                  height={64}
                  priority
                  className="object-contain w-full h-full"
                />
              </div>

              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#171717] dark:text-white mb-2">
                Lien d&apos;invitation invalide ou expiré
              </h1>

              <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mb-6 max-w-xs leading-relaxed">
                {errorMessage}
              </p>

              <div className="w-full space-y-2">
                <Link href="/login" className="w-full block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Aller à la page de connexion
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note de bas de page */}
        <p className="mt-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
          Club des Jeunes Programmeurs • Portail d&apos;Activation Sécurisé
        </p>
      </div>
    </main>
  );
}
