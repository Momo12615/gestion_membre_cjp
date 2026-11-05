import {
  createClient,
  type Client,
  type InStatement,
  type InArgs,
  type TransactionMode,
} from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TUROS_TOKEN || process.env.TURSO_TOKEN;

if (!url) {
  throw new Error("Variable d'environnement TURSO_URL manquante dans .env");
}

if (!authToken) {
  throw new Error("Token Turso (TUROS_TOKEN ou TURSO_TOKEN) manquant dans .env");
}

/**
 * Détecte si l'erreur rencontrée est une erreur réseau / timeout transitoire (ex: Turso en veille, micro-coupure internet).
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();

  // Ne pas relancer les interruptions internes de prerendering de Next.js
  if (
    msg.includes("during prerendering") ||
    msg.includes("prerender") ||
    msg.includes("bailout") ||
    msg.includes("next_")
  ) {
    return false;
  }

  const code = String(error.code || error.cause?.code || "").toUpperCase();
  const causeMsg = String(error.cause?.message || "").toLowerCase();

  return (
    code.includes("TIMEOUT") ||
    code.includes("ECONNRESET") ||
    code.includes("ECONNREFUSED") ||
    code.includes("UND_ERR") ||
    code.includes("ENOTFOUND") ||
    code.includes("EAI_AGAIN") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("connecttimeouterror") ||
    msg.includes("network") ||
    msg.includes("socket") ||
    causeMsg.includes("timeout") ||
    causeMsg.includes("connect") ||
    causeMsg.includes("und_err")
  );
}

/**
 * Exécute une opération vers Turso avec relances automatiques en cas d'échec transitoire.
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  opName = "requête",
  maxRetries = 3,
  initialDelay = 400
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      if (attempt < maxRetries && isRetryableError(err)) {
        const delay =
          initialDelay * Math.pow(1.5, attempt - 1) + Math.random() * 100;
        console.warn(
          `[Turso DB] Tentative ${attempt}/${maxRetries} pour ${opName} échouée (${err?.message || err}). Nouvelle tentative dans ${Math.round(delay)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Client HTTP avec AbortSignal natif (8 secondes par tentative) pour éviter les blocages réseau
 */
const customFetch = (input: any, init?: any) => {
  if (
    !init?.signal &&
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return fetch(input, { ...init, signal: AbortSignal.timeout(8000) });
  }
  return fetch(input, init);
};

const rawClient: Client = createClient({
  url,
  authToken,
  fetch: customFetch,
});

export const db: Client = {
  ...rawClient,
  execute: ((stmtOrSql: InStatement | string, args?: InArgs) => {
    return withRetry(
      () =>
        args !== undefined
          ? rawClient.execute(stmtOrSql as string, args)
          : rawClient.execute(stmtOrSql as InStatement),
      "execute"
    );
  }) as Client["execute"],
  batch: ((stmts: Array<InStatement | string>, mode?: TransactionMode) => {
    return withRetry(() => rawClient.batch(stmts, mode), "batch");
  }) as Client["batch"],
  transaction: ((mode?: TransactionMode) => {
    return withRetry(() => rawClient.transaction(mode), "transaction");
  }) as Client["transaction"],
};
