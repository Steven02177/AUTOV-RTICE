import { useCallback, useEffect, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/repositories/localStore";

export const MAX_COMPARE = 3;

export type CompareAddResult = "added" | "removed" | "replaced" | "limit" | "type-mismatch";

/**
 * Lista de comparación (máximo 3 vehículos).
 * Solo permite comparar vehículos del mismo tipo (carro con carro, moto con moto),
 * porque las especificaciones de ambos no son intercambiables.
 */
export function useComparison() {
  const [ids, setIds] = useState<string[]>(() => readJSON<string[]>(STORAGE_KEYS.comparison, []));
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === `av:${STORAGE_KEYS.comparison}`) {
        setIds(readJSON<string[]>(STORAGE_KEYS.comparison, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    writeJSON(STORAGE_KEYS.comparison, next);
  }, []);

  const isInCompare = useCallback((id?: string) => Boolean(id && ids.includes(id)), [ids]);

  const add = useCallback(
    (vehicle: Vehicle, currentType?: Vehicle["vehicleType"] | null): CompareAddResult => {
      if (ids.includes(vehicle.id)) {
        persist(ids.filter((item) => item !== vehicle.id));
        return "removed";
      }
      const type = currentType ?? vehicle.vehicleType;
      if (type !== vehicle.vehicleType) return "type-mismatch";
      if (ids.length >= MAX_COMPARE) return "limit";
      const next = [...ids, vehicle.id];
      persist(next);
      return "added";
    },
    [ids, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(ids.filter((item) => item !== id));
    },
    [ids, persist],
  );

  const swap = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= ids.length) return;
      const next = [...ids];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      persist(next);
    },
    [ids, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { ids, isInCompare, add, remove, swap, clear };
}
