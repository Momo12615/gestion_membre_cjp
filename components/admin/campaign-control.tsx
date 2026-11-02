"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleInscriptionsStatus } from "@/actions/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Power, Lock } from "lucide-react";

interface CampaignControlProps {
  inscriptionsOpen: boolean;
}

export function CampaignControl({ inscriptionsOpen }: CampaignControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleInscriptionsStatus(!inscriptionsOpen);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222]">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-heading font-semibold text-xs sm:text-base text-[#171717] dark:text-white">
            Campagne d&apos;Inscriptions
          </h4>
          <Badge
            variant={inscriptionsOpen ? "success" : "error"}
            size="sm"
            dot
          >
            {inscriptionsOpen ? "Ouverte" : "Clôturée"}
          </Badge>
        </div>
        <p className="text-[11px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] leading-relaxed">
          {inscriptionsOpen
            ? "Les chefs de classe peuvent enregistrer les étudiants."
            : "Inscriptions verrouillées pour tous les chefs de classe."}
        </p>
      </div>

      <Button
        variant={inscriptionsOpen ? "danger" : "primary"}
        size="sm"
        isLoading={isPending}
        onClick={handleToggle}
        leftIcon={inscriptionsOpen ? <Lock className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
        className="w-full sm:w-auto shrink-0 text-xs"
      >
        {inscriptionsOpen ? "Clôturer la campagne" : "Ouvrir la campagne"}
      </Button>
    </div>
  );
}
