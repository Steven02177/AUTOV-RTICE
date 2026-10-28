import { Link } from "react-router-dom";
import { ArrowLeftRight, Scale, Trash2 } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import CompareTable from "@/components/comparison/CompareTable";
import { EmptyState } from "@/components/ui/feedback";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";

export default function ComparePage() {
  const { compare } = useShop();

  useDocumentMeta(
    `Comparar vehículos | ${SITE.name}`,
    "Compara hasta tres vehículos lado a lado: precio, año, kilometraje, motor, consumo declarado y costos estimados.",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
            <Link to="/" className="transition hover:text-white">
              Inicio
            </Link>{" "}
            / Comparar
          </nav>
          <h1 className="section-title">Comparar vehículos</h1>
          <p className="mt-3 max-w-2xl text-sm text-steel">
            Selecciona hasta tres vehículos del mismo tipo. Las diferencias relevantes se resaltan para que decidas con
            datos, no por intuición.
          </p>
        </div>
        {compare.vehicles.length > 1 && (
          <button type="button" onClick={compare.clear} className="btn-ghost">
            <Trash2 className="size-4" /> Vaciar comparación
          </button>
        )}
      </header>

      {compare.vehicles.length === 0 ? (
        <EmptyState
          title="Tu comparación está vacía"
          description="Agrega vehículos desde el catálogo tocando el ícono de comparación en cualquier tarjeta o ficha. Solo puedes comparar carros entre sí o motos entre sí."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/carros" className="btn-primary">
                Explorar carros
              </Link>
              <Link to="/motos" className="btn-ghost">
                Explorar motos
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {compare.vehicles.length === 1 && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
              <Scale className="mt-0.5 size-4 shrink-0 text-lime" />
              <p>
                Agrega al menos un vehículo más del mismo tipo para ver la comparación lado a lado. Puedes moverlos de
                posición para cambiar el orden en que se leen los datos.
              </p>
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {compare.vehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="flex items-center gap-1 rounded-full border border-white/12 bg-white/5 py-1 pl-3 pr-1 text-xs text-white/85"
              >
                <span className="max-w-48 truncate">
                  {vehicle.brand} {vehicle.model}
                </span>
                <button
                  type="button"
                  onClick={() => compare.swap(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Mover a la izquierda"
                  className="flex size-7 items-center justify-center rounded-full text-steel transition hover:text-white disabled:opacity-30"
                >
                  <ArrowLeftRight className="size-3.5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => compare.remove(vehicle.id)}
                  aria-label={`Quitar ${vehicle.brand} ${vehicle.model}`}
                  className="flex size-7 items-center justify-center rounded-full text-steel transition hover:text-red-300"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {compare.vehicles.length >= 2 ? (
            <CompareTable vehicles={compare.vehicles} />
          ) : (
            <EmptyState
              title="Falta un vehículo para comparar"
              description="Selecciona al menos dos vehículos del mismo tipo para ver la tabla comparativa completa."
              action={
                <Link to="/carros" className="btn-primary">
                  Elegir otro vehículo
                </Link>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
