/** Solo permite redirecciones internas (evita open redirects). */
export function safeNextPath(next: string | null | undefined, fallback = "/cuenta"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
