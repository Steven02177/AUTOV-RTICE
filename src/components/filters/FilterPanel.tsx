import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { VehicleFilters, VehicleType } from "@/types/vehicle";
import { moneyInputMask, parseMoneyInput } from "@/utils/format";
import { Field } from "@/components/ui/primitives";

export interface Facets {
  brands: string[];
  models: string[];
  cities: string[];
}

const BODY_LABELS: Record<string, string> = {
  sedan: "Sedán",
  hatchback: "Hatchback",
  suv: "SUV",
  pickup: "Pick-up",
  familiar: "Familiar",
  deportivo: "Deportivo",
  coupe: "Coupé",
  furgoneta: "Furgoneta",
};

const MOTO_LABELS: Record<string, string> = {
  urbana: "Urbana",
  deportiva: "Deportiva",
  touring: "Touring",
  "doble-proposito": "Doble propósito",
  scooter: "Scooter",
  trabajo: "Trabajo",
  naked: "Naked",
  cruiser: "Cruiser",
};

const FUEL_LABELS: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  electrico: "Eléctrico",
  hibrido: "Híbrido",
  gnv: "GNV",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  manual: "Mecánica",
  automatica: "Automática",
  cvt: "CVT",
  semiautomatica: "Semiautomática",
};

const DRIVETRAIN_LABELS: Record<string, string> = {
  fwd: "Delantera (FWD)",
  rwd: "Trasera (RWD)",
  awd: "Integral (AWD)",
  "4x4": "4x4",
};

const SELLER_LABELS: Record<string, string> = {
  particular: "Particular",
  concesionario: "Concesionario",
  empresa: "Empresa",
};

const COOLING_LABELS: Record<string, string> = {
  aire: "Aire",
  liquida: "Líquida",
};

interface ChipGroupProps<T extends string> {
  label: string;
  values: T[];
  selected: T[];
  onChange: (next: T[]) => void;
  labels?: Record<string, string>;
}

function ChipGroup<T extends string>({ label, values, selected, onChange, labels }: ChipGroupProps<T>) {
  return (
    <fieldset className="mb-6">
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(active ? selected.filter((item) => item !== value) : [...selected, value])}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-lime bg-lime/15 text-lime"
                  : "border-white/12 bg-white/5 text-white/75 hover:border-white/30 hover:text-white"
              }`}
            >
              {labels?.[value] ?? value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckList({
  label,
  values,
  selected,
  onChange,
  maxVisible = 6,
}: {
  label: string;
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  maxVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? values : values.slice(0, maxVisible);
  if (values.length === 0) return null;

  return (
    <fieldset className="mb-6">
      <legend className="label">{label}</legend>
      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {visible.map((value) => {
          const active = selected.includes(value);
          return (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-white/80 transition hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => onChange(active ? selected.filter((item) => item !== value) : [...selected, value])}
                className="size-4 accent-lime"
              />
              {value}
            </label>
          );
        })}
      </div>
      {values.length > maxVisible && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-semibold text-lime transition hover:text-lime-soft"
        >
          {expanded ? "Ver menos" : `Ver ${values.length - maxVisible} más`}
        </button>
      )}
    </fieldset>
  );
}

function RangeFields({
  label,
  minValue,
  maxValue,
  onMin,
  onMax,
  placeholderMin,
  placeholderMax,
  mask,
}: {
  label: string;
  minValue?: number;
  maxValue?: number;
  onMin: (value?: number) => void;
  onMax: (value?: number) => void;
  placeholderMin: string;
  placeholderMax: string;
  mask?: (raw: string) => string;
}) {
  const [min, setMin] = useState(minValue ? String(minValue) : "");
  const [max, setMax] = useState(maxValue ? String(maxValue) : "");

  return (
    <fieldset className="mb-6">
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            inputMode="numeric"
            value={mask ? mask(min) : min}
            onChange={(event) => {
              const raw = event.target.value;
              setMin(raw);
              onMin(mask ? parseMoneyInput(raw) : Number(raw.replace(/[^\d]/g, "")) || undefined);
            }}
            placeholder={placeholderMin}
            aria-label={`${label} mínimo`}
            className="field"
          />
        </div>
        <div>
          <input
            inputMode="numeric"
            value={mask ? mask(max) : max}
            onChange={(event) => {
              const raw = event.target.value;
              setMax(raw);
              onMax(mask ? parseMoneyInput(raw) : Number(raw.replace(/[^\d]/g, "")) || undefined);
            }}
            placeholder={placeholderMax}
            aria-label={`${label} máximo`}
            className="field"
          />
        </div>
      </div>
    </fieldset>
  );
}

const MILEAGE_OPTIONS = [10000, 30000, 50000, 80000, 120000, 200000];
const DISPLACEMENT_OPTIONS_CAR = [1000, 1400, 2000, 3000];
const DISPLACEMENT_OPTIONS_MOTO = [125, 200, 300, 700];

export default function FilterPanel({
  filters,
  onChange,
  facets,
  vehicleType,
}: {
  filters: VehicleFilters;
  onChange: (next: VehicleFilters) => void;
  facets: Facets;
  vehicleType: VehicleType;
}) {
  const set = (patch: Partial<VehicleFilters>) => onChange({ ...filters, ...patch, page: 1 });

  const [brandQuery, setBrandQuery] = useState("");
  const brands = facets.brands.filter((brand) => brand.toLowerCase().includes(brandQuery.toLowerCase()));

  const models = facets.models;

  const isCar = vehicleType === "carro";

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-lime" />
        <h2 className="display text-xl font-bold">Filtros</h2>
      </div>

      <Field label="Palabra clave" htmlFor="filter-q">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel" />
          <input
            id="filter-q"
            type="search"
            value={filters.q ?? ""}
            onChange={(event) => set({ q: event.target.value })}
            placeholder="Marca, modelo, ciudad..."
            className="field !pl-9"
          />
        </div>
      </Field>

      <div className="my-6">
        <ChipGroup
          label="Estado"
          values={["nuevo", "usado"]}
          selected={filters.conditions}
          onChange={(next) => set({ conditions: next })}
          labels={{ nuevo: "Nuevo", usado: "Usado" }}
        />
      </div>

      <RangeFields
        label="Precio (COP)"
        minValue={filters.priceMin}
        maxValue={filters.priceMax}
        onMin={(value) => set({ priceMin: value })}
        onMax={(value) => set({ priceMax: value })}
        placeholderMin="Desde"
        placeholderMax="Hasta"
        mask={moneyInputMask}
      />

      <RangeFields
        label="Año"
        minValue={filters.yearMin}
        maxValue={filters.yearMax}
        onMin={(value) => set({ yearMin: value })}
        onMax={(value) => set({ yearMax: value })}
        placeholderMin="Desde"
        placeholderMax="Hasta"
      />

      <div className="mb-6">
        <Field label="Kilometraje máximo" htmlFor="filter-mileage">
          <select
            id="filter-mileage"
            value={filters.mileageMax ?? ""}
            onChange={(event) => set({ mileageMax: event.target.value ? Number(event.target.value) : undefined })}
            className="field"
          >
            <option value="">Sin límite</option>
            {MILEAGE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value.toLocaleString("es-CO")} km
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mb-6">
        <Field label="Marca" htmlFor="filter-brand-search">
          <input
            id="filter-brand-search"
            type="search"
            value={brandQuery}
            onChange={(event) => setBrandQuery(event.target.value)}
            placeholder="Buscar marca"
            className="field"
          />
        </Field>
      </div>
      <CheckList label="Marcas" values={brands} selected={filters.brands} onChange={(next) => set({ brands: next })} />
      <CheckList label="Modelos" values={models} selected={filters.models} onChange={(next) => set({ models: next })} />
      <CheckList
        label="Ciudad"
        values={facets.cities}
        selected={filters.cities}
        onChange={(next) => set({ cities: next })}
      />
      <ChipGroup
        label="Tipo de vendedor"
        values={["particular", "concesionario", "empresa"]}
        selected={filters.sellerTypes}
        onChange={(next) => set({ sellerTypes: next })}
        labels={SELLER_LABELS}
      />

      <label className="mb-6 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
        <input
          type="checkbox"
          checked={Boolean(filters.featured)}
          onChange={(event) => set({ featured: event.target.checked || undefined })}
          className="size-4 accent-lime"
        />
        Solo vehículos destacados
      </label>

      {isCar ? (
        <>
          <ChipGroup
            label="Tipo de carrocería"
            values={["sedan", "hatchback", "suv", "pickup", "familiar", "deportivo", "coupe", "furgoneta"]}
            selected={filters.bodyTypes}
            onChange={(next) => set({ bodyTypes: next })}
            labels={BODY_LABELS}
          />
          <ChipGroup
            label="Combustible"
            values={["gasolina", "diesel", "electrico", "hibrido", "gnv"]}
            selected={filters.fuelTypes}
            onChange={(next) => set({ fuelTypes: next })}
            labels={FUEL_LABELS}
          />
          <ChipGroup
            label="Transmisión"
            values={["manual", "automatica", "cvt", "semiautomatica"]}
            selected={filters.transmissions}
            onChange={(next) => set({ transmissions: next })}
            labels={TRANSMISSION_LABELS}
          />
          <ChipGroup
            label="Tracción"
            values={["fwd", "rwd", "awd", "4x4"]}
            selected={filters.drivetrains}
            onChange={(next) => set({ drivetrains: next })}
            labels={DRIVETRAIN_LABELS}
          />
          <RangeFields
            label="Cilindraje (cc)"
            minValue={filters.displacementMin}
            maxValue={filters.displacementMax}
            onMin={(value) => set({ displacementMin: value })}
            onMax={(value) => set({ displacementMax: value })}
            placeholderMin="Desde"
            placeholderMax="Hasta"
          />
          <div className="mb-6 grid grid-cols-2 gap-3">
            <Field label="Puertas" htmlFor="filter-doors">
              <select
                id="filter-doors"
                value={filters.doors ?? ""}
                onChange={(event) => set({ doors: event.target.value ? Number(event.target.value) : undefined })}
                className="field"
              >
                <option value="">Cualquiera</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </Field>
            <Field label="Pasajeros" htmlFor="filter-passengers">
              <select
                id="filter-passengers"
                value={filters.passengerCapacity ?? ""}
                onChange={(event) =>
                  set({ passengerCapacity: event.target.value ? Number(event.target.value) : undefined })
                }
                className="field"
              >
                <option value="">Cualquiera</option>
                {[2, 4, 5, 7].map((value) => (
                  <option key={value} value={value}>
                    {value}+
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </>
      ) : (
        <>
          <ChipGroup
            label="Categoría de moto"
            values={["urbana", "deportiva", "touring", "doble-proposito", "scooter", "trabajo", "naked", "cruiser"]}
            selected={filters.motorcycleCategories}
            onChange={(next) => set({ motorcycleCategories: next })}
            labels={MOTO_LABELS}
          />
          <ChipGroup
            label="Transmisión"
            values={["manual", "cvt", "semiautomatica"]}
            selected={filters.transmissions}
            onChange={(next) => set({ transmissions: next })}
            labels={TRANSMISSION_LABELS}
          />
          <ChipGroup
            label="Refrigeración"
            values={["aire", "liquida"]}
            selected={filters.coolings}
            onChange={(next) => set({ coolings: next })}
            labels={COOLING_LABELS}
          />
          <div className="mb-6">
            <Field label="Cilindraje máximo (cc)" htmlFor="filter-displacement-max">
              <select
                id="filter-displacement-max"
                value={filters.displacementMax ?? ""}
                onChange={(event) => set({ displacementMax: event.target.value ? Number(event.target.value) : undefined })}
                className="field"
              >
                <option value="">Sin límite</option>
                {DISPLACEMENT_OPTIONS_MOTO.map((value) => (
                  <option key={value} value={value}>
                    Hasta {value} cc
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <Field label="Altura asiento máx. (mm)" htmlFor="filter-seat">
              <select
                id="filter-seat"
                value={filters.seatHeightMax ?? ""}
                onChange={(event) => set({ seatHeightMax: event.target.value ? Number(event.target.value) : undefined })}
                className="field"
              >
                <option value="">Sin límite</option>
                {[780, 800, 830, 870].map((value) => (
                  <option key={value} value={value}>
                    {value} mm
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Peso máximo (kg)" htmlFor="filter-weight">
              <select
                id="filter-weight"
                value={filters.weightMax ?? ""}
                onChange={(event) => set({ weightMax: event.target.value ? Number(event.target.value) : undefined })}
                className="field"
              >
                <option value="">Sin límite</option>
                {[130, 160, 200, 250].map((value) => (
                  <option key={value} value={value}>
                    {value} kg
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </>
      )}

      {isCar && DISPLACEMENT_OPTIONS_CAR.length > 0 && (
        <p className="mb-4 text-xs leading-relaxed text-steel">
          El consumo de combustible no se usa como filtro porque los anuncios lo informan como texto y no todos lo
          incluyen: se muestra en la ficha cuando existe.
        </p>
      )}
    </div>
  );
}

/** Botón que abre el panel de filtros en móvil. */
export function MobileFilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn-ghost relative w-full lg:hidden">
      <SlidersHorizontal className="size-4" />
      Filtros
      {count > 0 && (
        <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-lime text-[11px] font-bold text-graphite">
          {count}
        </span>
      )}
    </button>
  );
}

export function MobileFilterClose({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Cerrar filtros" className="text-steel hover:text-white">
      <X className="size-5" />
    </button>
  );
}
