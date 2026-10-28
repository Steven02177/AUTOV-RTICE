import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/repositories/localStore";

/**
 * Favoritos persistidos localmente para usuarios sin cuenta.
 * Con backend autenticado, este hook se conecta a la tabla `favorites`.
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>(() => readJSON<string[]>(STORAGE_KEYS.favorites, []));

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === `av:${STORAGE_KEYS.favorites}`) {
        setIds(readJSON<string[]>(STORAGE_KEYS.favorites, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback((id?: string) => Boolean(id && ids.includes(id)), [ids]);

  const toggleFavorite = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeJSON(STORAGE_KEYS.favorites, next);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setIds(() => {
      writeJSON(STORAGE_KEYS.favorites, []);
      return [];
    });
  }, []);

  return { ids, isFavorite, toggleFavorite, clearFavorites };
}
