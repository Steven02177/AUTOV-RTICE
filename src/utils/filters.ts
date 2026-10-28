import type {
  CarBodyType,
  Condition,
  Drivetrain,
  FuelType,
  ListingStatus,
  MotorcycleCategory,
  SellerType,
  Transmission,
  VehicleFilters,
  VehicleType,
} from "@/types/vehicle";

const MULTI: Array<keyof Pick<VehicleFilters, "brands" | "models" | "conditions" | "cities" | "sellerTypes" | "bodyTypes" | "motorcycleCategories" | "fuelTypes" | "transmissions" | "drivetrains" | "coolings">> = [
  "brands",
  "models",
  "conditions",
  "cities",
  "sellerTypes",
  "bodyTypes",
  "motorcycleCategories",
  "fuelTypes",
  "transmissions",
  "drivetrains",
  "coolings",
];

const NUMERIC = ["yearMin", "yearMax", "priceMin", "priceMax", "mileageMax", "displacementMin", "displacementMax", "doors", "passengerCapacity", "seatHeightMax", "weightMax", "page"] as const;

const LIST_VALUES: Record<string, string[]> = {
  conditions: ["nuevo", "usado"],
  sellerTypes: ["particular", "concesionario", "empresa"],
  bodyTypes: ["sedan", "hatchback", "suv", "pickup", "familiar", "deportivo", "coupe", "furgoneta"],
  motorcycleCategories: ["urbana", "deportiva", "touring", "doble-proposito", "scooter", "trabajo", "naked", "cruiser"],
  fuelTypes: ["gasolina", "diesel", "electrico", "hibrido", "gnv"],
  transmissions: ["manual", "automatica", "cvt", "semiautomatica"],
  drivetrains: ["fwd", "rwd", "awd", "4x4"],
  coolings: ["aire", "liquida"],
};

export function createDefaultFilters(vehicleType?: VehicleType): VehicleFilters {
  return {
    q: "",
    vehicleType,
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
    statuses: ["publicado" as ListingStatus],
    sort: "recientes",
    page: 1,
  };
}

/** Convierte los filtros en parámetros de URL legibles y estables. */
export function filtersToSearchParams(filters: VehicleFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  (["brands", "models", "conditions", "cities", "sellerTypes", "bodyTypes", "motorcycleCategories", "fuelTypes", "transmissions", "drivetrains", "coolings"] as const).forEach((key) => {
    const value = filters[key];
    if (value.length > 0) params.set(key, value.join(","));
  });
  NUMERIC.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== 0 && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  });
  if (filters.featured) params.set("featured", "1");
  if (filters.sort !== "recientes") params.set("sort", filters.sort);
  return params;
}

/** Lee los filtros desde la URL (usado al navegar y al volver desde una ficha). */
export function searchParamsToFilters(params: URLSearchParams, vehicleType?: VehicleType): VehicleFilters {
  const filters = createDefaultFilters(vehicleType);
  filters.q = params.get("q") ?? "";

  (MULTI as string[]).forEach((key) => {
    const raw = params.get(key);
    if (!raw) return;
    const allowed = LIST_VALUES[key];
    const values = raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => (allowed ? allowed.includes(value) : value.length > 0));
    if (values.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (filters as any)[key] = values;
    }
  });

  const brandsRaw = params.get("brands");
  if (brandsRaw) filters.brands = brandsRaw.split(",").filter(Boolean);

  NUMERIC.forEach((key) => {
    const raw = params.get(key);
    if (raw === null) return;
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (filters as any)[key] = value;
  });

  if (params.get("featured") === "1") filters.featured = true;
  const sort = params.get("sort");
  if (sort) filters.sort = sort as VehicleFilters["sort"];
  if (!filters.page || filters.page < 1) filters.page = 1;
  return filters;
}

/** Etiquetas legibles de cada filtro activo, para mostrarlos y quitarlos uno a uno. */
export function describeFilters(filters: VehicleFilters): Array<{ key: string; group: string; label: string; value: string }> {
  const items: Array<{ key: string; group: string; label: string; value: string }> = [];
  const push = (group: string, label: string, value: string, key: string) => items.push({ key, group, label, value });

  if (filters.q?.trim()) push("Búsqueda", "Texto", filters.q.trim(), "q");
  filters.brands.forEach((value) => push("Marca", "Marca", value, `brands:${value}`));
  filters.models.forEach((value) => push("Modelo", "Modelo", value, `models:${value}`));
  filters.conditions.forEach((value) => push("Estado", "Estado", value, `conditions:${value}`));
  filters.cities.forEach((value) => push("Ubicación", "Ciudad", value, `cities:${value}`));
  filters.sellerTypes.forEach((value) => push("Vendedor", "Vendedor", value, `sellerTypes:${value}`));
  filters.bodyTypes.forEach((value) => push("Carrocería", "Carrocería", value, `bodyTypes:${value}`));
  filters.motorcycleCategories.forEach((value) => push("Categoría", "Categoría", value, `motorcycleCategories:${value}`));
  filters.fuelTypes.forEach((value) => push("Combustible", "Combustible", value, `fuelTypes:${value}`));
  filters.transmissions.forEach((value) => push("Transmisión", "Transmisión", value, `transmissions:${value}`));
  filters.drivetrains.forEach((value) => push("Tracción", "Tracción", value, `drivetrains:${value}`));
  filters.coolings.forEach((value) => push("Refrigeración", "Refrigeración", value, `coolings:${value}`));

  if (filters.yearMin !== undefined) push("Año", "Año desde", String(filters.yearMin), "yearMin");
  if (filters.yearMax !== undefined) push("Año", "Año hasta", String(filters.yearMax), "yearMax");
  if (filters.priceMin !== undefined) push("Precio", "Precio desde", filters.priceMin.toLocaleString("es-CO"), "priceMin");
  if (filters.priceMax !== undefined) push("Precio", "Precio hasta", filters.priceMax.toLocaleString("es-CO"), "priceMax");
  if (filters.mileageMax !== undefined) push("Kilometraje", "Kilometraje máximo", `${filters.mileageMax.toLocaleString("es-CO")} km`, "mileageMax");
  if (filters.displacementMin !== undefined) push("Cilindraje", "Cilindraje desde", `${filters.displacementMin} cc`, "displacementMin");
  if (filters.displacementMax !== undefined) push("Cilindraje", "Cilindraje hasta", `${filters.displacementMax} cc`, "displacementMax");
  if (filters.doors !== undefined) push("Puertas", "Puertas", String(filters.doors), "doors");
  if (filters.passengerCapacity !== undefined) push("Capacidad", "Pasajeros", String(filters.passengerCapacity), "passengerCapacity");
  if (filters.seatHeightMax !== undefined) push("Altura de asiento", "Altura máxima", `${filters.seatHeightMax} mm`, "seatHeightMax");
  if (filters.weightMax !== undefined) push("Peso", "Peso máximo", `${filters.weightMax} kg`, "weightMax");
  if (filters.featured) push("Destacados", "Solo destacados", "Destacados", "featured");

  return items;
}

/** Quita un filtro concreto por su clave descriptiva. */
export function removeFilterKey(filters: VehicleFilters, key: string): VehicleFilters {
  const next: VehicleFilters = { ...filters, page: 1 };
  if (key === "q") {
    next.q = "";
    return next;
  }
  if (key === "featured") {
    delete next.featured;
    return next;
  }
  const [group, value] = key.split(":");
  if (group && value !== undefined) {
    const listKey = group as (typeof MULTI)[number];
    if (Array.isArray(filters[listKey])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[listKey] = (filters[listKey] as string[]).filter((item) => item !== value);
      return next;
    }
  }
  if (key in next) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (next as any)[key];
  }
  return next;
}

export function countActiveFilters(filters: VehicleFilters): number {
  return describeFilters(filters).length;
}

export type { CarBodyType, Condition, Drivetrain, FuelType, MotorcycleCategory, SellerType, Transmission };
