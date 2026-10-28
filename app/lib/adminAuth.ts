/**
 * Helper para verificar si un email pertenece a un administrador autorizado.
 * Soporta múltiples correos separados por comas:
 * Ej: "admin1@gmail.com, admin2@gmail.com"
 */
export function getAdminEmails(): string[] {
    const rawServer = typeof process !== "undefined" ? process.env.ADMIN_EMAIL || "" : "";
    const rawClient = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ADMIN_EMAIL || "" : "";
    const combined = `${rawServer},${rawClient}`;

    const uniqueEmails = new Set(
        combined
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
    );

    return Array.from(uniqueEmails);
}

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const allowed = getAdminEmails();
    return allowed.includes(email.trim().toLowerCase());
}
