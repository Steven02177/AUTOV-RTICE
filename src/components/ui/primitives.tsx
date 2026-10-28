import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import type { Condition, ListingStatus, SellerType } from "@/types/vehicle";

/* ------------------------------- Badges ------------------------------- */

export function ConditionBadge({ condition }: { condition: Condition }) {
  const isNew = condition === "nuevo";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        isNew ? "bg-lime text-graphite" : "bg-white/10 text-white/85"
      }`}
    >
      {isNew ? "Nuevo" : "Usado"}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-graphite">
      Destacado
    </span>
  );
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  const styles: Record<ListingStatus, string> = {
    publicado: "bg-lime/15 text-lime border border-lime/40",
    pendiente: "bg-amber-500/15 text-amber-300 border border-amber-400/40",
    rechazado: "bg-red-500/15 text-red-300 border border-red-400/40",
    vendido: "bg-sky-500/15 text-sky-300 border border-sky-400/40",
    desactivado: "bg-white/10 text-steel border border-white/15",
  };
  const labels: Record<ListingStatus, string> = {
    publicado: "Publicado",
    pendiente: "Pendiente",
    rechazado: "Rechazado",
    vendido: "Vendido",
    desactivado: "Desactivado",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function SellerTypeBadge({ type }: { type: SellerType }) {
  const labels: Record<SellerType, string> = {
    particular: "Particular",
    concesionario: "Concesionario",
    empresa: "Empresa",
  };
  return <span className="chip">{labels[type]}</span>;
}

/* ---------------------------- Encabezados ---------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-8 flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="mt-3 text-sm leading-relaxed text-steel sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ Imágenes ------------------------------ */

export function ImageWithFallback({
  src,
  alt,
  className = "",
  loading = "lazy",
  fallbackLabel = "Imagen no disponible",
}: {
  src?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-graphite-3 to-graphite ${className}`}
        role="img"
        aria-label={`${alt} - ${fallbackLabel}`}
      >
        <ImageOff className="size-6 text-steel" />
        <span className="px-3 text-center text-[11px] uppercase tracking-wider text-steel">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/* ----------------------------- Paginación ----------------------------- */

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="btn-ghost size-10 !p-0"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-current={item === page ? "page" : undefined}
          className={`size-10 rounded-full text-sm font-semibold transition ${
            item === page ? "bg-lime text-graphite" : "border border-white/12 text-white/80 hover:border-lime/50"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="btn-ghost size-10 !p-0"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

/* ------------------------------ Formularios ------------------------------ */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  required,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-1 text-lime">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-steel">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- Modal -------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-graphite/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-graphite-2 p-6 shadow-card animate-fade-up sm:rounded-3xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="display text-2xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-steel transition hover:text-white">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
