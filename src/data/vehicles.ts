import type { Vehicle } from "@/types/vehicle";
import { DEMO_CARS } from "./cars";
import { DEMO_MOTORCYCLES } from "./motorcycles";

/**
 * Catálogo único de demostración.
 * Toda la aplicación lee los vehículos desde esta fuente (o desde el backend
 * cuando se configura VITE_DATA_MODE=supabase). No se duplican datos por componente.
 */
export const DEMO_VEHICLES: Vehicle[] = [...DEMO_CARS, ...DEMO_MOTORCYCLES];
