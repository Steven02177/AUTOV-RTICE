import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import type { VehicleFilters, VehicleType } from "@/types/vehicle";
import { vehicleRepository } from "@/repositories";
import { createDefaultFilters, filtersToSearchParams, searchParamsToFilters } from "@/utils/filters";
import { useAsync, ErrorState, VehicleGridSkeleton, EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/primitives";
import FilterPanel, { MobileFilterButton } from "@/components/filters/FilterPanel";
import ActiveFilters, { SortSelect } from "@/components/filters/ActiveFilters";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";

const PAGE_SIZE = 9;

export default function CatalogPage({ vehicleType }: { vehicleType: VehicleType }) {
  const [params, setParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(
    () => searchParamsToFilters(params, vehicleType),
    [params, vehicleType],
  );
  const filterKey = params.toString();

  useDocumentMeta(
    `${vehicleType === "carro" ? "Carros" : "Motos"} en venta | ${SITE.name}`,
    `Catálogo de ${vehicleType === "carro" ? "carros" : "motos"} nuevos y usados en Colombia con filtros avanzados de precio, año, kilometraje y características.`,
  );

  const facetsState = useAsync(() => vehicleRepository.facets(vehicleType), [vehicleType]);
  const resultState = useAsync(
    () => vehicleRepository.list(filters, PAGE_SIZE),
    [filterKey, vehicleType],
  );

  const updateFilters = (next: VehicleFilters) => {
    setParams(filtersToSearchParams(next));
  };

  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [filterKey]);

  const title = vehicleType === "carro" ? "Carros en venta" : "Motos en venta";
  const description =
    vehicleType === "carro"
      ? "Explora sedanes, hatchbacks, SUV, pick-ups y vehículos familiares. Combina los filtros hasta encontrar la opción que encaja contigo."
      : "Explora motos urbanas, deportivas, touring, doble propósito, scooters y de trabajo. Todos los filtros afectan los resultados reales.";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
          <Link to="/" className="transition hover:text-white">
            Inicio
          </Link>{" "}
          / {title}
        </nav>
        <h1 className="section-title">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel sm:text-base">{description}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-10">
            <FilterPanel
              filters={filters}
              onChange={updateFilters}
              facets={facetsState.data ?? { brands: [], models: [], cities: [] }}
              vehicleType={vehicleType}
            />
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-steel" role="status" aria-live="polite">
                {resultState.loading
                  ? "Buscando vehículos..."
                  : `${resultState.data?.total ?? 0} ${resultState.data?.total === 1 ? "vehículo encontrado" : "vehículos encontrados"}`}
              </p>
              {!resultState.loading && (resultState.data?.total ?? 0) > 0 && (
                <p className="text-xs text-steel">
                  Página {resultState.data?.page ?? 1} de {resultState.data?.totalPages ?? 1}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SortSelect filters={filters} onChange={updateFilters} />
            </div>
          </div>

          <MobileFilterButton
            count={filters.brands.length + filters.conditions.length + filters.cities.length + (filters.priceMax ? 1 : 0) + (filters.yearMin ? 1 : 0) + (filters.q ? 1 : 0)}
            onClick={() => setMobileFiltersOpen(true)}
          />

          <div className="mt-4">
            <ActiveFilters filters={filters} onChange={updateFilters} />
          </div>

          {resultState.loading ? (
            <VehicleGridSkeleton count={6} />
          ) : resultState.error ? (
            <ErrorState message={resultState.error} onRetry={resultState.reload} />
          ) : (resultState.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              title="No hay coincidencias con esos filtros"
              description="Prueba ampliar el rango de precios, el año o quitar alguna característica. También puedes usar el asistente para que te sugiera opciones con lo que sí hay disponible."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => updateFilters(createDefaultFilters(vehicleType))}
                  >
                    Limpiar filtros
                  </button>
                  <Link to="/encontrar" className="btn-primary">
                    Encontrar mi vehículo ideal
                  </Link>
                </div>
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {resultState.data?.items.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <Pagination
                page={resultState.data?.page ?? 1}
                totalPages={resultState.data?.totalPages ?? 1}
                onChange={(page) => {
                  updateFilters({ ...filters, page });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </section>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-graphite/80 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-graphite-2 p-5 pb-10 animate-fade-up">
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-graphite-2 pb-3">
              <span className="display text-lg font-bold">
                <SlidersHorizontal className="mr-2 inline size-4 text-lime" />
                Filtrar resultados
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Cerrar filtros"
                className="text-steel hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onChange={updateFilters}
              facets={facetsState.data ?? { brands: [], models: [], cities: [] }}
              vehicleType={vehicleType}
            />
            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full">
              Ver {resultState.data?.total ?? 0} resultados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
