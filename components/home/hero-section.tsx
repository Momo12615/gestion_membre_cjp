"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronDown,
  Award,
  Users,
  ShieldCheck,
  Code2,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Cjp3DScene = dynamic(
  () => import("@/components/home/cjp-3d-scene").then((m) => m.Cjp3DScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[240px] sm:h-[320px] md:h-[360px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFA500]/20 border-t-[#FFA500] animate-spin" />
      </div>
    ),
  }
);

interface HeroSectionProps {
  session: any;
  dashboardUrl: string;
  totalMembers: number;
  orgaCount: number;
}

export function HeroSection({
  session,
  dashboardUrl,
  totalMembers,
  orgaCount,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mottoRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const kpiGridRef = useRef<HTMLDivElement>(null);

  // Compteurs KPI DOM refs
  const countMembersRef = useRef<HTMLParagraphElement>(null);
  const countOrgaRef = useRef<HTMLParagraphElement>(null);
  const countSectionsRef = useRef<HTMLParagraphElement>(null);
  const countPercentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. TIMELINE D'ENTRÉE DU HERO (FLUIDE SANS RETARDER LE LCP DU TITRE)
      // Le titre h1 reste immédiatement visible pour garantir un LCP instantané (< 0.5s)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (badgeRef.current) {
        tl.from(badgeRef.current, {
          y: -15,
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          clearProps: "all",
        });
      }

      if (mottoRef.current) {
        tl.from(
          mottoRef.current,
          {
            y: 12,
            opacity: 0,
            duration: 0.5,
            clearProps: "all",
          },
          "-=0.2"
        );
      }

      if (descRef.current) {
        tl.from(
          descRef.current,
          {
            y: 15,
            opacity: 0,
            duration: 0.65,
            clearProps: "all",
          },
          "-=0.35"
        );
      }

      if (buttonsRef.current) {
        const btns = buttonsRef.current.children;
        tl.from(
          btns,
          {
            y: 20,
            opacity: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "all",
          },
          "-=0.3"
        );
      }

      if (kpiGridRef.current) {
        const kpiCards = kpiGridRef.current.children;
        tl.from(
          kpiCards,
          {
            y: 25,
            opacity: 0,
            stagger: 0.06,
            duration: 0.65,
            ease: "power2.out",
            clearProps: "all",
          },
          "-=0.2"
        );
      }

      // 2. COMPTEURS ANIMÉS EN TEMPS RÉEL (0 -> VALEUR RÉELLE)
      const animateCounter = (
        el: HTMLElement | null,
        targetValue: number,
        suffix: string = ""
      ) => {
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetValue,
          duration: 1.6,
          delay: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            el.innerText = `${Math.round(obj.val)}${suffix}`;
          },
        });
      };

      animateCounter(countMembersRef.current, totalMembers);
      animateCounter(countOrgaRef.current, orgaCount > 0 ? orgaCount : 13);
      animateCounter(countSectionsRef.current, 3);
      animateCounter(countPercentRef.current, 100, "%");

      // 3. EFFET DE PARALLAXE DOUX AU SCROLL
      if (contentWrapperRef.current && containerRef.current) {
        gsap.to(contentWrapperRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom 20%",
            scrub: 0.6,
          },
          y: -40,
          opacity: 0.4,
          ease: "none",
        });
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [totalMembers, orgaCount]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E5E5E5] dark:border-[#262626]"
    >
      {/* LUEURS D'AMBIANCE OFFICIELLES OR / ORANGE (#FFA500 & #F5B51B) */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-[#FFA500]/12 dark:bg-[#FFA500]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[45%] right-[-10%] w-[450px] h-[450px] bg-[#F5B51B]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* GRILLE TECHNIQUE DISCRÈTE */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFA50008_1px,transparent_1px),linear-gradient(to_bottom,#FFA50008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div
        ref={contentWrapperRef}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center will-change-transform"
      >
        {/* BADGE OFFICIEL */}
        <div ref={badgeRef} className="mb-4 inline-flex items-center gap-2">
          <Badge variant="cjp" size="md" dot>
            Plateforme Officielle • Club des Jeunes Programmeurs
          </Badge>
        </div>

        {/* SCÈNE 3D INTERACTIVE DES LETTRES "CJP" (THREE.JS & GSAP) */}
        <div className="w-full my-1 sm:my-3">
          <Cjp3DScene />
        </div>

        {/* TITRE PRINCIPAL */}
        <h1
          ref={titleRef}
          className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#171717] dark:text-white max-w-4xl"
        >
          L&apos;Excellence Technologique au Service de la{" "}
          <span className="text-[#FFA500] underline decoration-[#FFA500]/50 decoration-wavy decoration-2">
            Jeunesse
          </span>
        </h1>

        {/* DEVISE DU CLUB */}
        <p
          ref={mottoRef}
          className="mt-3 font-heading font-semibold text-xs sm:text-base text-[#FFA500] tracking-widest uppercase"
        >
          « Ensemble, codons l&apos;avenir ! »
        </p>

        {/* PARAGRAPHE DESCRIPTIF */}
        <p
          ref={descRef}
          className="mt-3 text-xs sm:text-base text-[#737373] dark:text-[#A3A3A3] max-w-2xl leading-relaxed"
        >
          Plateforme centralisée de gestion des membres, des promotions, des 3
          sections de spécialisation et de la gouvernance officielle du{" "}
          <strong className="text-[#171717] dark:text-white font-semibold">
            Club des Jeunes Programmeurs (CJP)
          </strong>
          .
        </p>

        {/* BOUTONS D'ACTION */}
        <div
          ref={buttonsRef}
          className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link href={dashboardUrl} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>{session ? "Accéder à mon espace" : "Se connecter au portail"}</span>
              <ArrowRight className="w-4 h-4 text-[#171717]" />
            </Button>
          </Link>

          <a href="#sections" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Découvrir les 3 Sections</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </a>

          <a href="#comite" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 border-[#FFA500]/40 text-[#FFA500] hover:bg-[#FFA500]/10 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Voir le Comité (13)</span>
              <Award className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* STATS EN TEMPS RÉEL (BANNIÈRE KPI AVEC COMPTEURS GSAP)                   */}
        {/* ========================================================================= */}
        <div
          ref={kpiGridRef}
          className="mt-12 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* Adhérents */}
          <div className="group p-3.5 sm:p-4 rounded-2xl border border-[#FFA500]/30 bg-[#FFF4D6]/50 dark:bg-[#FFA500]/10 text-center shadow-xs hover:border-[#FFA500] hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-[#FFA500]" />
              <p className="text-[11px] sm:text-xs font-semibold text-[#171717] dark:text-white">
                Adhérents Enregistrés
              </p>
            </div>
            <p
              ref={countMembersRef}
              className="font-heading font-extrabold text-2xl sm:text-3xl text-[#FFA500] font-mono tracking-tight"
            >
              0
            </p>
          </div>

          {/* Membres Comité */}
          <div className="group p-3.5 sm:p-4 rounded-2xl border border-[#E5E5E5] dark:border-[#333333] bg-[#F7F7F7]/80 dark:bg-[#1a1a1a] text-center shadow-xs hover:border-[#FFA500]/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-[#737373] dark:text-[#A3A3A3] group-hover:text-[#FFA500] transition-colors" />
              <p className="text-[11px] sm:text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                Membres du Comité
              </p>
            </div>
            <p
              ref={countOrgaRef}
              className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] dark:text-white font-mono tracking-tight"
            >
              0
            </p>
          </div>

          {/* Sections Techniques */}
          <div className="group p-3.5 sm:p-4 rounded-2xl border border-[#E5E5E5] dark:border-[#333333] bg-[#F7F7F7]/80 dark:bg-[#1a1a1a] text-center shadow-xs hover:border-[#FFA500]/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Code2 className="w-3.5 h-3.5 text-[#737373] dark:text-[#A3A3A3] group-hover:text-[#FFA500] transition-colors" />
              <p className="text-[11px] sm:text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                Sections Techniques
              </p>
            </div>
            <p
              ref={countSectionsRef}
              className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] dark:text-white font-mono tracking-tight"
            >
              0
            </p>
          </div>

          {/* Gestion Numérisée */}
          <div className="group p-3.5 sm:p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-center shadow-xs hover:border-emerald-500 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[11px] sm:text-xs font-semibold text-[#171717] dark:text-white">
                Gestion Numérisée
              </p>
            </div>
            <p
              ref={countPercentRef}
              className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 font-mono tracking-tight"
            >
              0%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
