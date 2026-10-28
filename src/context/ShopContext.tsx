import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useFavorites } from "@/services/favorites";
import { useComparison, type CompareAddResult } from "@/services/comparison";
import type { Vehicle } from "@/types/vehicle";
import { useToast } from "@/components/ui/feedback";

interface ShopContextValue {
  favorites: {
    ids: string[];
    isFavorite: (id?: string) => boolean;
    toggle: (vehicle: Vehicle) => void;
    clear: () => void;
  };
  compare: {
    ids: string[];
    isInCompare: (id?: string) => boolean;
    add: (vehicle: Vehicle) => CompareAddResult;
    remove: (id: string) => void;
    swap: (from: number, to: number) => void;
    clear: () => void;
    vehicles: Vehicle[];
  };
}

const ShopContext = createContext<ShopContextValue | null>(null);

const LABEL = (vehicle: Vehicle) => `${vehicle.brand} ${vehicle.model}`;

export function ShopProvider({ children, vehiclePool }: { children: ReactNode; vehiclePool: Vehicle[] }) {
  const favorites = useFavorites();
  const comparison = useComparison();
  const { push } = useToast();

  const value = useMemo<ShopContextValue>(() => {
    const compareVehicles = comparison.ids
      .map((id) => vehiclePool.find((vehicle) => vehicle.id === id))
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));

    return {
      favorites: {
        ids: favorites.ids,
        isFavorite: favorites.isFavorite,
        toggle: (vehicle) => {
          const willBeFavorite = !favorites.isFavorite(vehicle.id);
          favorites.toggleFavorite(vehicle.id);
          push(
            willBeFavorite
              ? `${LABEL(vehicle)} se guardó en tus favoritos.`
              : `${LABEL(vehicle)} se quitó de tus favoritos.`,
            willBeFavorite ? "success" : "info",
          );
        },
        clear: () => {
          favorites.clearFavorites();
          push("Se vació tu lista de favoritos.", "info");
        },
      },
      compare: {
        ids: comparison.ids,
        isInCompare: comparison.isInCompare,
        add: (vehicle) => {
          const existing = vehiclePool.find((item) => comparison.ids.includes(item.id));
          const result = comparison.add(vehicle, existing?.vehicleType ?? null);
          if (result === "limit") {
            push("Solo puedes comparar hasta tres vehículos. Quita uno para continuar.", "error");
          } else if (result === "type-mismatch") {
            push("Solo se pueden comparar vehículos del mismo tipo (carros con carros, motos con motos).", "error");
          } else if (result === "removed") {
            push(`${LABEL(vehicle)} se quitó de la comparación.`, "info");
          } else {
            push(`${LABEL(vehicle)} se agregó a la comparación.`, "success");
          }
          return result;
        },
        remove: comparison.remove,
        swap: comparison.swap,
        clear: comparison.clear,
        vehicles: compareVehicles,
      },
    };
  }, [favorites, comparison, push, vehiclePool]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop debe usarse dentro de ShopProvider.");
  return context;
}
