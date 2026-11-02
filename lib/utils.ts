/**
 * Utilitaire de concaténation de classes CSS pour le Design System CJP
 */
export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean | undefined | null })[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const key of Object.keys(input)) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ").trim();
}
