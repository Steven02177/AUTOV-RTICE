import type { Seller, Vehicle } from "@/types/vehicle";

/**
 * Integración de WhatsApp.
 * El número SIEMPRE proviene del vendedor o de la configuración del sitio.
 * Si no está configurado, no se genera un enlace: se ofrece el formulario de contacto.
 */
export function hasWhatsApp(seller?: Seller | null): seller is Seller {
  return Boolean(seller?.phone && seller.phone.replace(/\D/g, "").length >= 10);
}

export function vehicleInquiryMessage(vehicle: Vehicle, origin: string): string {
  return [
    `Hola, me interesa el vehículo ${vehicle.brand} ${vehicle.model} ${vehicle.version} (${vehicle.year}).`,
    `Vi el anuncio en AUTOVÉRTICE y quisiera confirmar disponibilidad y detalles.`,
    `Ficha: ${origin}`,
  ].join(" ");
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function sellerWhatsAppUrl(seller: Seller | null | undefined, vehicle: Vehicle, origin: string) {
  const phone = seller?.phone;
  if (!phone) return null;
  return buildWhatsAppUrl(phone, vehicleInquiryMessage(vehicle, origin));
}

export function shareUrl(path: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
