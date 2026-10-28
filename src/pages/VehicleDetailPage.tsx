import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Heart,
  Info,
  MapPin,
  MessageSquareHeart,
  Scale,
  Share2,
  X,
  Zap,
} from "lucide-react";
import { sellerRepository, vehicleRepository } from "@/repositories";
import { useAsync, ErrorState, useToast } from "@/components/ui/feedback";
import { ConditionBadge, FeaturedBadge, Field, ImageWithFallback, Modal, SellerTypeBadge } from "@/components/ui/primitives";
import { vehiclePath } from "@/components/vehicles/VehicleCard";
import VehicleCarousel from "@/components/vehicles/VehicleCarousel";
import ContactForm from "@/components/forms/ContactForm";
import { useShop } from "@/context/ShopContext";
import { estimateCosts } from "@/services/costs";
import { copyToClipboard, sellerWhatsAppUrl } from "@/services/whatsapp";
import { formatCOP, formatDisplacement, formatDate, formatMileage, parseMoneyInput } from "@/utils/format";
import { useDocumentMeta } from "@/utils/seo";
import { SITE, isDemoMode } from "@/config/site";
import NotFoundPage from "./NotFoundPage";
import type { VehicleType } from "@/types/vehicle";

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: "Mecánica",
  automatica: "Automática",
  cvt: "CVT",
  semiautomatica: "Semiautomática",
};

const FUEL_LABEL: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  electrico: "Eléctrico",
  hibrido: "Híbrido",
  gnv: "GNV",
};

const DRIVETRAIN_LABEL: Record<string, string> = {
  fwd: "Delantera (FWD)",
  rwd: "Trasera (RWD)",
  awd: "Integral (AWD)",
  "4x4": "4x4",
};

function Gallery({ vehicle }: { vehicle: Awaited<ReturnType<typeof vehicleRepository.byId>> & object }) {
  const images = vehicle.imageUrls;
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const total = images.length;

  const go = (next: number) => setIndex((next + total) % total);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-graphite-2">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="block w-full cursor-zoom-in"
          aria-label="Ampliar imagen"
        >
          <ImageWithFallback
            src={images[index]}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version}, imagen ${index + 1} de ${total || 1}`}
            className="h-64 w-full object-cover sm:h-96 lg:h-[460px]"
            loading="eager"
          />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-graphite/80 text-white backdrop-blur transition hover:bg-lime hover:text-graphite"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-graphite/80 text-white backdrop-blur transition hover:bg-lime hover:text-graphite"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 rounded-full bg-graphite/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {total > 0 ? `${index + 1} / ${total}` : "Sin imágenes"}
        </span>

        {isDemoMode && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-graphite">
            Demostración
          </span>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((image, position) => (
            <button
              key={`${image}-${position}`}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Ver imagen ${position + 1}`}
              aria-current={position === index}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                position === index ? "border-lime" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <ImageWithFallback src={image} alt={`Miniatura ${position + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-graphite/95 p-4" role="dialog" aria-modal="true" aria-label="Vista ampliada">
          <button type="button" onClick={() => setLightbox(false)} aria-label="Cerrar vista ampliada" className="absolute inset-0 cursor-default" />
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 text-white hover:border-lime"
          >
            <X className="size-5" />
          </button>
          <ImageWithFallback
            src={images[index]}
            alt={`${vehicle.brand} ${vehicle.model}, imagen ampliada`}
            className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain"
            loading="eager"
          />
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Imagen anterior"
                className="absolute left-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-white hover:border-lime"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Imagen siguiente"
                className="absolute right-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-white hover:border-lime"
              >
                <ChevronRight className="size-6" />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-graphite/90 px-4 py-1.5 text-sm text-white">
                {index + 1} de {total}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CostCalculator({ vehicle }: { vehicle: NonNullable<Awaited<ReturnType<typeof vehicleRepository.byId>>> }) {
  const [downPercent, setDownPercent] = useState(30);
  const [annualRate, setAnnualRate] = useState(18);
  const [annualRaw, setAnnualRaw] = useState("18");
  const [months, setMonths] = useState(60);
  const [monthlyKm, setMonthlyKm] = useState(800);
  const [kmRaw, setKmRaw] = useState("800");
  const [fuelPrice, setFuelPrice] = useState(14000);
  const [fuelRaw, setFuelRaw] = useState("14.000");
  const [insurance, setInsurance] = useState(200000);
  const [insuranceRaw, setInsuranceRaw] = useState("200.000");

  const estimate = useMemo(
    () =>
      estimateCosts(vehicle, {
        downPaymentPercent: downPercent,
        annualRatePercent: annualRate,
        months,
        monthlyKm,
        fuelPricePerGallon: fuelPrice,
        insuranceMonthly: insurance,
      }),
    [vehicle, downPercent, annualRate, months, monthlyKm, fuelPrice, insurance],
  );

  return (
    <section id="costos" className="scroll-mt-24 rounded-2xl border border-white/10 bg-graphite-2/70 p-6">
      <h2 className="display text-2xl font-bold">Costos estimados</h2>
      <p className="mt-2 text-xs leading-relaxed text-steel">
        Calculadora orientativa. Los valores marcados como «ingresado por ti» son los únicos que controlas; el resto se
        calcula con supuestos visibles. Las tasas, seguros, impuestos y costos reales deben confirmarse con una
        entidad financiera y un taller.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="calc-down">
              Cuota inicial: {downPercent}% (ingresado por ti)
            </label>
            <input
              id="calc-down"
              type="range"
              min={0}
              max={70}
              step={5}
              value={downPercent}
              onChange={(event) => {
                setDownPercent(Number(event.target.value));
              }}
              className="w-full accent-lime"
            />
            <p className="mt-1 text-xs text-steel">{formatCOP(estimate.downPayment)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tasa anual (%) ingresa tu cotización" htmlFor="calc-rate">
              <input
                id="calc-rate"
                type="text"
                inputMode="decimal"
                className="field"
                value={annualRaw}
                onChange={(event) => {
                  const digits = event.target.value.replace(/[^\d.]/g, "");
                  setAnnualRaw(digits);
                  setAnnualRate(Number(digits) || 0);
                }}
              />
            </Field>
            <Field label="Plazo (meses)" htmlFor="calc-months">
              <select id="calc-months" className="field" value={months} onChange={(event) => setMonths(Number(event.target.value))}>
                {[24, 36, 48, 60, 72, 84].map((value) => (
                  <option key={value} value={value}>
                    {value} meses
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Km por mes (ingresado)" htmlFor="calc-km">
              <input
                id="calc-km"
                type="text"
                inputMode="numeric"
                className="field"
                value={kmRaw}
                onChange={(event) => {
                  const digits = event.target.value.replace(/[^\d]/g, "");
                  setKmRaw(digits);
                  setMonthlyKm(Number(digits) || 0);
                }}
              />
            </Field>
            <Field label="Precio por galón (ingresado)" htmlFor="calc-fuel">
              <input
                id="calc-fuel"
                type="text"
                inputMode="numeric"
                className="field"
                value={fuelRaw}
                onChange={(event) => {
                  setFuelRaw(event.target.value);
                  setFuelPrice(parseMoneyInput(event.target.value) ?? 0);
                }}
              />
            </Field>
          </div>

          <Field label="Seguro mensual cotizado (ingresado)" htmlFor="calc-insurance">
            <input
              id="calc-insurance"
              type="text"
              inputMode="numeric"
              className="field"
              value={insuranceRaw}
              onChange={(event) => {
                setInsuranceRaw(event.target.value);
                setInsurance(parseMoneyInput(event.target.value) ?? 0);
              }}
            />
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-steel">Precio de compra</span>
            <span className="display text-xl font-bold">{formatCOP(vehicle.price)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-steel">Monto a financiar</span>
            <span className="font-semibold">{formatCOP(estimate.financedAmount)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
            <span className="text-sm text-steel">Cuota mensual estimada</span>
            <span className="display text-2xl font-bold text-lime">{formatCOP(estimate.monthlyPayment)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-steel">Combustible estimado / mes</span>
            <span className="font-semibold">{estimate.fuelMonthly !== undefined ? formatCOP(estimate.fuelMonthly) : "No informado"}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-steel">Mantenimiento (3% del precio / mes)</span>
            <span className="font-semibold">{formatCOP(estimate.maintenanceMonthly)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-steel">Seguro (tu cotización)</span>
            <span className="font-semibold">{formatCOP(estimate.insuranceMonthly)}</span>
          </div>
          {estimate.monthlyTotal !== undefined && (
            <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
              <span className="text-sm font-semibold text-white">Total mensual referencial</span>
              <span className="display text-xl font-bold text-lime">{formatCOP(estimate.monthlyTotal)}</span>
            </div>
          )}
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-200">
              <Info className="size-3.5" /> Supuestos
            </p>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-amber-100/90">
              <li>• Total a pagar en el plazo: {formatCOP(estimate.totalToPay)} (incluye cuota inicial).</li>
              {estimate.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyConsider({ vehicle }: { vehicle: NonNullable<Awaited<ReturnType<typeof vehicleRepository.byId>>> }) {
  const isCar = vehicle.vehicleType === "carro";
  const advantages: string[] = [];
  const limitations: string[] = [];
  const missing: string[] = [];

  if (vehicle.price > 0) advantages.push(`Precio publicado de ${formatCOP(vehicle.price)} en ${vehicle.city}.`);
  if (vehicle.condition === "nuevo") advantages.push("Se ofrece como vehículo nuevo.");
  if (vehicle.mileage <= 20000) advantages.push(`Kilometraje bajo para su año: ${formatMileage(vehicle.mileage)}.`);
  if (vehicle.specs.fuelConsumption) advantages.push(`Declara consumo: ${vehicle.specs.fuelConsumption}.`);
  if (vehicle.specs.transmission === "automatica") advantages.push("Transmisión automática, cómoda para ciudad.");
  if (vehicle.specs.passengerCapacity) advantages.push(`Capacidad declarada de ${vehicle.specs.passengerCapacity} pasajeros.`);
  if (vehicle.specs.safetyFeatures.length > 0) advantages.push(`Seguridad declarada: ${vehicle.specs.safetyFeatures.join(", ")}.`);

  if (vehicle.mileage > 90000) limitations.push(`Kilometraje alto (${formatMileage(vehicle.mileage)}): conviene revisar desgaste de motor, suspensión y frenos.`);
  if (!vehicle.specs.fuelConsumption) limitations.push("No informa consumo de combustible: el gasto mensual no puede estimarse con precisión.");
  if (vehicle.year <= 2019) limitations.push("Modelo con varios años: pregunta por mantenimientos recientes y repuestos.");
  if (!vehicle.specs.enginePower) limitations.push("No informa potencia ni torque en el anuncio.");
  if (isCar && vehicle.specs.doors === 2) limitations.push("Dos puertas: menos accesos traseros para pasajeros frecuentes.");
  if (!isCar && (vehicle.specs.seatHeight ?? 0) > 840) limitations.push("Altura de asiento alta: verifica que alcances el suelo con seguridad.");

  if (!vehicle.specs.enginePower) missing.push("Potencia y torque.");
  if (!vehicle.specs.fuelConsumption) missing.push("Consumo declarado.");
  if (vehicle.imageUrls.length < 3) missing.push("Fotografías adicionales del interior y la carrocería.");
  if (!vehicle.publishedAt) missing.push("Fecha de publicación.");
  missing.push("Historial de servicio y de accidentes, si el vendedor lo posee.");

  return (
    <section className="rounded-2xl border border-white/10 bg-graphite-2/70 p-6">
      <h2 className="display text-2xl font-bold">¿Por qué considerar este vehículo?</h2>
      <p className="mt-2 text-xs leading-relaxed text-steel">
        Este análisis se genera a partir de los datos registrados en la ficha. No afirmamos que el vehículo esté en
        excelente estado, sea seguro o tenga historial limpio: esas condiciones deben verificarse.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-lime/25 bg-lime/5 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-lime">
            <CheckCircle2 className="size-4" /> Ventajas con respaldo en el anuncio
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
            {advantages.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Info className="size-4" /> Limitaciones y aspectos a revisar
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
            {(limitations.length > 0 ? limitations : ["No detectamos limitaciones con los datos disponibles, pero igual conviene revisar el vehículo en persona."]).map(
              (item) => (
                <li key={item}>• {item}</li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <ClipboardCheck className="size-4 text-lime" /> Qué verificar antes de comprar
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
          {vehicle.verificationNotes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Info className="size-4 text-steel" /> Datos faltantes por confirmar
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
          {missing.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function VehicleDetailPage({ vehicleType }: { vehicleType: VehicleType }) {
  const { slug } = useParams();
  const { favorites, compare } = useShop();
  const { push } = useToast();
  const [inquiryOpen, setInquiryOpen] = useState<null | "consulta" | "prueba" | "info">(null);

  const vehicleState = useAsync(() => vehicleRepository.bySlug(slug ?? ""), [slug]);
  const vehicle = vehicleState.data;
  const sellerState = useAsync(
    () => (vehicle ? sellerRepository.byId(vehicle.sellerId) : Promise.resolve(null)),
    [vehicle?.sellerId],
  );
  const seller = sellerState.data ?? null;
  const similarState = useAsync(
    () => (vehicle ? vehicleRepository.similar(vehicle, 6) : Promise.resolve([])),
    [vehicle?.id],
  );

  useDocumentMeta(
    vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year} | ${SITE.name}` : `Vehículo | ${SITE.name}`,
    vehicle
      ? `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year} en ${vehicle.city}. ${formatCOP(vehicle.price)}, ${formatMileage(vehicle.mileage)}.`
      : "Ficha del vehículo.",
    vehicle?.imageUrls[0],
    vehicle ? `/${vehicleType}/${vehicle.slug}` : undefined,
  );

  useEffect(() => {
    if (vehicle && vehicle.vehicleType !== vehicleType) {
      window.location.replace(vehiclePath(vehicle));
    }
  }, [vehicle, vehicleType]);

  if (vehicleState.loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="h-96 rounded-2xl bg-white/8" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded bg-white/10" />
            <div className="h-12 w-1/2 rounded bg-white/10" />
            <div className="h-40 rounded-xl bg-white/8" />
          </div>
        </div>
      </div>
    );
  }

  if (vehicleState.error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState message={vehicleState.error} onRetry={vehicleState.reload} />
      </div>
    );
  }

  if (!vehicle) return <NotFoundPage />;

  const sellerWhatsApp = sellerWhatsAppUrl(seller, vehicle, `${window.location.origin}${vehiclePath(vehicle)}`);
  const favorite = favorites.isFavorite(vehicle.id);
  const inCompare = compare.isInCompare(vehicle.id);

  const onShare = async () => {
    const url = `${window.location.origin}${vehiclePath(vehicle)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${vehicle.brand} ${vehicle.model}`, url });
        return;
      }
    } catch {
      /* el usuario canceló: continuamos con copiar enlace */
    }
    const copied = await copyToClipboard(url);
    push(copied ? "Enlace copiado al portapapeles." : "No fue posible copiar el enlace.", copied ? "success" : "error");
  };

  const specs: Array<{ label: string; value: string }> = [
    { label: "Motor / cilindraje", value: formatDisplacement(vehicle.specs.engineDisplacement) },
    { label: "Potencia", value: vehicle.specs.enginePower ?? "No informado" },
    { label: "Torque", value: vehicle.specs.torque ?? "No informado" },
    { label: "Combustible", value: vehicle.specs.fuelType ? FUEL_LABEL[vehicle.specs.fuelType] : "No informado" },
    { label: "Transmisión", value: vehicle.specs.transmission ? TRANSMISSION_LABEL[vehicle.specs.transmission] : "No informado" },
    { label: "Tracción", value: vehicle.specs.drivetrain ? DRIVETRAIN_LABEL[vehicle.specs.drivetrain] : "No aplica / no informado" },
    { label: "Consumo declarado", value: vehicle.specs.fuelConsumption ?? "No informado" },
    { label: "Pasajeros", value: vehicle.specs.passengerCapacity?.toString() ?? "No informado" },
    { label: "Puertas", value: vehicle.specs.doors?.toString() ?? "No aplica" },
    { label: "Altura de asiento", value: vehicle.specs.seatHeight ? `${vehicle.specs.seatHeight} mm` : "No informado" },
    { label: "Peso", value: vehicle.specs.weight ? `${vehicle.specs.weight} kg` : "No informado" },
    { label: "Refrigeración", value: vehicle.specs.cooling ? (vehicle.specs.cooling === "aire" ? "Aire" : "Líquida") : "No informado" },
    { label: "Color", value: vehicle.specs.color ?? "No informado" },
    {
      label: "Tipo de carrocería",
      value: vehicle.bodyType ?? vehicle.motorcycleCategory ?? "No informado",
    },
  ];

  const inquiryLabels = {
    consulta: { requestType: "consulta-vehiculo" as const, title: "Consultar por este vehículo" },
    prueba: { requestType: "prueba-manejo" as const, title: "Solicitar prueba de manejo" },
    info: { requestType: "informacion-adicional" as const, title: "Pedir información adicional" },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Miga de pan" className="mb-5 flex items-center gap-2 text-xs text-steel">
        <Link to="/" className="transition hover:text-white">
          Inicio
        </Link>
        <span>/</span>
        <Link to={`/${vehicleType === "carro" ? "carros" : "motos"}`} className="transition hover:text-white">
          {vehicleType === "carro" ? "Carros" : "Motos"}
        </Link>
        <span>/</span>
        <span className="text-white/80">
          {vehicle.brand} {vehicle.model}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <Gallery vehicle={vehicle} />

          <section className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <ConditionBadge condition={vehicle.condition} />
              {vehicle.isFeatured && <FeaturedBadge />}
              {vehicle.listingStatus !== "publicado" && (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase text-amber-300">
                  {vehicle.listingStatus}
                </span>
              )}
              {vehicle.publishedAt && (
                <span className="flex items-center gap-1.5 text-xs text-steel">
                  <Calendar className="size-3.5" /> Publicado el {formatDate(vehicle.publishedAt)}
                </span>
              )}
            </div>

            <h1 className="display mt-3 text-4xl font-bold leading-none sm:text-5xl">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-2 text-lg text-white/70">{vehicle.version}</p>

            <div className="mt-5 flex flex-wrap items-end gap-6">
              <div>
                <p className="display text-4xl font-bold text-lime">{formatCOP(vehicle.price)}</p>
                <p className="mt-1 text-xs text-steel">Precio publicado por el vendedor</p>
              </div>
              <div className="flex gap-6 text-sm text-steel">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> {vehicle.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-4" /> {formatMileage(vehicle.mileage)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {vehicle.city}, {vehicle.department}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => setInquiryOpen("consulta")} className="btn-primary">
                <MessageSquareHeart className="size-4" /> Contactar al vendedor
              </button>
              {sellerWhatsApp ? (
                <a href={sellerWhatsApp} target="_blank" rel="noreferrer" className="btn-ghost border-lime/50 text-lime">
                  Preguntar por WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setInquiryOpen("info")}
                  className="btn-ghost"
                  title="El vendedor no tiene número configurado"
                >
                  Sin WhatsApp: usar formulario
                </button>
              )}
              <button type="button" onClick={() => setInquiryOpen("prueba")} className="btn-ghost">
                Solicitar prueba de manejo
              </button>
              <button
                type="button"
                onClick={() => favorites.toggle(vehicle)}
                className={`btn-ghost ${favorite ? "border-lime/60 text-lime" : ""}`}
              >
                <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} /> {favorite ? "Guardado" : "Guardar"}
              </button>
              <button type="button" onClick={() => compare.add(vehicle)} className={`btn-ghost ${inCompare ? "border-lime/60 text-lime" : ""}`}>
                <Scale className="size-4" /> {inCompare ? "En comparación" : "Comparar"}
              </button>
              <button type="button" onClick={onShare} className="btn-ghost">
                <Share2 className="size-4" /> Compartir
              </button>
            </div>

            {!sellerWhatsApp && (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-steel">
                El vendedor no ha publicado su número de WhatsApp, por lo que no mostramos un botón que no funcionaría.
                Usa el formulario de contacto y él recibirá tu consulta. Los números se configuran en el panel
                administrativo.
              </p>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-graphite-2/70 p-6">
            <h2 className="display text-2xl font-bold">Descripción</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">{vehicle.description}</p>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-graphite-2/70 p-6">
            <h2 className="display text-2xl font-bold">Especificaciones</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-steel">{spec.label}</dt>
                  <dd className="text-right text-sm font-semibold text-white">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {vehicle.specs.safetyFeatures.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white">Seguridad declarada</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {vehicle.specs.safetyFeatures.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vehicle.specs.features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white">Equipamiento</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {vehicle.specs.features.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="mt-8">
            <WhyConsider vehicle={vehicle} />
          </div>

          <div className="mt-8">
            <CostCalculator vehicle={vehicle} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="display text-xl font-bold">Vendedor</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="font-semibold text-white">{seller?.name ?? "Vendedor no disponible"}</p>
              {seller && <SellerTypeBadge type={seller.type} />}
              <p className="text-steel">Ubicación: {seller?.city ?? vehicle.city}</p>
              <p className="text-steel">
                Teléfono: {seller?.phone ? seller.phone : "No informado por el vendedor"}
              </p>
              <p className="text-steel">Disponibilidad: {vehicle.listingStatus === "publicado" ? "Anuncio activo" : vehicle.listingStatus}</p>
            </div>

            <div className="mt-5 space-y-2">
              {sellerWhatsApp ? (
                <a href={sellerWhatsApp} target="_blank" rel="noreferrer" className="btn-primary w-full">
                  Escribir por WhatsApp
                </a>
              ) : (
                <button type="button" onClick={() => setInquiryOpen("consulta")} className="btn-primary w-full">
                  Enviar consulta
                </button>
              )}
              <button type="button" onClick={() => setInquiryOpen("prueba")} className="btn-ghost w-full">
                Solicitar prueba de manejo
              </button>
              <button
                type="button"
                onClick={() => favorites.toggle(vehicle)}
                className={`btn-ghost w-full ${favorite ? "border-lime/60 text-lime" : ""}`}
              >
                <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
                {favorite ? "Guardado en favoritos" : "Guardar en favoritos"}
              </button>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-steel">
              Condiciones, disponibilidad y precio deben confirmarse directamente con el vendedor antes de realizar
              cualquier pago.
            </p>
          </div>

          <div className="card mt-5 p-6">
            <h2 className="display text-xl font-bold">Compartir</h2>
            <button type="button" onClick={onShare} className="btn-ghost mt-4 w-full">
              <Copy className="size-4" /> Copiar enlace de la ficha
            </button>
          </div>
        </aside>
      </div>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">También te puede interesar</p>
            <h2 className="section-title">Vehículos similares</h2>
          </div>
          <Link to={`/${vehicleType === "carro" ? "carros" : "motos"}`} className="btn-ghost">
            Ver catálogo <ArrowRight className="size-4" />
          </Link>
        </div>
        {similarState.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-2xl bg-white/8" />
            ))}
          </div>
        ) : (
          <VehicleCarousel vehicles={similarState.data ?? []} />
        )}
      </section>

      <Modal
        open={inquiryOpen !== null}
        onClose={() => setInquiryOpen(null)}
        title={inquiryOpen ? inquiryLabels[inquiryOpen].title : ""}
        wide
      >
        <p className="mb-4 text-sm text-steel">
          Al enviar tu solicitud quedará registrada con fecha, vehículo y tipo de consulta para darle seguimiento.
        </p>
        <ContactForm
          defaultRequestType={inquiryOpen ? inquiryLabels[inquiryOpen].requestType : "consulta-vehiculo"}
          source={inquiryOpen === "prueba" ? "prueba-manejo" : "ficha-vehiculo"}
          vehicleId={vehicle.id}
          vehicleLabel={`${vehicle.brand} ${vehicle.model} ${vehicle.version} (${vehicle.year})`}
          compact
        />
        <button type="button" onClick={() => setInquiryOpen(null)} className="btn-ghost mt-4 w-full">
          <ArrowLeft className="size-4" /> Volver a la ficha
        </button>
      </Modal>

      {isDemoMode && (
        <p className="mt-10 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-200">
          {SITE.demoNotice}
        </p>
      )}
    </div>
  );
}
