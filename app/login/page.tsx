import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkHasUsers } from "@/actions/auth";
import LoginForm from "@/components/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const instant = false;

export const metadata = {
  title: "Connexion",
  description:
    "Portail de connexion pour la gestion des membres et de la structure du CJP (Club des Jeunes Programmeurs).",
};

export default async function LoginPage() {
  const session = await getSession();

  // Si déjà connecté, rediriger vers son espace dédié
  if (session) {
    if (session.permission_code === "ADMIN") redirect("/admin");
    if (session.permission_code === "BUREAU") redirect("/bureau");
    if (session.permission_code === "CHEF_DE_CLASSE") redirect("/classe");
    redirect("/profil");
  }

  const hasUsers = await checkHasUsers();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#FFFFFF] dark:bg-[#171717] text-[#171717] dark:text-white overflow-hidden transition-colors duration-200">
      {/* Bouton de bascule thème en haut à droite */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Halo d'ambiance chaleureux aux couleurs officielles CJP (#FFA500) */}
      <div className="absolute top-[-12%] left-[-10%] w-[520px] h-[520px] bg-[#FFA500]/10 dark:bg-[#FFA500]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-10%] w-[500px] h-[500px] bg-[#F5B51B]/10 dark:bg-[#F5B51B]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Motif de grille subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFA50008_1px,transparent_1px),linear-gradient(to_bottom,#FFA50008_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Carte centrale du formulaire */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn my-8">
        <LoginForm initialHasUsers={hasUsers} />

        {/* Note de bas de page discrète */}
        <p className="mt-6 text-center text-xs text-[#737373] dark:text-[#A3A3A3]">
          Club des Jeunes Programmeurs • Portail Officiel
        </p>
      </div>
    </main>
  );
}
