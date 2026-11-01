import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.permission_code === "ADMIN") {
    redirect("/admin");
  } else if (session.permission_code === "BUREAU") {
    redirect("/bureau");
  } else if (session.permission_code === "CHEF_DE_CLASSE") {
    redirect("/classe");
  } else {
    redirect("/profil");
  }
}
