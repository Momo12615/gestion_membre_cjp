"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Shield, LogIn, Code2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    permission_code: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Accueil", icon: Code2 },
    ...(user
      ? [
          {
            href:
              user.permission_code === "ADMIN"
                ? "/admin"
                : user.permission_code === "BUREAU"
                ? "/bureau"
                : user.permission_code === "CHEF_DE_CLASSE"
                ? "/classe"
                : "/profil",
            label: "Espace CJP",
            icon: Shield,
          },
        ]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-[#171717]/85 border-b border-[#E5E5E5] dark:border-[#383838] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo CJP officiel */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500] rounded-xl p-1 shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden ring-1 ring-[#FFA500]/30 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/cjp-logo.png"
              alt="Logo officiel Club des Jeunes Programmeurs"
              width={40}
              height={40}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-sm sm:text-lg tracking-tight text-[#171717] dark:text-white flex items-center gap-1.5">
              CJP
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-[#FFF4D6] dark:bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/30">
                PORTAL
              </span>
            </span>
            <span className="text-[10px] text-[#737373] dark:text-[#A3A3A3] font-medium hidden sm:inline leading-none">
              Club des Jeunes Programmeurs
            </span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  active
                    ? "bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] font-semibold"
                    : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#222222]"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-[#FFA500]" : "")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions utilisateur & Theme */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-medium text-[#737373] dark:text-[#A3A3A3] max-w-[160px] truncate">
                {user.first_name ? `${user.first_name} (${user.permission_code})` : user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            pathname !== "/login" && (
              <Link href="/login" className="hidden sm:inline-flex">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                >
                  <span>Connexion</span>
                </Button>
              </Link>
            )
          )}

          {/* Bouton Menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#222222] transition-colors"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#171717] px-4 py-4 space-y-3 animate-fadeIn shadow-xl">
          {/* Si utilisateur connecté : carte d'identité mobile */}
          {user && (
            <div className="p-3 rounded-2xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-heading font-semibold text-sm text-[#171717] dark:text-white truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name || ""}` : "Adhérent CJP"}
                </p>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate font-mono">
                  {user.email}
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30 shrink-0">
                {user.permission_code}
              </span>
            </div>
          )}

          {/* Liens de navigation */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors",
                    active
                      ? "bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] font-semibold"
                      : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#222222]"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-[#FFA500]" : "")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Déconnexion ou Connexion en bas du menu mobile */}
          <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#383838]">
            {user ? (
              <LogoutButton className="w-full justify-center" />
            ) : (
              pathname !== "/login" && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center" leftIcon={<LogIn className="w-4 h-4" />}>
                    Connexion au Portail
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
