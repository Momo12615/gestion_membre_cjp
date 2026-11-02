import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { Mail, Shield } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Mon Profil Membre - CJP",
  description: "Espace personnel et carte de membre du Club des Jeunes Programmeurs",
};

export default async function ProfilPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#171717] text-[#171717] dark:text-white transition-colors duration-200">
      <Navbar user={session} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#383838]">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white">
              Mon Espace Adhérent
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] mt-1">
              Carte de membre et informations de votre compte au CJP.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* CARTE DE MEMBRE VIRTUELLE OFFICIELLE CJP */}
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden bg-gradient-to-br from-[#171717] via-[#222222] to-[#171717] text-white border border-[#FFA500]/40 shadow-2xl shadow-[#FFA500]/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFA500]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden ring-1 ring-[#FFA500]/40 bg-white p-1 shrink-0">
                  <Image
                    src="/cjp-logo.png"
                    alt="Logo CJP"
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                    CJP <span className="text-[#FFA500]">MEMBER</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#A3A3A3]">Club des Jeunes Programmeurs</p>
                </div>
              </div>

              <Badge variant="cjp" size="md" dot>
                {session.permission_code}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] sm:text-xs text-[#A3A3A3] uppercase tracking-wider font-mono">
                Identité de l&apos;adhérent
              </p>
              <h2 className="font-heading font-bold text-xl sm:text-3xl text-white break-words">
                {session.first_name ? `${session.first_name} ${session.last_name || ""}` : "Membre CJP"}
              </h2>
              <p className="text-xs sm:text-sm text-[#FFA500] font-mono flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{session.email}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-[#383838] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A3A3A3]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#FFA500]" />
                Compte Sécurisé & Vérifié
              </span>
              <span className="font-mono text-[#FFA500]">ID: #{session.id}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
