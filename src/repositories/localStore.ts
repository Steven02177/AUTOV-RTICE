/**
 * Capa de persistencia local (modo demostración).
 * Todos los datos viven bajo prefijo `av:` en localStorage y pueden limpiarse
 * desde el panel administrativo. En modo Supabase esta capa se reemplaza.
 */

const PREFIX = "av:";

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn("No fue posible guardar localmente:", error);
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignorado */
  }
}

export const STORAGE_KEYS = {
  favorites: "favorites",
  comparison: "comparison",
  inquiries: "inquiries",
  submissions: "submissions",
  sellers: "sellers",
  vehicles: "vehicles",
  adminUsers: "admin-users",
  adminSession: "admin-session",
} as const;

export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
