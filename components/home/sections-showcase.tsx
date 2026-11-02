"use client";

import React, { useEffect, useRef } from "react";
import {
  Smartphone,
  ShieldCheck,
  Laptop,
  Users,
  Code2,
  Terminal,
  Cpu,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SectionsShowcaseProps {
  totalMembers: number;
  membersBySection: Record<string, number>;
}

export function SectionsShowcase({ totalMembers, membersBySection }: SectionsShowcaseProps) {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "dev-mobile-web",
      name: "Dev Mobile & Site Web",
      count: membersBySection["Dev Mobile & Site Web"] || 0,
      icon: Smartphone,
      accentColor: "#FFA500",
      badgeVariant: "cjp" as const,
      borderClass: "border-[#FFA500]/30 hover:border-[#FFA500]",
      bgGlow: "from-[#FFA500]/10 via-transparent to-transparent",
      badgeBg: "bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#FFA500] border-[#FFA500]/30",
      tagColor: "bg-[#FFA500]/10 text-[#FFA500] border-[#FFA500]/20",
      description:
        "Conception d'applications mobiles cross-platform et développement de plateformes web modernes, réactives et évolutives.",
      modules: ["Flutter & Dart", "React & Next.js", "TypeScript", "Node.js & APIs", "Bases de Données"],
      extraIcon: Code2,
    },
    {
      id: "reseau-cyber",
      name: "Réseau & Cybersécurité",
      count: membersBySection["Réseau & Cybersécurité"] || 0,
      icon: ShieldCheck,
      accentColor: "#3B82F6",
      badgeVariant: "info" as const,
      borderClass: "border-blue-500/30 hover:border-blue-500",
      bgGlow: "from-blue-500/10 via-transparent to-transparent",
      badgeBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-500/30",
      tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description:
        "Architecture des réseaux d'entreprise, sécurité offensive & défensive, administration système Linux et protocoles réseau.",
      modules: ["Cisco & Routage", "Linux SysAdmin", "Sécurité Défensive", "Protocoles TCP/IP", "Cryptographie"],
      extraIcon: Terminal,
    },
    {
      id: "outil-info",
      name: "Outil Informatique",
      count: membersBySection["Outil Informatique"] || 0,
      icon: Laptop,
      accentColor: "#10B981",
      badgeVariant: "success" as const,
      borderClass: "border-emerald-500/30 hover:border-emerald-500",
      bgGlow: "from-emerald-500/10 via-transparent to-transparent",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description:
        "Maîtrise des logiciels de productivité bureautique avancée, algorithmique appliquée, traitement des données et outils pro.",
      modules: ["Bureautique Pro", "Excel Avancé", "Algorithmique", "Productivité Digitale", "Outils Collaboratifs"],
      extraIcon: Cpu,
    },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Animation fluide de l'en-tête
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

      // 2. Animation individuelle et fiable de chaque carte (Mobile & Desktop)
      const cards = cardsRef.current?.querySelectorAll(".section-card");
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

          // 3. Animation de remplissage de la barre de progression
          const bar = card.querySelector(".progress-fill") as HTMLElement;
          const targetWidth = bar?.getAttribute("data-width") || "0%";
          if (bar) {
            gsap.fromTo(
              bar,
              { width: "0%" },
              {
                width: targetWidth,
                duration: 1.1,
                delay: 0.2 + index * 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 92%",
                  once: true,
                },
              }
            );
          }
        });
      }

      // Rafraîchir les positions ScrollTrigger après montage
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="sections"
      className="py-16 md:py-24 relative overflow-hidden bg-white dark:bg-[#151515] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* EN-TÊTE DE LA SECTION */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Badge variant="cjp" size="md" dot className="mb-3">
            Domaines de Formation
          </Badge>
          <h2 className="font-heading font-bold text-2xl sm:text-4xl text-[#171717] dark:text-white tracking-tight">
            Les 3 Sections Techniques du CJP
          </h2>
          <p className="mt-3 text-xs sm:text-base text-[#737373] dark:text-[#A3A3A3] leading-relaxed">
            Chaque adhérent choisit un domaine de spécialisation pour participer aux ateliers hebdomadaires,
            projets collectifs et bootcamps intensifs.
          </p>
        </div>

        {/* GRILLE DES 3 SECTIONS AVEC ANIMATION PRO */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const ExtraIcon = sec.extraIcon;
            const percentage =
              totalMembers > 0 ? Math.round((sec.count / totalMembers) * 100) : 0;

            return (
              <div
                key={sec.id}
                className={`section-card group relative rounded-2xl sm:rounded-3xl border ${sec.borderClass} bg-radial ${sec.bgGlow} bg-[#F9F9F9] dark:bg-[#1b1b1b] p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5`}
              >
                <div>
                  {/* EN-TÊTE CARTE : ICÔNE + BADGE EFFECTIF */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${sec.accentColor}1A`,
                        color: sec.accentColor,
                        border: `1px solid ${sec.accentColor}40`,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${sec.badgeBg}`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {sec.count} {sec.count > 1 ? "membres" : "membre"}
                      </span>
                    </div>
                  </div>

                  {/* NOM DE LA SECTION */}
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-[#171717] dark:text-white mb-2 flex items-center justify-between">
                    <span>{sec.name}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#FFA500]" />
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] leading-relaxed mb-6">
                    {sec.description}
                  </p>

                  {/* MODULES / TECHNOLOGIES */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#171717] dark:text-white uppercase tracking-wider">
                      <ExtraIcon className="w-3.5 h-3.5" style={{ color: sec.accentColor }} />
                      <span>Compétences clés :</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sec.modules.map((mod) => (
                        <span
                          key={mod}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${sec.tagColor} transition-transform duration-200 group-hover:translate-x-0.5`}
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BAS DE CARTE : BARRE DE PROGRESSION & POURCENTAGE */}
                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#333333]/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#737373] dark:text-[#A3A3A3]">
                    <span className="font-medium">Part des effectifs</span>
                    <span className="font-mono font-bold" style={{ color: sec.accentColor }}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E5E5E5] dark:bg-[#2d2d2d] overflow-hidden">
                    <div
                      className="progress-fill h-full rounded-full"
                      data-width={`${percentage}%`}
                      style={{
                        width: "0%",
                        backgroundColor: sec.accentColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
