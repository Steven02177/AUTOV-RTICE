const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO");

export function formatCOP(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "No informado";
  return copFormatter.format(Math.round(value));
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "No informado";
  return numberFormatter.format(value);
}

export function formatMileage(km: number | undefined | null): string {
  if (km === undefined || km === null || Number.isNaN(km)) return "No informado";
  return `${numberFormatter.format(km)} km`;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "No informado";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No informado";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "No informado";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No informado";
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convierte "1.200.000" o "1200000" en 1200000 para inputs de precio. */
export function parseMoneyInput(raw: string): number | undefined {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const value = Number(digits);
  return Number.isFinite(value) ? value : undefined;
}

export function moneyInputMask(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}

export function parseNumberInput(raw: string): number | undefined {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const value = Number(digits);
  return Number.isFinite(value) ? value : undefined;
}

export function titleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function formatDisplacement(cc: number | undefined): string {
  if (!cc) return "No informado";
  return cc >= 1000 ? `${(cc / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} L` : `${cc} cc`;
}
