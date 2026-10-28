/**
 * Configuración central del sitio.
 * Cambia aquí el nombre, los colores de marca, los textos comerciales y los contactos.
 */
const env = import.meta.env;

export const SITE = {
  name: "AUTOVÉRTICE",
  nameHtml: "AUTO<span class='text-lime'>VÉRTICE</span>",
  tagline: "Marketplace premium de carros y motos",
  legalName: "AUTOVÉRTICE (proyecto de demostración)",
  description:
    "Plataforma para explorar, comparar y elegir carros y motos nuevos y usados en Colombia, con información transparente y contacto directo con el vendedor.",
  city: "Bogotá D.C.",
  country: "Colombia",
  /** Correo comercial configurado. Si está vacío, el formulario usa solo el canal interno. */
  email: "contacto@autovertice.demo",
  /** Teléfono/WhatsApp en formato internacional (ej: 573001112233). Vacío = no configurado. */
  whatsapp: (env.VITE_DEFAULT_WHATSAPP as string | undefined) ?? "",
  /** Configura las redes sociales dejando la URL vacía si aún no existen: no se renderizan. */
  socials: [] as { label: string; url: string }[],
  dataMode: ((env.VITE_DATA_MODE as string | undefined) ?? "demo") as "demo" | "supabase",
  demoNotice:
    "Los anuncios marcados como demostración son ficticios y se usan para evaluar la plataforma. No representan vehículos reales en venta.",
} as const;

export const isDemoMode = SITE.dataMode !== "supabase";
