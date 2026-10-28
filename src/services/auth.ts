import { STORAGE_KEYS, readJSON, removeKey, sha256, writeJSON } from "@/repositories/localStore";

export type AuthRole = "admin" | "vendedor";

export interface AuthUser {
  email: string;
  name: string;
  role: AuthRole;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
  createdAt: string;
}

interface StoredSession {
  email: string;
  name: string;
  role: AuthRole;
  expiresAt: number;
}

const SESSION_HOURS = 8;
const env = import.meta.env;
const supabaseUrl = (env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const supabaseKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseAuthEnabled = Boolean(supabaseUrl && supabaseKey && env.VITE_DATA_MODE === "supabase");

export function usingSupabaseAuth(): boolean {
  return supabaseAuthEnabled;
}

export function hasAdminUsers(): boolean {
  return readJSON<StoredUser[]>(STORAGE_KEYS.adminUsers, []).length > 0;
}

/**
 * Solo disponible mientras NO exista ningún administrador.
 * En producción, el primer usuario se crea desde el SQL de Supabase con un hash
 * generado fuera del repositorio (ver `supabase/schema.sql`).
 */
export async function createFirstAdmin(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthUser> {
  const users = readJSON<StoredUser[]>(STORAGE_KEYS.adminUsers, []);
  if (users.length > 0) throw new Error("Ya existe un administrador. Este flujo solo está disponible la primera vez.");
  if (input.password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
  const email = input.email.trim().toLowerCase();
  const user: StoredUser = {
    email,
    name: input.name.trim(),
    role: "admin",
    passwordHash: await sha256(`${email}:${input.password}`),
    createdAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEYS.adminUsers, [user]);
  // La sesión se persiste igual que en signIn: sin esto el administrador se
  // cerraría al navegar a cualquier otra página.
  const session: StoredSession = {
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: Date.now() + SESSION_HOURS * 3600_000,
  };
  writeJSON(STORAGE_KEYS.adminSession, session);
  return { email: user.email, name: user.name, role: user.role };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (supabaseAuthEnabled) {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: supabaseKey as string, "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    if (!response.ok) throw new Error("Credenciales inválidas.");
    const payload = (await response.json()) as { access_token: string; user?: { email?: string } };
    window.sessionStorage.setItem("av:supabase-access-token", payload.access_token);
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(cleanEmail)}&limit=1`, {
      headers: {
        apikey: supabaseKey as string,
        Authorization: `Bearer ${payload.access_token}`,
      },
    });
    const profile = profileResponse.ok ? ((await profileResponse.json()) as Array<{ role?: string; name?: string }>) : [];
    const role: AuthRole = profile[0]?.role === "admin" || profile[0]?.role === "vendedor" ? profile[0].role : "vendedor";
    const user: AuthUser = { email: cleanEmail, name: profile[0]?.name ?? cleanEmail, role };
    const session: StoredSession = { ...user, expiresAt: Date.now() + SESSION_HOURS * 3600_000 };
    writeJSON(STORAGE_KEYS.adminSession, session);
    return user;
  }

  const users = readJSON<StoredUser[]>(STORAGE_KEYS.adminUsers, []);
  const user = users.find((item) => item.email === cleanEmail);
  const hash = await sha256(`${cleanEmail}:${password}`);
  if (!user || user.passwordHash !== hash) throw new Error("Credenciales inválidas.");
  const session: StoredSession = {
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: Date.now() + SESSION_HOURS * 3600_000,
  };
  writeJSON(STORAGE_KEYS.adminSession, session);
  return { email: user.email, name: user.name, role: user.role };
}

export function getSession(): AuthUser | null {
  const session = readJSON<StoredSession | null>(STORAGE_KEYS.adminSession, null);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    removeKey(STORAGE_KEYS.adminSession);
    return null;
  }
  return { email: session.email, name: session.name, role: session.role };
}

export function signOut(): void {
  removeKey(STORAGE_KEYS.adminSession);
  window.sessionStorage.removeItem("av:supabase-access-token");
}
