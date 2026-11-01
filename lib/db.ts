import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TUROS_TOKEN || process.env.TURSO_TOKEN;

if (!url) {
  throw new Error("Variable d'environnement TURSO_URL manquante dans .env");
}

if (!authToken) {
  throw new Error("Token Turso (TUROS_TOKEN ou TURSO_TOKEN) manquant dans .env");
}

export const db = createClient({
  url,
  authToken,
});
