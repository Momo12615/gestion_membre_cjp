import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkHasUsers } from "@/actions/auth";
import LoginForm from "@/components/login-form";

export const metadata = {
  title: "Connexion - CJP (Club des Jeunes Programmeurs)",
  description: "Portail de connexion pour la gestion des membres et de la structure du CJP.",
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
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Effets d'éclairage ambient & blobs de fond */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Motif de grille subtile */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" 
      />

      {/* Carte centrale du formulaire */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm initialHasUsers={hasUsers} />
      </div>
    </main>
  );
}
