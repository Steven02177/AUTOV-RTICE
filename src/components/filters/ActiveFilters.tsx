import { X } from "lucide-react";
import type { SortKey, VehicleFilters } from "@/types/vehicle";
import { countActiveFilters, describeFilters, removeFilterKey } from "@/utils/filters";

const SORT_LABELS: Record<SortKey, string> = {
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  "anio-desc": "Año más reciente",
  "km-asc": "Menor kilometraje",
  "km-desc": "Mayor kilometraje",
  recientes: "Más recientes en el catálogo",
};

export function SortSelect({ filters, onChange }: { filters: VehicleFilters; onChange: (next: VehicleFilters) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-steel">
      Ordenar por
      <select
        value={filters.sort}
        onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey, page: 1 })}
        className="field !w-auto !py-2"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ActiveFilters({
  filters,
  onChange,
}: {
  filters: VehicleFilters;
  onChange: (next: VehicleFilters) => void;
}) {
  const items = describeFilters(filters);
  const total = countActiveFilters(filters);
  if (total === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-steel">Filtros activos ({total}):</span>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(removeFilterKey(filters, item.key))}
          className="chip chip-active transition hover:border-red-300/60 hover:text-red-200"
          aria-label={`Quitar filtro ${item.label} ${item.value}`}
        >
          {item.label}: {item.value}
          <X className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...filters, q: "", brands: [], models: [], conditions: [], cities: [], sellerTypes: [], bodyTypes: [], motorcycleCategories: [], fuelTypes: [], transmissions: [], drivetrains: [], coolings: [], yearMin: undefined, yearMax: undefined, priceMin: undefined, priceMax: undefined, mileageMax: undefined, displacementMin: undefined, displacementMax: undefined, doors: undefined, passengerCapacity: undefined, seatHeightMax: undefined, weightMax: undefined, featured: undefined, page: 1 })}
        className="text-xs font-semibold text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
