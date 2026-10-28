import type { SellerType, Vehicle, VehicleFilters } from "@/types/vehicle";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Normaliza y compara acentos/mayúsculas para búsqueda de texto libre. */
export function matchesQuery(vehicle: Vehicle, query: string): boolean {
  const haystack = normalize(
    [
      vehicle.brand,
      vehicle.model,
      vehicle.version,
      vehicle.city,
      vehicle.department,
      vehicle.description,
      vehicle.bodyType ?? "",
      vehicle.motorcycleCategory ?? "",
      vehicle.specs.color ?? "",
      vehicle.specs.transmission ?? "",
      vehicle.specs.fuelType ?? "",
    ].join(" "),
  );
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

/**
 * Aplica todos los filtros activos. Cada filtro es acumulativo (Y lógico),
 * por lo que varias selecciones del mismo grupo funcionan como OR dentro del grupo.
 */
export interface FilterContext {
  /** Resuelve el tipo de vendedor de un vehículo (los datos viven en otra entidad). */
  sellerTypeOf?: (vehicle: Vehicle) => SellerType | undefined;
}

export function applyFilters(
  vehicles: Vehicle[],
  filters: VehicleFilters,
  context: FilterContext = {},
): Vehicle[] {
  const activeStatuses = filters.statuses.length > 0 ? filters.statuses : ["publicado" as const];

  return vehicles.filter((vehicle) => {
    if (vehicle.listingStatus !== "publicado") return false;
    if (!activeStatuses.includes(vehicle.listingStatus)) return false;
    if (filters.vehicleType && vehicle.vehicleType !== filters.vehicleType) return false;
    if (filters.q && !matchesQuery(vehicle, filters.q)) return false;
    if (filters.brands.length > 0 && !filters.brands.includes(vehicle.brand)) return false;
    if (filters.models.length > 0 && !filters.models.includes(vehicle.model)) return false;
    if (filters.conditions.length > 0 && !filters.conditions.includes(vehicle.condition)) return false;
    if (filters.cities.length > 0 && !filters.cities.includes(vehicle.city)) return false;
    if (filters.featured && !vehicle.isFeatured) return false;
    if (filters.yearMin !== undefined && vehicle.year < filters.yearMin) return false;
    if (filters.yearMax !== undefined && vehicle.year > filters.yearMax) return false;
    if (filters.priceMin !== undefined && vehicle.price < filters.priceMin) return false;
    if (filters.priceMax !== undefined && vehicle.price > filters.priceMax) return false;
    if (filters.mileageMax !== undefined && vehicle.mileage > filters.mileageMax) return false;

    if (filters.sellerTypes.length > 0) {
      const sellerType = context.sellerTypeOf?.(vehicle);
      if (!sellerType || !filters.sellerTypes.includes(sellerType)) return false;
    }

    if (filters.bodyTypes.length > 0) {
      if (!vehicle.bodyType || !filters.bodyTypes.includes(vehicle.bodyType)) return false;
    }
    if (filters.motorcycleCategories.length > 0) {
      if (!vehicle.motorcycleCategory || !filters.motorcycleCategories.includes(vehicle.motorcycleCategory)) return false;
    }
    if (filters.fuelTypes.length > 0) {
      if (!vehicle.specs.fuelType || !filters.fuelTypes.includes(vehicle.specs.fuelType)) return false;
    }
    if (filters.transmissions.length > 0) {
      if (!vehicle.specs.transmission || !filters.transmissions.includes(vehicle.specs.transmission)) return false;
    }
    if (filters.drivetrains.length > 0) {
      if (!vehicle.specs.drivetrain || !filters.drivetrains.includes(vehicle.specs.drivetrain)) return false;
    }
    if (filters.coolings.length > 0) {
      if (!vehicle.specs.cooling || !filters.coolings.includes(vehicle.specs.cooling)) return false;
    }
    if (filters.displacementMin !== undefined) {
      if (!vehicle.specs.engineDisplacement || vehicle.specs.engineDisplacement < filters.displacementMin) return false;
    }
    if (filters.displacementMax !== undefined) {
      if (!vehicle.specs.engineDisplacement || vehicle.specs.engineDisplacement > filters.displacementMax) return false;
    }
    if (filters.doors !== undefined && vehicle.specs.doors !== filters.doors) return false;
    if (filters.passengerCapacity !== undefined && vehicle.specs.passengerCapacity !== filters.passengerCapacity) return false;
    if (filters.seatHeightMax !== undefined) {
      if (!vehicle.specs.seatHeight || vehicle.specs.seatHeight > filters.seatHeightMax) return false;
    }
    if (filters.weightMax !== undefined) {
      if (!vehicle.specs.weight || vehicle.specs.weight > filters.weightMax) return false;
    }
    return true;
  });
}

const SORTERS: Record<VehicleFilters["sort"], (a: Vehicle, b: Vehicle) => number> = {
  "precio-asc": (a, b) => a.price - b.price,
  "precio-desc": (a, b) => b.price - a.price,
  "anio-desc": (a, b) => b.year - a.year || a.mileage - b.mileage,
  "km-asc": (a, b) => a.mileage - b.mileage,
  "km-desc": (a, b) => b.mileage - a.mileage,
  recientes: (a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt),
};

export function sortVehicles(vehicles: Vehicle[], sort: VehicleFilters["sort"]): Vehicle[] {
  return [...vehicles].sort(SORTERS[sort]);
}

/** Simula la latencia de una consulta remota para que los estados de carga se vean reales. */
export function simulateLatency<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
