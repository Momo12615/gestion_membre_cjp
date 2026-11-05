/**
 * Module d'envoi de SMS via la passerelle Nimba SMS (Guinée)
 */

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Normalise un numéro de téléphone au format international guinéen (+224...)
 * Accepte les formats : 620000000, 00224620000000, 224620000000, +224620000000, avec ou sans espaces/tirets.
 */
export function formatGuineanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, "");

  if (cleaned.startsWith("00224")) {
    cleaned = "+224" + cleaned.slice(5);
  } else if (cleaned.startsWith("224")) {
    cleaned = "+" + cleaned;
  } else if (cleaned.length === 9 && cleaned.startsWith("6")) {
    cleaned = "+224" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Envoie un SMS via l'API Nimba SMS
 */
export async function sendNimbaSms(
  to: string,
  message: string
): Promise<SendSmsResult> {
  try {
    const formattedPhone = formatGuineanPhoneNumber(to);

    const authorization =
      process.env.NIMBAHEADER ||
      (process.env.NIMBASERVICEID && process.env.NIMBASECRET
        ? `Basic ${Buffer.from(
            `${process.env.NIMBASERVICEID}:${process.env.NIMBASECRET}`
          ).toString("base64")}`
        : null);

    if (!authorization) {
      console.error("[Nimba SMS] Clés d'API manquantes dans l'environnement.");
      return {
        success: false,
        error: "Configuration Nimba SMS manquante dans le fichier d'environnement.",
      };
    }

    const senderName = process.env.SENDERNAME || "GuineeEcole";

    const response = await fetch("https://api.nimbasms.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({
        sender_name: senderName,
        to: [formattedPhone],
        message: message,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errDetail =
        (data && (data.detail || data.to || data.message || JSON.stringify(data))) ||
        `Erreur HTTP ${response.status}`;
      console.error("[Nimba SMS Error]", response.status, errDetail);
      return {
        success: false,
        error: `Erreur d'envoi Nimba SMS: ${errDetail}`,
      };
    }

    return {
      success: true,
      messageId: data?.message_id || data?.id || undefined,
    };
  } catch (err: any) {
    console.error("[Nimba SMS Exception]", err);
    return {
      success: false,
      error: err.message || "Erreur réseau lors de la communication avec Nimba SMS.",
    };
  }
}

