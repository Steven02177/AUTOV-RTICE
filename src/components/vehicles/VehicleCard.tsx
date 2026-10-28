import { Link } from "react-router-dom";
import { Heart, MapPin, Scale, Check } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { formatCOP, formatMileage } from "@/utils/format";
import { ConditionBadge, FeaturedBadge, ImageWithFallback } from "@/components/ui/primitives";
import { useShop } from "@/context/ShopContext";

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: "Mecánica",
  automatica: "Automática",
  cvt: "CVT",
  semiautomatica: "Semiautomática",
};

export function vehiclePath(vehicle: Vehicle): string {
  return `/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`;
}

export default function VehicleCard({ vehicle, compact = false }: { vehicle: Vehicle; compact?: boolean }) {
  const { favorites, compare } = useShop();
  const favorite = favorites.isFavorite(vehicle.id);
  const inCompare = compare.isInCompare(vehicle.id);

  const specs = [
    `${vehicle.year}`,
    formatMileage(vehicle.mileage),
    vehicle.specs.transmission ? TRANSMISSION_LABEL[vehicle.specs.transmission] ?? vehicle.specs.transmission : "Transmisión no informada",
  ];

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-graphite-2/80 shadow-card transition duration-300 hover:-translate-y-1 hover:border-lime/40 ${
        compact ? "" : "h-full"
      }`}
    >
      <div className="relative overflow-hidden">
        <Link to={vehiclePath(vehicle)} tabIndex={-1} aria-hidden="true" className="block">
          <ImageWithFallback
            src={vehicle.imageUrls[0]}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year}`}
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <ConditionBadge condition={vehicle.condition} />
          {vehicle.isFeatured && <FeaturedBadge />}
        </div>

        <button
          type="button"
          onClick={() => favorites.toggle(vehicle)}
          aria-pressed={favorite}
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full backdrop-blur transition ${
            favorite ? "bg-lime text-graphite" : "bg-graphite/70 text-white hover:bg-graphite/90"
          }`}
        >
          <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
        </button>

        {vehicle.isDemo && (
          <span className="absolute bottom-3 left-3 rounded-full bg-graphite/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur">
            Demostración
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-lime">{vehicle.brand}</p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-white">
            <Link to={vehiclePath(vehicle)} className="transition hover:text-lime">
              {vehicle.model} <span className="text-white/70">{vehicle.version}</span>
            </Link>
          </h3>
        </div>

        <p className="display text-2xl font-bold text-white">{formatCOP(vehicle.price)}</p>

        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-steel">
          {specs.map((spec) => (
            <li key={spec} className="after:ml-3 after:text-white/20 after:last:content-['']">
              {spec}
            </li>
          ))}
        </ul>

        <p className="flex items-center gap-1.5 text-xs text-steel">
          <MapPin className="size-3.5" /> {vehicle.city}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link to={vehiclePath(vehicle)} className="btn-primary flex-1 !py-2 text-xs">
            Ver vehículo
          </Link>
          <button
            type="button"
            onClick={() => compare.add(vehicle)}
            aria-pressed={inCompare}
            aria-label={inCompare ? "Quitar de la comparación" : "Agregar a la comparación"}
            title={inCompare ? "Quitar de la comparación" : "Comparar"}
            className={`flex size-10 items-center justify-center rounded-full border transition ${
              inCompare ? "border-lime bg-lime/15 text-lime" : "border-white/15 text-white/70 hover:border-lime/60 hover:text-white"
            }`}
          >
            {inCompare ? <Check className="size-4" /> : <Scale className="size-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
