import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { vehicleRepository } from "@/repositories";
import { useAsync, EmptyState, VehicleGridSkeleton } from "@/components/ui/feedback";
import { useShop } from "@/context/ShopContext";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";

export default function FavoritesPage() {
  const { favorites } = useShop();
  const poolState = useAsync(() => vehicleRepository.list(
    {
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
      statuses: ["publicado"],
      sort: "recientes",
      page: 1,
    },
    500,
  ), []);

  useDocumentMeta(`Mis favoritos | ${SITE.name}`, "Vehículos que guardaste para revisarlos con calma.");

  const vehicles = (poolState.data?.items ?? []).filter((vehicle) => favorites.ids.includes(vehicle.id));
  const missing = favorites.ids.filter((id) => !vehicles.some((vehicle) => vehicle.id === id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
            <Link to="/" className="transition hover:text-white">
              Inicio
            </Link>{" "}
            / Favoritos
          </nav>
          <h1 className="section-title">Mis favoritos</h1>
          <p className="mt-3 max-w-2xl text-sm text-steel">
            Tu selección se guarda en este dispositivo mientras no tengas cuenta. Con una cuenta, se sincroniza entre
            tus dispositivos.
          </p>
        </div>
        {favorites.ids.length > 0 && (
          <button type="button" onClick={favorites.clear} className="btn-ghost">
            Vaciar favoritos
          </button>
        )}
      </header>

      {poolState.loading ? (
        <VehicleGridSkeleton count={3} />
      ) : favorites.ids.length === 0 ? (
        <EmptyState
          title="Aún no guardas vehículos"
          description="Toca el ícono de corazón en cualquier tarjeta o ficha para guardar los vehículos que quieras revisar más tarde."
          action={
            <Link to="/carros" className="btn-primary">
              Explorar catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          {missing.length > 0 && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-200">
              <Heart className="mt-0.5 size-4 shrink-0" />
              <p>
                {missing.length} de tus favoritos ya no está{missing.length === 1 ? "" : "n"} publicados en el catálogo,
                por lo que no se muestran. Puedes quitarlos de tu lista para dejar de contarlos.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
