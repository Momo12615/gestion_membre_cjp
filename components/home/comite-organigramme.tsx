"use client";

import React, { useEffect, useRef } from "react";
import {
  Crown,
  Users,
  ClipboardCheck,
  Megaphone,
  BookOpen,
  HeartHandshake,
  Landmark,
  Handshake,
  Lightbulb,
  Star,
  Sparkles,
} from "lucide-react";
import { Organisateur } from "@/lib/types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ComiteOrganigrammeProps {
  organisateurs: Organisateur[];
}

export function ComiteOrganigramme({ organisateurs }: ComiteOrganigrammeProps) {
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<HTMLDivElement>(null);
  const orgaSectionRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const rhSectionRef = useRef<HTMLDivElement>(null);
  const piliersRef = useRef<HTMLDivElement>(null);

  // Helper pour trouver un organisateur par son rôle
  const findOrga = (roleKeywords: string[]) => {
    return organisateurs.find((o) =>
      roleKeywords.some((kw) => o.role.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  // 1. Direction
  const president = findOrga(["Président", "President"]);
  const coordinateur = findOrga(["Coordinateur"]);

  // 2. Organisation & Communication
  const orga1 = findOrga(["1er Chargé à l'Organisation", "1er Charge a l'Organisation"]);
  const orga2 = findOrga(["2ème Chargé à l'Organisation", "2eme Charge a l'Organisation"]);
  const orga3 = findOrga(["3ème Chargé à l'Organisation", "3eme Charge a l'Organisation"]);
  const orga4 = findOrga(["4ème Chargé à l'Organisation", "4eme Charge a l'Organisation"]);
  const comm = findOrga(["Information", "Communication"]);

  // 3. Formations
  const form1 = findOrga(["1er Chargé aux Formations", "1ere Chargee aux Formations"]);
  const form2 = findOrga(["2ème Chargé aux Formations", "2eme Charge aux Formations"]);
  const form3 = findOrga(["3ème Chargé aux Formations", "3eme Charge aux Formations"]);

  // 4. RH & Finances
  const rh1 = findOrga(["1er Chargé aux Ressources Humaines", "1ere Chargee aux Ressources Humaines"]);
  const rh2 = findOrga(["2ème Chargée aux Ressources Humaines", "2eme Chargee aux Ressources Humaines"]);
  const tresoriere = findOrga(["Trésorière", "Tresoriere", "Trésorier"]);

  // ANIMATIONS GSAP SCROLLTRIGGER
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. En-tête Comité
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

      // 2. Direction (Président & Coordinateur)
      const dirCards = directionRef.current?.querySelectorAll(".poster-card");
      if (dirCards && dirCards.length === 2) {
        gsap.from(dirCards[0], {
          scrollTrigger: {
            trigger: dirCards[0],
            start: "top 92%",
            once: true,
          },
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "all",
        });
        gsap.from(dirCards[1], {
          scrollTrigger: {
            trigger: dirCards[1],
            start: "top 92%",
            once: true,
          },
          x: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // 3. Pôle Organisation
      const orgaCards = orgaSectionRef.current?.querySelectorAll(".poster-card");
      if (orgaCards && orgaCards.length > 0) {
        gsap.from(orgaCards, {
          scrollTrigger: {
            trigger: orgaSectionRef.current,
            start: "top 90%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // 4. Pôle Formations
      const formCards = formSectionRef.current?.querySelectorAll(".poster-card");
      if (formCards && formCards.length > 0) {
        gsap.from(formCards, {
          scrollTrigger: {
            trigger: formSectionRef.current,
            start: "top 90%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // 5. Pôle RH & Finances
      const rhCards = rhSectionRef.current?.querySelectorAll(".poster-card");
      if (rhCards && rhCards.length > 0) {
        gsap.from(rhCards, {
          scrollTrigger: {
            trigger: rhSectionRef.current,
            start: "top 90%",
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // 6. Les 4 Piliers
      const pilierItems = piliersRef.current?.querySelectorAll(".pilier-card");
      if (pilierItems && pilierItems.length > 0) {
        gsap.from(pilierItems, {
          scrollTrigger: {
            trigger: piliersRef.current,
            start: "top 90%",
            once: true,
          },
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        });
      }

      // Rafraîchir les positions ScrollTrigger après montage
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Composant carte unitaire adapté aux thèmes clair et sombre
  const OrganisateurPosterCard = ({
    title,
    orga,
    defaultName,
    Icon,
    isLeader = false,
  }: {
    title: string;
    orga?: Organisateur;
    defaultName: string;
    Icon: any;
    isLeader?: boolean;
  }) => {
    const fullName = orga
      ? `${orga.first_name} ${orga.last_name}`.toUpperCase()
      : defaultName.toUpperCase();

    return (
      <div
        className={`poster-card group relative rounded-2xl border-2 border-[#FFA500]/60 dark:border-[#FFA500]/70 bg-white dark:bg-[#0E0E0E] p-3.5 sm:p-4.5 flex flex-col items-center justify-between text-center transition-all duration-300 hover:scale-[1.03] hover:border-[#FFA500] shadow-sm shadow-[#FFA500]/10 dark:shadow-black/50 hover:shadow-xl hover:shadow-[#FFA500]/25 ${
          isLeader ? "w-full max-w-[280px] ring-1 ring-[#FFA500]/30 shadow-md shadow-[#FFA500]/15" : "w-full"
        }`}
      >
        {/* Lueur dorée interne */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#FFA500]/10 via-transparent to-transparent pointer-events-none" />

        {/* PILULE DE TITRE / POSTE */}
        <div className="relative z-10 w-full mb-3.5">
          <span className="inline-block w-full py-1 px-2.5 rounded-lg bg-[#FFA500] text-black font-heading font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-xs truncate">
            {title}
          </span>
        </div>

        {/* PHOTO OU ICÔNE EN CERCLE DORÉ */}
        <div className="relative z-10 my-1 sm:my-2">
          {orga?.photo_url ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#FFA500] shadow-md shadow-[#FFA500]/30 shrink-0 mx-auto bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105">
              <img
                src={orga.photo_url}
                alt={fullName}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#FFA500] bg-[#FFF4D6] dark:bg-[#FFA500]/10 flex items-center justify-center text-[#FFA500] shadow-md shadow-[#FFA500]/20 mx-auto group-hover:bg-[#FFA500]/25 transition-all duration-300 group-hover:scale-105">
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          )}
        </div>

        {/* NOM COMPLET EN MAJUSCULES (ADAPTÉ CLAIR / SOMBRE) */}
        <div className="relative z-10 mt-3 w-full">
          <p className="font-heading font-bold text-xs sm:text-sm text-[#171717] dark:text-white tracking-wide uppercase leading-tight line-clamp-2">
            {fullName}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={containerRef}
      id="comite"
      className="py-16 md:py-24 relative overflow-hidden bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#171717] dark:text-white transition-colors duration-200"
    >
      {/* EFFET DE FOND DU POSTER CJP (LUEURS DORÉES) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#FFA500]/10 dark:bg-[#FFA500]/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#F5B51B]/8 rounded-full blur-[140px] pointer-events-none" />

      {/* LIGNE DE DÉMARCATION DORÉE */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#FFA500] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* EN-TÊTE OFFICIEL DE L'AFFICHE */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-[#FFA500]/40 bg-[#FFA500]/10 text-[#FFA500] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gouvernance & Équipe Opérationnelle</span>
          </div>

          <p className="text-xs sm:text-sm font-heading font-bold tracking-[0.25em] text-[#FFA500] uppercase mb-1">
            NOUVEAU
          </p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#171717] dark:text-white tracking-tight uppercase">
            COMITÉ <span className="text-[#FFA500]">DU CJP</span>
          </h2>

          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#FFA500]" />
            <p className="font-heading font-semibold text-xs sm:text-sm text-[#525252] dark:text-[#E5E5E5] tracking-widest uppercase">
              ENSEMBLE, CODONS L&apos;AVENIR !
            </p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#FFA500]" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANGÉE 1 : DIRECTION (PRÉSIDENT & COORDINATEUR)                           */}
        {/* ========================================================================= */}
        <div
          ref={directionRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-12"
        >
          <OrganisateurPosterCard
            title="PRÉSIDENT"
            orga={president}
            defaultName="FODE MOMO SOUMAH"
            Icon={Crown}
            isLeader
          />
          <OrganisateurPosterCard
            title="COORDINATEUR"
            orga={coordinateur}
            defaultName="HASMIOU THIOYE"
            Icon={Users}
            isLeader
          />
        </div>

        {/* ========================================================================= */}
        {/* RANGÉE 2 : ORGANISATION & COMMUNICATION (5 CARTES)                        */}
        {/* ========================================================================= */}
        <div ref={orgaSectionRef} className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFA500]" />
            <p className="text-xs font-heading font-bold text-[#FFA500] uppercase tracking-wider">
              Pôle Organisation & Communication
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <OrganisateurPosterCard
              title="1ER CHARGÉ À L'ORGANISATION"
              orga={orga1}
              defaultName="JEAN MICHEL HABA"
              Icon={ClipboardCheck}
            />
            <OrganisateurPosterCard
              title="2ÈME CHARGÉ À L'ORGANISATION"
              orga={orga2}
              defaultName="ALHASSANE BANGOURA"
              Icon={ClipboardCheck}
            />
            <OrganisateurPosterCard
              title="3ÈME CHARGÉ À L'ORGANISATION"
              orga={orga3}
              defaultName="THIERNO SADOU DIALLO"
              Icon={ClipboardCheck}
            />
            <OrganisateurPosterCard
              title="4ÈME CHARGÉ À L'ORGANISATION"
              orga={orga4}
              defaultName="ALHASSANE NIAISSA"
              Icon={ClipboardCheck}
            />
            <OrganisateurPosterCard
              title="INFORMATION & COMMUNICATION"
              orga={comm}
              defaultName="MOUSSOUKOURA DIAWARA"
              Icon={Megaphone}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANGÉE 3 : FORMATIONS (3 CARTES)                                         */}
        {/* ========================================================================= */}
        <div ref={formSectionRef} className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFA500]" />
            <p className="text-xs font-heading font-bold text-[#FFA500] uppercase tracking-wider">
              Pôle Formations Techniques
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <OrganisateurPosterCard
              title="1ERE CHARGÉE AUX FORMATIONS"
              orga={form1}
              defaultName="CAMARA BOUBACAR MANGUÉ"
              Icon={BookOpen}
            />
            <OrganisateurPosterCard
              title="2ÈME CHARGÉ AUX FORMATIONS"
              orga={form2}
              defaultName="OUSMANE DIALLO"
              Icon={BookOpen}
            />
            <OrganisateurPosterCard
              title="3ÈME CHARGÉ AUX FORMATIONS"
              orga={form3}
              defaultName="YOKOI BEOVOGUI"
              Icon={BookOpen}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANGÉE 4 : RESSOURCES HUMAINES & FINANCES (3 CARTES)                     */}
        {/* ========================================================================= */}
        <div ref={rhSectionRef} className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFA500]" />
            <p className="text-xs font-heading font-bold text-[#FFA500] uppercase tracking-wider">
              Pôle Ressources Humaines & Finances
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <OrganisateurPosterCard
              title="1ERE CHARGÉE AUX RESSOURCES HUMAINES"
              orga={rh1}
              defaultName="SAGNO MARCEL"
              Icon={HeartHandshake}
            />
            <OrganisateurPosterCard
              title="2ÈME CHARGÉE AUX RESSOURCES HUMAINES"
              orga={rh2}
              defaultName="MARIAMA KOLENKÉ DIALLO"
              Icon={HeartHandshake}
            />
            <OrganisateurPosterCard
              title="TRÉSORIÈRE"
              orga={tresoriere}
              defaultName="CHARLOTTE HABA"
              Icon={Landmark}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANGÉE 5 : LES 4 PILIERS DE L'AFFICHE OFFICIELLE                          */}
        {/* ========================================================================= */}
        <div ref={piliersRef} className="pt-8 border-t border-[#FFA500]/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
            <div className="pilier-card flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#FFA500]/30 dark:border-[#FFA500]/25 shadow-xs hover:border-[#FFA500] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs text-[#FFA500] uppercase truncate">
                  ENGAGEMENT
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] truncate">
                  Travailler avec détermination
                </p>
              </div>
            </div>

            <div className="pilier-card flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#FFA500]/30 dark:border-[#FFA500]/25 shadow-xs hover:border-[#FFA500] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs text-[#FFA500] uppercase truncate">
                  COLLABORATION
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] truncate">
                  Avancer ensemble, plus loin
                </p>
              </div>
            </div>

            <div className="pilier-card flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#FFA500]/30 dark:border-[#FFA500]/25 shadow-xs hover:border-[#FFA500] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs text-[#FFA500] uppercase truncate">
                  INNOVATION
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] truncate">
                  Créer, apprendre, progresser
                </p>
              </div>
            </div>

            <div className="pilier-card flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#FFA500]/30 dark:border-[#FFA500]/25 shadow-xs hover:border-[#FFA500] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#FFF4D6] dark:bg-[#FFA500]/15 flex items-center justify-center text-[#FFA500] shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs text-[#FFA500] uppercase truncate">
                  EXCELLENCE
                </p>
                <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] truncate">
                  Viser l&apos;excellence en tout
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="font-heading font-bold text-sm sm:text-base text-[#FFA500] tracking-widest uppercase">
              ENSEMBLE, CODONS L&apos;AVENIR !
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
