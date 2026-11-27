/**
 * Helper para verificar si un email pertenece a un administrador autorizado.
 * Soporta múltiples correos separados por comas:
 * Ej: "admin1@gmail.com, admin2@gmail.com"
 */
export function getAdminEmails(): string[] {
    // En el navegador no existe "process": Next.js reemplaza NEXT_PUBLIC_ADMIN_EMAIL por su valor
    // al compilar, y ADMIN_EMAIL (privada) solo se lee en el servidor.
    const rawServer = typeof window === "undefined" ? process.env.ADMIN_EMAIL || "" : "";
    const rawClient = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
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
