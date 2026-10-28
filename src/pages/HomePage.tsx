import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Compass, Gauge, MapPin, Route, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { LIFESTYLES } from "@/data/lifestyles";
import { ARTICLES } from "@/data/articles";
import { vehicleRepository } from "@/repositories";
import { useAsync } from "@/components/ui/feedback";
import { SectionHeading, ImageWithFallback } from "@/components/ui/primitives";
import VehicleCarousel from "@/components/vehicles/VehicleCarousel";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";
import { formatCOP } from "@/utils/format";
import type { LifestyleIcon } from "@/data/lifestyles";
import type { Vehicle, VehicleType } from "@/types/vehicle";

const ICONS: Record<LifestyleIcon, typeof Gauge> = {
  key: Sparkles,
  graduation: Users,
  briefcase: Route,
  family: Users,
  store: Compass,
  route: MapPin,
  gauge: Gauge,
  fuel: Wallet,
  package: Compass,
  mountain: ShieldCheck,
};

const PRICE_STEPS = [30000000, 60000000, 100000000, 160000000, 250000000];

/** Etiqueta justificada: solo se aplica cuando hay datos suficientes en el catálogo. */
function priceOpportunities(vehicles: Vehicle[]): Array<{ vehicle: Vehicle; note: string }> {
  const groups = new Map<string, Vehicle[]>();
  vehicles.forEach((vehicle) => {
    const key = `${vehicle.vehicleType}-${vehicle.bodyType ?? vehicle.motorcycleCategory ?? "general"}`;
    const list = groups.get(key) ?? [];
    list.push(vehicle);
    groups.set(key, list);
  });

  const results: Array<{ vehicle: Vehicle; note: string }> = [];
  groups.forEach((list) => {
    if (list.length < 4) return;
    const prices = list.map((vehicle) => vehicle.price).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    list.forEach((vehicle) => {
      if (vehicle.price <= median * 0.88) {
        results.push({
          vehicle,
          note: `Por debajo de la mediana de ${formatCOP(median)} en su grupo (${list.length} vehículos publicados en el catálogo).`,
        });
      }
    });
  });

  return results.sort((a, b) => a.vehicle.price - b.vehicle.price).slice(0, 4);
}

function QuickSearch() {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState<VehicleType>("carro");
  const [brand, setBrand] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [city, setCity] = useState("");

  const facetsState = useAsync(() => vehicleRepository.facets(vehicleType), [vehicleType]);
  const facets = facetsState.data ?? { brands: [], models: [], cities: [] };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.set("brands", brand);
    if (priceMax) params.set("priceMax", priceMax);
    if (city) params.set("cities", city);
    navigate(`/${vehicleType === "carro" ? "carros" : "motos"}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-white/10 bg-graphite/85 p-4 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5"
    >
      <div>
        <label htmlFor="quick-type" className="label">
          Tipo de vehículo
        </label>
        <select id="quick-type" value={vehicleType} onChange={(event) => setVehicleType(event.target.value as VehicleType)} className="field">
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>
      </div>
      <div>
        <label htmlFor="quick-brand" className="label">
          Marca
        </label>
        <select id="quick-brand" value={brand} onChange={(event) => setBrand(event.target.value)} className="field">
          <option value="">Todas</option>
          {facets.brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="quick-price" className="label">
          Presupuesto máximo
        </label>
        <select
          id="quick-price"
          value={priceMax}
          onChange={(event) => setPriceMax(event.target.value)}
          className="field"
        >
          <option value="">Sin límite</option>
          {PRICE_STEPS.map((value) => (
            <option key={value} value={value}>
              Hasta {formatCOP(value)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="quick-city" className="label">
          Ciudad
        </label>
        <select id="quick-city" value={city} onChange={(event) => setCity(event.target.value)} className="field">
          <option value="">Todas</option>
          {facets.cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full">
          Buscar vehículos
        </button>
      </div>
    </form>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const featuredState = useAsync(() => vehicleRepository.featured(10), []);
  const allState = useAsync(() => vehicleRepository.list({ ...emptyFilters(), sort: "precio-asc", page: 1 }, 400), []);

  const opportunities = useMemo(() => priceOpportunities(allState.data?.items ?? []), [allState.data]);
  const featured = featuredState.data ?? [];

  useDocumentMeta(
    `${SITE.name} | Tu próximo vehículo empieza aquí`,
    "Encuentra el carro o la moto que encaja con tu presupuesto, tu estilo de vida y tus próximos planes. Catálogo, comparador y recomendaciones personalizadas.",
    "/images/og-cover.jpg",
  );

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/images/hero-car.jpg"
            alt="Vehículo deportivo en carretera al atardecer"
            className="h-full w-full object-cover object-center"
            loading="eager"
            fallbackLabel=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/85 to-graphite/40" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-graphite to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lime">
              <span className="size-1.5 rounded-full bg-lime" />
              Marketplace de carros y motos en Colombia
            </p>
            <h1 className="display text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              Tu próximo vehículo
              <br />
              empieza aquí.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Encuentra el carro o la moto que encaja con tu presupuesto, tu estilo de vida y tus próximos planes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/carros" className="btn-primary">
                Explorar carros <ArrowRight className="size-4" />
              </Link>
              <Link to="/motos" className="btn-ghost">
                Explorar motos
              </Link>
              <Link to="/encontrar" className="btn-ghost border-lime/50 text-lime">
                Encontrar mi vehículo ideal
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <QuickSearch />
          </div>
        </div>
      </section>

      {/* --------------------------- DESTACADOS --------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Selección editorial"
          title="Vehículos destacados"
          description="Una curaduría de anuncios que merecen un vistazo: equipamiento, kilometraje y contexto declarados por sus vendedores."
          action={
            <Link to="/carros" className="btn-ghost">
              Ver catálogo completo
            </Link>
          }
        />
        <VehicleCarousel vehicles={featured} loading={featuredState.loading} />
      </section>

      {/* ---------------------------- CATEGORÍAS ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explora por estilo"
          title="Explorar por categoría"
          description="Cada tipo de vehículo responde a un uso distinto. Elige el que más se acerque a lo que buscas."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/${category.vehicleType === "carro" ? "carros" : "motos"}?${
                category.bodyType
                  ? `bodyTypes=${category.bodyType}`
                  : `motorcycleCategories=${category.motorcycleCategory}`
              }`}
              className="group relative overflow-hidden rounded-2xl border border-white/8"
            >
              <ImageWithFallback
                src={category.image}
                alt={category.label}
                className="h-40 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-44"
                fallbackLabel={category.label}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="display text-lg font-bold text-white transition group-hover:text-lime">{category.label}</p>
                <p className="mt-1 text-xs text-white/70">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------- ENCUENTRA TU VEHÍCULO --------------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/images/section-finder.jpg"
            alt="Conduciendo en carretera"
            className="h-full w-full object-cover"
            fallbackLabel=""
          />
          <div className="absolute inset-0 bg-graphite/80" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime">Asistente de compra</p>
            <h2 className="display text-4xl font-bold leading-none sm:text-5xl">
              No compres cualquier vehículo.
              <br />
              Encuentra el que realmente necesitas.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Responde unas preguntas sobre tu presupuesto, tu uso diario y lo que no puedes negociar. El asistente
              evalúa el catálogo real y te explica por qué cada opción aparece entre las recomendadas.
            </p>
          </div>
          <button type="button" onClick={() => navigate("/encontrar")} className="btn-primary !px-7 !py-3.5 text-base">
            Descubrir mi vehículo ideal <ArrowRight className="size-5" />
          </button>
        </div>
      </section>

      {/* -------------------------- OPORTUNIDADES -------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Precio atractivo"
          title="Oportunidades destacadas"
          description="Vehículos cuyo precio queda por debajo de la mediana de su mismo grupo dentro de este catálogo de demostración. No afirmamos que sean la mejor oferta del mercado: es una comparación interna y verificable."
        />
        {opportunities.length === 0 ? (
          <p className="text-sm text-steel">
            Todavía no hay suficientes anuncios por grupo para calcular comparaciones de precio. Se habilitarán a medida
            que el catálogo crezca.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {opportunities.map(({ vehicle, note }) => (
              <article key={vehicle.id} className="card flex flex-col overflow-hidden">
                <ImageWithFallback
                  src={vehicle.imageUrls[0]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-44 w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-base font-semibold leading-tight">
                    <Link to={`/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`} className="transition hover:text-lime">
                      {vehicle.brand} {vehicle.model} {vehicle.version}
                    </Link>
                  </h3>
                  <p className="display text-2xl font-bold text-lime">{formatCOP(vehicle.price)}</p>
                  <p className="text-xs leading-relaxed text-steel">{note}</p>
                  <Link
                    to={`/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`}
                    className="btn-ghost mt-auto !py-2 text-xs"
                  >
                    Ver vehículo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------ ESTILO DE VIDA ------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Porque no todos necesitan lo mismo"
          title="Selección según tu estilo de vida"
          description="Elige el escenario que más se parece al tuyo y recibe recomendaciones basadas en necesidades reales, no en estereotipos."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {LIFESTYLES.map((lifestyle) => {
            const Icon = ICONS[lifestyle.icon];
            return (
              <button
                key={lifestyle.id}
                type="button"
                onClick={() => navigate(`/encontrar?use=${lifestyle.id}`)}
                className="group flex flex-col gap-3 rounded-2xl border border-white/8 bg-graphite-2/60 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-lime/50"
              >
                <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lime transition group-hover:bg-lime group-hover:text-graphite">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-white">{lifestyle.label}</span>
                <span className="text-xs leading-relaxed text-steel">{lifestyle.description}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-lime">
                  Ver recomendaciones <ArrowRight className="size-3" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* --------------------------- COMPARADOR --------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-12">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime">Decide con datos</p>
            <h2 className="section-title">Compara hasta tres vehículos lado a lado</h2>
            <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
              Agrega vehículos desde cualquier tarjeta y revisa precio, año, kilometraje, motor, transmisión, consumo
              declarado, costos estimados y el perfil de comprador recomendado. Los datos que no existen se muestran
              como «No informado»: no rellenamos huecos con supuestos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/comparar" className="btn-primary">
                Abrir comparador
              </Link>
              <Link to="/carros" className="btn-ghost">
                Elegir vehículos
              </Link>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              "Solo permite comparar vehículos del mismo tipo para que la comparación sea coherente.",
              "Resalta las diferencias relevantes en lugar de listar datos sin contexto.",
              "Explica en lenguaje simple qué opción conviene según tus prioridades.",
              "Permite intercambiar, quitar y abrir cada ficha completa.",
            ].map((item) => (
              <li key={item} className="flex gap-3 rounded-xl border border-white/8 bg-white/5 p-4 text-sm text-white/85">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-lime" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------- CONFIANZA ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading align="center" eyebrow="Cómo trabajamos" title="Información clara, decisiones mejores" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { title: "Información transparente", text: "Cada ficha separa lo declarado por el vendedor de lo que aún falta confirmar." },
            { title: "Contacto directo", text: "Hablas con quien publica el anuncio, sin intermediarios inventados." },
            { title: "Fichas completas", text: "Especificaciones, costos estimados, qué revisar y vehículos similares." },
            { title: "Orientación para compradores", text: "Guías prácticas para evaluar usados, costos y documentación en Colombia." },
            { title: "Recomendaciones personalizadas", text: "Un asistente que puntuaje el catálogo según tus respuestas y te explica el porqué." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-graphite-2/60 p-6">
              <div className="mb-3 h-1 w-10 rounded-full bg-lime" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-steel">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-steel">
          Aún no ofrecemos inspecciones, garantías ni certificaciones: cuando existan, aparecerán documentadas aquí.
        </p>
      </section>

      {/* ------------------------------ GUÍAS ------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contenido útil"
          title="Guías y consejos"
          description="Lecturas breves para comprar con criterio: qué revisar, qué documentos pedir y cómo comparar costos reales."
          action={
            <Link to="/guias" className="btn-ghost">
              Ver todas las guías
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.slice(0, 3).map((article) => (
            <Link key={article.slug} to={`/guias/${article.slug}`} className="group overflow-hidden rounded-2xl border border-white/8 bg-graphite-2/60 transition hover:border-lime/40">
              <ImageWithFallback src={article.cover} alt={article.title} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-5">
                <p className="text-xs text-steel">{article.readingMinutes} min de lectura</p>
                <h3 className="mt-2 text-base font-semibold leading-snug transition group-hover:text-lime">{article.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-steel">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function emptyFilters() {
  return {
    q: "",
    brands: [],
    models: [],
    conditions: [],
    cities: [],
    sellerTypes: [],
    bodyTypes: [],
    motorcycleCategories: [],
    fuelTypes: [],
    transmissions: [],
    drivetrains: [],
    coolings: [],
    statuses: ["publicado" as const],
    sort: "recientes" as const,
    page: 1,
  };
}
