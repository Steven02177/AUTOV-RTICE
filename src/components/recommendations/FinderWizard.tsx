import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gauge,
  MessageSquareHeart,
  RefreshCcw,
  Route,
  Scale,
  Sparkles,
  X,
} from "lucide-react";
import type { Condition, LifestyleId, RecommendationAnswer, Recommendation, Vehicle, VehicleType } from "@/types/vehicle";
import { LIFESTYLES } from "@/data/lifestyles";
import { recommend } from "@/services/recommendations";
import { useShop } from "@/context/ShopContext";
import { useToast, EmptyState } from "@/components/ui/feedback";
import { ImageWithFallback } from "@/components/ui/primitives";
import { formatCOP, formatMileage } from "@/utils/format";
import { sellerWhatsAppUrl } from "@/services/whatsapp";
import { getSellerSync } from "@/repositories/demoStore";
import ContactForm from "@/components/forms/ContactForm";

type QuestionId =
  | "vehicleType"
  | "budget"
  | "condition"
  | "mainUse"
  | "passengers"
  | "terrain"
  | "runningCostImportance"
  | "transmission"
  | "favoriteBrands"
  | "mustHaves";

const QUESTIONS: Array<{ id: QuestionId; title: string; help?: string }> = [
  { id: "vehicleType", title: "¿Buscas un carro o una moto?", help: "Define el universo de opciones desde el inicio." },
  { id: "budget", title: "¿Cuál es tu presupuesto máximo en pesos colombianos?", help: "Puedes omitirlo y ver opciones abiertas." },
  { id: "condition", title: "¿Lo quieres nuevo o usado?" },
  { id: "mainUse", title: "¿Para qué lo necesitas principalmente?" },
  { id: "passengers", title: "¿Cuántas personas lo utilizarán habitualmente?" },
  { id: "terrain", title: "¿Lo utilizarás más en ciudad, carretera o terrenos difíciles?" },
  { id: "runningCostImportance", title: "¿Qué importancia tienen el consumo de combustible y el mantenimiento?" },
  { id: "transmission", title: "¿Prefieres transmisión automática o mecánica?" },
  { id: "favoriteBrands", title: "¿Tienes marcas favoritas?", help: "Opcional: puedes dejar varias en blanco." },
  { id: "mustHaves", title: "¿Qué características son indispensables para ti?" },
];

const BUDGET_OPTIONS = [8000000, 15000000, 30000000, 60000000, 100000000, 160000000, 250000000];
const BRAND_SUGGESTIONS = ["Toyota", "Renault", "Chevrolet", "Kia", "Mazda", "Yamaha", "Honda", "Bajaj", "Kawasaki"];

function OptionButton({
  label,
  active,
  onClick,
  subtitle,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
        active ? "border-lime bg-lime/15 text-white" : "border-white/12 bg-white/5 text-white/80 hover:border-white/30"
      }`}
    >
      <span>
        <span className="font-semibold">{label}</span>
        {subtitle && <span className="mt-0.5 block text-xs text-steel">{subtitle}</span>}
      </span>
      {active && <Check className="size-4 shrink-0 text-lime" />}
    </button>
  );
}

function RecommendationCard({
  item,
  index,
  onContact,
}: {
  item: Recommendation;
  index: number;
  onContact: (vehicleId: string) => void;
}) {
  const { compare } = useShop();
  const vehicle = item.vehicle;
  const path = `/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`;

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/8 p-5 sm:flex-row sm:items-center">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#C6F36B"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(item.percentage / 100) * 264} 264`}
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="display text-xl font-bold text-lime">{item.percentage}%</span>
            <span className="text-[9px] uppercase tracking-wider text-steel">compatibilidad</span>
          </span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-lime">
            {index === 0 ? "Mejor coincidencia" : `Opción ${index + 1}`}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {vehicle.brand} {vehicle.model} <span className="text-white/70">{vehicle.version}</span>
          </h3>
          <p className="mt-1 text-sm text-steel">
            {vehicle.year} · {formatMileage(vehicle.mileage)} · {vehicle.city}
          </p>
          <p className="display mt-2 text-2xl font-bold">{formatCOP(vehicle.price)}</p>
        </div>
        <ImageWithFallback src={vehicle.imageUrls[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="h-28 w-full rounded-xl object-cover sm:w-44" />
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-3">
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lime">
            <Sparkles className="size-3.5" /> Por qué aparece
          </h4>
          <ul className="space-y-2 text-xs leading-relaxed text-white/80">
            {item.reasons.length > 0 ? item.reasons.map((reason) => <li key={reason}>• {reason}</li>) : <li>• Coincide parcialmente con tus respuestas.</li>}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <X className="size-3.5" /> A tener en cuenta
          </h4>
          <ul className="space-y-2 text-xs leading-relaxed text-white/80">
            {item.drawbacks.length > 0 ? item.drawbacks.map((drawback) => <li key={drawback}>• {drawback}</li>) : <li>• No detectamos objeciones con tus respuestas actuales.</li>}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            <Gauge className="size-3.5" /> Verificar antes de comprar
          </h4>
          <ul className="space-y-2 text-xs leading-relaxed text-white/80">
            {item.verify.length > 0 ? item.verify.map((note) => <li key={note}>• {note}</li>) : <li>• Revisa documentos, historial y estado real del vehículo.</li>}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/8 p-5">
        <Link to={path} className="btn-primary !py-2 text-xs">
          Ver ficha completa
        </Link>
        <button type="button" onClick={() => compare.add(vehicle)} className="btn-ghost !py-2 text-xs">
          <Scale className="size-3.5" /> Comparar
        </button>
        <button type="button" onClick={() => onContact(vehicle.id)} className="btn-ghost !py-2 text-xs">
          <MessageSquareHeart className="size-3.5" /> Contactar al vendedor
        </button>
      </div>
    </article>
  );
}

export default function FinderWizard({
  pool,
  initialUse,
}: {
  pool: Vehicle[];
  initialUse?: LifestyleId;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RecommendationAnswer>({ favoriteBrands: [], mustHaves: [], mainUse: initialUse });
  const [showResults, setShowResults] = useState(false);
  const [contactVehicle, setContactVehicle] = useState<string | null>(null);
  const { compare } = useShop();
  const { push } = useToast();

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const setAnswer = <K extends keyof RecommendationAnswer>(key: K, value: RecommendationAnswer[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const result = useMemo(() => recommend(pool, answers, 3), [pool, answers, showResults]);

  const goNext = () => {
    if (isLast) setShowResults(true);
    else setStep((value) => value + 1);
  };
  const goBack = () => setStep((value) => Math.max(value - 1, 0));

  const toggleMulti = (key: "favoriteBrands" | "mustHaves", value: string) => {
    const current = answers[key];
    setAnswer(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const onContact = (vehicleId: string) => {
    setContactVehicle(vehicleId);
    window.setTimeout(() => document.getElementById("finder-contact")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const contactVehicleData = pool.find((vehicle) => vehicle.id === contactVehicle);

  if (pool.length === 0) {
    return (
      <EmptyState
        title="Cargando catálogo"
        description="Espera un momento mientras cargan los vehículos disponibles para evaluar."
      />
    );
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="display text-3xl font-bold">Tus recomendaciones</h2>
            <p className="mt-2 max-w-2xl text-sm text-steel">
              El sistema puntuó {result.scoredCount} anuncios publicados con tus respuestas. El porcentaje refleja cuántos
              criterios cumplen los datos del anuncio: no es una garantía de que el vehículo sea ideal para ti.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowResults(false);
              setStep(0);
            }}
            className="btn-ghost"
          >
            <RefreshCcw className="size-4" /> Ajustar criterios
          </button>
        </div>

        {result.limitingFactors.length > 0 && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-200">
            <p className="font-semibold">Estos criterios están limitando la búsqueda:</p>
            <ul className="mt-2 space-y-1">
              {result.limitingFactors.map((factor) => (
                <li key={factor}>• {factor}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs">
              Puedes ampliar el presupuesto, cambiar la condición o la transmisión para ver más opciones.
            </p>
          </div>
        )}

        {result.results.length === 0 ? (
          <EmptyState
            title="Sin coincidencias suficientes"
            description="Con los criterios actuales no encontramos vehículos publicados que cumplan tus requisitos. Ajusta el presupuesto o el tipo de vehículo para ampliar las opciones."
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowResults(false);
                  setStep(0);
                }}
              >
                Modificar respuestas
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            {result.results.map((item, index) => (
              <RecommendationCard key={item.vehicle.id} item={item} index={index} onContact={onContact} />
            ))}
          </div>
        )}

        {result.budgetAlternatives.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="display text-xl font-bold text-lime">Alternativas si puedes estirar el presupuesto</h3>
            <p className="mt-2 text-sm text-steel">
              Estos vehículos superan el tope que indicaste pero están entre los más cercanos publicados.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {result.budgetAlternatives.map((vehicle) => (
                <li key={vehicle.id} className="rounded-xl border border-white/10 bg-graphite-2/60 p-4">
                  <p className="text-sm font-semibold text-white">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="mt-1 text-xs text-steel">
                    {vehicle.year} · {formatMileage(vehicle.mileage)}
                  </p>
                  <p className="display mt-2 text-lg font-bold text-lime">{formatCOP(vehicle.price)}</p>
                  <Link
                    to={`/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`}
                    className="mt-3 inline-block text-xs font-semibold text-lime underline underline-offset-4"
                  >
                    Ver ficha
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {contactVehicleData && (
          <section id="finder-contact" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="display text-xl font-bold">
              Contactar al vendedor de {contactVehicleData.brand} {contactVehicleData.model}
            </h3>
            {(() => {
              const seller = getSellerSync(contactVehicleData.sellerId);
              const url = sellerWhatsAppUrl(seller, contactVehicleData, `${window.location.origin}/encontrar`);
              if (url) {
                return (
                  <a href={url} target="_blank" rel="noreferrer" className="btn-primary mt-4 inline-flex">
                    Escribir por WhatsApp
                  </a>
                );
              }
              return (
                <p className="mt-2 text-sm text-steel">
                  El vendedor no tiene un número de WhatsApp configurado, así que puedes dejar tus datos y él te
                  contactará.
                </p>
              );
            })()}
            <div className="mt-5 max-w-xl">
              <ContactForm
                defaultRequestType="consulta-vehiculo"
                source="ficha-vehiculo"
                vehicleId={contactVehicleData.id}
                vehicleLabel={`${contactVehicleData.brand} ${contactVehicleData.model} ${contactVehicleData.version} (${contactVehicleData.year})`}
                compact
              />
            </div>
          </section>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-xs leading-relaxed text-steel">
          <p className="font-semibold text-white">Cómo calculamos el puntaje</p>
          <p className="mt-2">
            Presupuesto (30), tipo de vehículo (15), condición (10), uso principal (20), capacidad (8), terreno (12),
            costos de uso (12), transmisión (8), marcas favoritas (5) y características indispensables (10). Cada punto
            se asigna solo cuando el anuncio contiene el dato que lo respalda.
          </p>
          <p className="mt-2">
            Respuestas guardadas durante esta sesión: {answers.vehicleType ?? "sin especificar"} ·{" "}
            {answers.budget ? formatCOP(answers.budget) : "presupuesto libre"} ·{" "}
            {answers.condition ?? "nueva o usado"} · {answers.transmission ?? "cualquier transmisión"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-lime">
          Paso {step + 1} de {QUESTIONS.length}
        </p>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-lime transition-all duration-300"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="display text-3xl font-bold leading-tight">{question.title}</h2>
      {question.help && <p className="mt-2 text-sm text-steel">{question.help}</p>}

      <div className="mt-6 space-y-3">
        {question.id === "vehicleType" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(["carro", "moto"] as VehicleType[]).map((type) => (
              <OptionButton
                key={type}
                label={type === "carro" ? "Carro" : "Moto"}
                active={answers.vehicleType === type}
                subtitle={type === "carro" ? "Familia, ciudad, carretera o carga" : "Urbana, deportiva, touring o trabajo"}
                onClick={() => setAnswer("vehicleType", type)}
              />
            ))}
          </div>
        )}

        {question.id === "budget" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {BUDGET_OPTIONS.map((value) => (
              <OptionButton
                key={value}
                label={`Hasta ${formatCOP(value)}`}
                active={answers.budget === value}
                onClick={() => setAnswer("budget", value)}
              />
            ))}
            <OptionButton
              label="Sin presupuesto definido"
              active={answers.budget === undefined}
              onClick={() => setAnswer("budget", undefined)}
            />
          </div>
        )}

        {question.id === "condition" && (
          <div className="grid gap-3 sm:grid-cols-3">
            {(["nuevo", "usado", "indiferente"] as Array<Condition | "indiferente">).map((value) => (
              <OptionButton
                key={value}
                label={value === "indiferente" ? "Me da igual" : value === "nuevo" ? "Nuevo" : "Usado"}
                active={(answers.condition ?? "indiferente") === value}
                onClick={() => setAnswer("condition", value === "indiferente" ? undefined : (value as Condition))}
              />
            ))}
          </div>
        )}

        {question.id === "mainUse" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {LIFESTYLES.map((lifestyle) => (
              <OptionButton
                key={lifestyle.id}
                label={lifestyle.label}
                subtitle={lifestyle.description}
                active={answers.mainUse === lifestyle.id}
                onClick={() => setAnswer("mainUse", lifestyle.id)}
              />
            ))}
          </div>
        )}

        {question.id === "passengers" && (
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <OptionButton
                key={value}
                label={`${value}${value === 7 ? "+" : ""}`}
                active={answers.passengers === value}
                onClick={() => setAnswer("passengers", value)}
              />
            ))}
          </div>
        )}

        {question.id === "terrain" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: "ciudad", label: "Ciudad", subtitle: "Tráfico, estacionamiento corto" },
              { id: "carretera", label: "Carretera", subtitle: "Rutas largas y mayor velocidad" },
              { id: "mixto", label: "Uso mixto", subtitle: "Ciudad y carretera por partes" },
              { id: "terrenos-dificiles", label: "Terrenos difíciles", subtitle: "Tierra, subidas y caminos malos" },
            ].map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                subtitle={option.subtitle}
                active={answers.terrain === option.id}
                onClick={() => setAnswer("terrain", option.id as RecommendationAnswer["terrain"])}
              />
            ))}
          </div>
        )}

        {question.id === "runningCostImportance" && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "alta", label: "Alta", subtitle: "Es una prioridad para mí" },
              { id: "media", label: "Media", subtitle: "Lo considero si hay alternativas" },
              { id: "baja", label: "Baja", subtitle: "Prefiero prestaciones" },
            ].map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                subtitle={option.subtitle}
                active={answers.runningCostImportance === option.id}
                onClick={() => setAnswer("runningCostImportance", option.id as RecommendationAnswer["runningCostImportance"])}
              />
            ))}
          </div>
        )}

        {question.id === "transmission" && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "automatica", label: "Automática", subtitle: "Confort en ciudad" },
              { id: "manual", label: "Mecánica", subtitle: "Control y menor costo" },
              { id: "indiferente", label: "Me da igual" },
            ].map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                subtitle={option.subtitle}
                active={(answers.transmission ?? "indiferente") === option.id}
                onClick={() =>
                  setAnswer("transmission", option.id === "indiferente" ? undefined : (option.id as RecommendationAnswer["transmission"]))
                }
              />
            ))}
          </div>
        )}

        {question.id === "favoriteBrands" && (
          <div className="flex flex-wrap gap-2">
            {BRAND_SUGGESTIONS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => toggleMulti("favoriteBrands", brand)}
                aria-pressed={answers.favoriteBrands.includes(brand)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  answers.favoriteBrands.includes(brand)
                    ? "border-lime bg-lime/15 text-lime"
                    : "border-white/12 bg-white/5 text-white/75 hover:border-white/30"
                }`}
              >
                {brand}
              </button>
            ))}
            {answers.favoriteBrands.length > 0 && (
              <p className="w-full text-xs text-steel">Marcas seleccionadas: {answers.favoriteBrands.join(", ")}</p>
            )}
          </div>
        )}

        {question.id === "mustHaves" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["aire acondicionado", "abs", "cámara", "automatica", "manual", "suv", "pickup", "scooter", "doble propósito", "diesel", "cuero", "bluetooth"].map(
                (needle) => (
                  <button
                    key={needle}
                    type="button"
                    onClick={() => toggleMulti("mustHaves", needle)}
                    aria-pressed={answers.mustHaves.includes(needle)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      answers.mustHaves.includes(needle)
                        ? "border-lime bg-lime/15 text-lime"
                        : "border-white/12 bg-white/5 text-white/75 hover:border-white/30"
                    }`}
                  >
                    {needle}
                  </button>
                ),
              )}
            </div>
            <label className="block">
              <span className="label">O escribe tu propia característica</span>
              <input
                type="text"
                className="field"
                placeholder="Ej: techo panorámico"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    const value = event.currentTarget.value.trim();
                    if (value && !answers.mustHaves.includes(value)) {
                      toggleMulti("mustHaves", value);
                      event.currentTarget.value = "";
                    }
                  }
                }}
              />
              <span className="mt-1 block text-xs text-steel">Presiona Enter para agregar.</span>
            </label>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" onClick={goBack} disabled={step === 0} className="btn-ghost disabled:opacity-40">
          <ArrowLeft className="size-4" /> Atrás
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAnswer(question.id, undefined);
              goNext();
            }}
            className="text-xs font-semibold text-steel underline underline-offset-4 transition hover:text-white"
          >
            Omitir esta pregunta
          </button>
          <button type="button" onClick={goNext} className="btn-primary">
            {isLast ? (
              <>
                <Route className="size-4" /> Ver recomendaciones
              </>
            ) : (
              <>
                Continuar <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {answers.favoriteBrands.length > 0 && question.id !== "favoriteBrands" && (
        <p className="mt-4 text-xs text-steel">Marcas favoritas: {answers.favoriteBrands.join(", ")}</p>
      )}
      <p className="mt-4 text-xs text-steel">
        Tus respuestas se conservan mientras ajustas los criterios: puedes retroceder sin perder lo que ya respondiste.
        {compare.ids.length > 0 && ` En tu comparación hay ${compare.ids.length} vehículo(s).`}
      </p>
      <button
        type="button"
        onClick={() => push("Respuestas conservadas. Puedes seguir ajustando los criterios.", "info")}
        className="sr-only"
      >
        Guardar respuestas
      </button>
    </div>
  );
}
