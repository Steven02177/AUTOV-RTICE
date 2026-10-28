import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { vehicleRepository } from "@/repositories";
import { createDefaultFilters } from "@/utils/filters";
import { useAsync } from "@/components/ui/feedback";
import FinderWizard from "@/components/recommendations/FinderWizard";
import { LIFESTYLES, getLifestyle } from "@/data/lifestyles";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";
import type { LifestyleId } from "@/types/vehicle";

export default function FinderPage() {
  const [params] = useSearchParams();
  const useParam = params.get("use") as LifestyleId | null;
  const lifestyle = getLifestyle(useParam ?? undefined);

  const poolState = useAsync(() => vehicleRepository.list(createDefaultFilters(), 500), []);
  const pool = useMemo(() => poolState.data?.items ?? [], [poolState.data]);

  useDocumentMeta(
    `Encuentra tu vehículo ideal | ${SITE.name}`,
    "Responde unas preguntas y recibe recomendaciones personalizadas del catálogo con explicación de cada coincidencia.",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
          <Link to="/" className="transition hover:text-white">
            Inicio
          </Link>{" "}
          / Encuentra tu vehículo
        </nav>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime">Asistente de compra</p>
        <h1 className="section-title">Encuentra el vehículo que realmente necesitas</h1>
        <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
          Diez preguntas breves, sin registro. El asistente evalúa el catálogo publicado y te explica con qué datos
          cada vehículo ganó su puntaje, qué conviene verificar y qué alternativas existen.
        </p>
        {lifestyle && (
          <p className="mt-4 rounded-xl border border-lime/40 bg-lime/10 p-3 text-sm text-lime">
            Partimos de tu perfil: <strong>{lifestyle.label}</strong>. Puedes cambiarlo dentro del asistente.
          </p>
        )}
      </header>

      <FinderWizard key={useParam ?? "default"} pool={pool} initialUse={useParam ?? undefined} />

      {poolState.loading && (
        <p className="mt-6 text-center text-sm text-steel">Cargando catálogo para evaluar tus respuestas...</p>
      )}

      <section className="mt-14">
        <h2 className="display text-2xl font-bold">O empieza por tu caso de uso</h2>
        <p className="mt-2 max-w-2xl text-sm text-steel">
          Cada perfil precarga las respuestas más habituales; luego puedes ajustarlas libremente dentro del asistente.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LIFESTYLES.map((item) => (
            <Link
              key={item.id}
              to={`/encontrar?use=${item.id}`}
              className="rounded-2xl border border-white/8 bg-graphite-2/60 p-4 text-sm font-semibold text-white/85 transition hover:border-lime/50 hover:text-lime"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
