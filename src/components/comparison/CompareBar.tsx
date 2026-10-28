import { Link } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { MAX_COMPARE } from "@/services/comparison";
import { ImageWithFallback } from "@/components/ui/primitives";

/** Barra flotante que resume la lista de comparación mientras el usuario navega. */
export default function CompareBar() {
  const { compare } = useShop();
  if (compare.ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-graphite/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-2 text-sm font-semibold text-white sm:flex">
          <Scale className="size-4 text-lime" />
          Comparar
          <span className="text-steel">
            {compare.ids.length}/{MAX_COMPARE}
          </span>
        </div>

        <ul className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {compare.vehicles.map((vehicle) => (
            <li key={vehicle.id} className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2">
              <ImageWithFallback
                src={vehicle.imageUrls[0]}
                alt={vehicle.brand}
                className="size-7 rounded-full object-cover"
              />
              <span className="max-w-32 truncate text-xs text-white/85">
                {vehicle.brand} {vehicle.model}
              </span>
              <button
                type="button"
                onClick={() => compare.remove(vehicle.id)}
                aria-label={`Quitar ${vehicle.brand} ${vehicle.model} de la comparación`}
                className="text-steel transition hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <Link to="/comparar" className="btn-primary shrink-0 !px-4 !py-2 text-xs">
          Comparar ahora
        </Link>
      </div>
    </div>
  );
}
