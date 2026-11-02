"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Database,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HomeFeatureCardsProps {
  dashboardUrl: string;
}

export function HomeFeatureCards({ dashboardUrl }: HomeFeatureCardsProps) {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. En-tête des fonctionnalités
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            once: true,
          },
          y: 25,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // 2. Cartes de fonctionnalités (Mobile & Desktop)
      const cards = cardsRef.current?.querySelectorAll(".feature-card");
      if (cards && cards.length > 0) {
        cards.forEach((card, index) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              once: true,
            },
            y: 35,
            opacity: 0,
            duration: 0.65,
            delay: index * 0.08,
            ease: "power2.out",
            clearProps: "all",
          });
        });
      }

      // 3. Bannière d'appel à l'action
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 92%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // Rafraîchir les positions ScrollTrigger après montage
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef as any}>
      {/* VALEURS & FONCTIONNALITÉS */}
      <section id="valeurs" className="py-16 bg-[#F7F7F7] dark:bg-[#171717] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="cjp" size="sm" className="mb-3">
              Fonctionnalités CJP
            </Badge>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] dark:text-white">
              Une architecture conçue pour la communauté
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3]">
              Chaque module répond aux exigences de rigueur, de simplicité et de modernité de l&apos;association.
            </p>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Carte 1 */}
            <Card className="feature-card hover:border-[#FFA500]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-base sm:text-lg">Gestion des Membres</CardTitle>
                <CardDescription className="text-xs">
                  Registre des adhérents avec choix de section, distinction Inscription (20K) / Réinscription (10K), et règle stricte L1.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Carte 2 */}
            <Card className="feature-card hover:border-[#FFA500]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle className="text-base sm:text-lg">Chefs de Classe</CardTitle>
                <CardDescription className="text-xs">
                  Accès restreint permettant aux délégués d&apos;enregistrer exclusivement les membres de leur promotion dans la section souhaitée.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Carte 3 */}
            <Card className="feature-card hover:border-[#FFA500]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-base sm:text-lg">Supervision Admin</CardTitle>
                <CardDescription className="text-xs">
                  Contrôle des campagnes, gestion des comptes d&apos;accès, administration du comité et suivi financier des recettes.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Carte 4 */}
            <Card className="feature-card hover:border-[#FFA500]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <CardTitle className="text-base sm:text-lg">Base Distribuée</CardTitle>
                <CardDescription className="text-xs">
                  Synchronisation temps réel via Turso SQLite décentralisé et stockage sécurisé des photos officielles du comité.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* BANNIÈRE APPEL À L'ACTION */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ctaRef}
            className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-12 overflow-hidden bg-gradient-to-br from-[#FFA500] via-[#F5B51B] to-[#FFA500] text-[#171717] shadow-xl shadow-[#FFA500]/25 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FFA500]/35"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="max-w-xl">
                <h3 className="font-heading font-bold text-xl sm:text-3xl text-[#171717] tracking-tight">
                  Prêt à gérer la structure du CJP ?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#171717]/85 font-medium">
                  Connectez-vous avec vos identifiants officiels pour accéder aux outils de gestion des adhérents, sections et promotions.
                </p>
              </div>
              <Link href={dashboardUrl} className="w-full sm:w-auto shrink-0">
                <button className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-[#171717] hover:bg-black text-white font-heading font-semibold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2">
                  <span>Accéder au portail</span>
                  <ArrowRight className="w-4 h-4 text-[#FFA500]" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
