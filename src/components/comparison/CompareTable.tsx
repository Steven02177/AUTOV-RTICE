import { Link } from "react-router-dom";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { formatCOP, formatDisplacement, formatMileage } from "@/utils/format";
import { ConditionBadge, ImageWithFallback } from "@/components/ui/primitives";
import { useShop } from "@/context/ShopContext";

const UNKNOWN = "No informado";

function vehiclePath(vehicle: Vehicle): string {
  return `/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`;
}

interface Row {
  label: string;
  values: (string | undefined)[];
  emphasize?: boolean;
}

function buildRows(vehicles: Vehicle[]): Row[] {
  return [
    { label: "Precio", values: vehicles.map((vehicle) => formatCOP(vehicle.price)), emphasize: true },
    { label: "Año", values: vehicles.map((vehicle) => String(vehicle.year)), emphasize: true },
    { label: "Kilometraje", values: vehicles.map((vehicle) => formatMileage(vehicle.mileage)), emphasize: true },
    { label: "Estado", values: vehicles.map((vehicle) => vehicle.condition) },
    { label: "Ciudad", values: vehicles.map((vehicle) => vehicle.city) },
    { label: "Motor / cilindraje", values: vehicles.map((vehicle) => formatDisplacement(vehicle.specs.engineDisplacement)) },
    { label: "Potencia", values: vehicles.map((vehicle) => vehicle.specs.enginePower ?? UNKNOWN) },
    { label: "Torque", values: vehicles.map((vehicle) => vehicle.specs.torque ?? UNKNOWN) },
    {
      label: "Transmisión",
      values: vehicles.map((vehicle) => {
        const map: Record<string, string> = {
          manual: "Mecánica",
          automatica: "Automática",
          cvt: "CVT",
          semiautomatica: "Semiautomática",
        };
        return vehicle.specs.transmission ? map[vehicle.specs.transmission] : UNKNOWN;
      }),
    },
    {
      label: "Combustible",
      values: vehicles.map((vehicle) => {
        const map: Record<string, string> = {
          gasolina: "Gasolina",
          diesel: "Diésel",
          electrico: "Eléctrico",
          hibrido: "Híbrido",
          gnv: "GNV",
        };
        return vehicle.specs.fuelType ? map[vehicle.specs.fuelType] : UNKNOWN;
      }),
    },
    { label: "Consumo declarado", values: vehicles.map((vehicle) => vehicle.specs.fuelConsumption ?? UNKNOWN) },
    {
      label: "Tracción",
      values: vehicles.map((vehicle) => {
        const map: Record<string, string> = { fwd: "Delantera", rwd: "Trasera", awd: "Integral", "4x4": "4x4" };
        return vehicle.specs.drivetrain ? map[vehicle.specs.drivetrain] : UNKNOWN;
      }),
    },
    { label: "Pasajeros", values: vehicles.map((vehicle) => vehicle.specs.passengerCapacity?.toString() ?? UNKNOWN) },
    { label: "Puertas", values: vehicles.map((vehicle) => vehicle.specs.doors?.toString() ?? UNKNOWN) },
    {
      label: "Altura de asiento",
      values: vehicles.map((vehicle) => (vehicle.specs.seatHeight ? `${vehicle.specs.seatHeight} mm` : UNKNOWN)),
    },
    { label: "Peso", values: vehicles.map((vehicle) => (vehicle.specs.weight ? `${vehicle.specs.weight} kg` : UNKNOWN)) },
    {
      label: "Refrigeración",
      values: vehicles.map((vehicle) => (vehicle.specs.cooling ? (vehicle.specs.cooling === "aire" ? "Aire" : "Líquida") : UNKNOWN)),
    },
    { label: "Color", values: vehicles.map((vehicle) => vehicle.specs.color ?? UNKNOWN) },
    {
      label: "Seguridad",
      values: vehicles.map((vehicle) =>
        vehicle.specs.safetyFeatures.length > 0 ? vehicle.specs.safetyFeatures.join(", ") : UNKNOWN,
      ),
    },
    {
      label: "Equipamiento",
      values: vehicles.map((vehicle) => (vehicle.specs.features.length > 0 ? vehicle.specs.features.join(", ") : UNKNOWN)),
    },
  ];
}

/** Estimación mensual comparativa con los mismos supuestos para todos. */
function monthlyReference(vehicle: Vehicle): number {
  const price = vehicle.price;
  const maintenance = price * 0.03;
  const kmPerLiter = (() => {
    const match = vehicle.specs.fuelConsumption?.match(/([\d.,]+)\s*km\/l/i);
    if (match) return Number(match[1].replace(",", "."));
    const cc = vehicle.specs.engineDisplacement ?? 0;
    if (vehicle.vehicleType === "moto") return cc <= 200 ? 38 : cc <= 700 ? 22 : 18;
    return cc <= 1200 ? 14 : cc <= 2000 ? 11 : cc <= 3000 ? 8 : 6;
  })();
  const fuel = (800 / kmPerLiter) * 3900; // 800 km/mes, gasolina a $3.900/L (referencia editable)
  return Math.round(price * 0.02 + maintenance + fuel); // 20% en 60 meses (referencia editable)
}

function interpret(vehicles: Vehicle[]): string[] {
  const lines: string[] = [];
  if (vehicles.length < 2) return lines;

  const cheapest = [...vehicles].sort((a, b) => a.price - b.price)[0];
  const newest = [...vehicles].sort((a, b) => b.year - a.year)[0];
  const lowestMileage = [...vehicles].sort((a, b) => a.mileage - b.mileage)[0];
  const lowestCost = [...vehicles].sort((a, b) => monthlyReference(a) - monthlyReference(b))[0];

  lines.push(
    `Menor precio de compra: ${cheapest.brand} ${cheapest.model} (${formatCOP(cheapest.price)}). Si tu prioridad es el desembolso inicial, es la opción más liviana para tu bolsillo.`,
  );
  lines.push(
    `Año más reciente: ${newest.brand} ${newest.model} (${newest.year}). Un modelo más nuevo suele tener menos años de uso por delante, aunque debe confirmarse su historial.`,
  );
  lines.push(
    `Menor kilometraje declarado: ${lowestMileage.brand} ${lowestMileage.model} (${formatMileage(lowestMileage.mileage)}).`,
  );
  lines.push(
    `Menor costo mensual estimado con los mismos supuestos: ${lowestCost.brand} ${lowestCost.model} (≈ ${formatCOP(monthlyReference(lowestCost))} mensuales de mantenimiento y combustible estimados).`,
  );
  lines.push(
    "Si priorizas equipamiento y seguridad, compara las listas de la fila «Seguridad» y «Equipamiento»: lo que no aparece ahí no está declarado en el anuncio.",
  );
  return lines;
}

export default function CompareTable({ vehicles }: { vehicles: Vehicle[] }) {
  const { compare } = useShop();
  const rows = buildRows(vehicles);
  const conclusions = interpret(vehicles);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Comparación de vehículos seleccionados</caption>
          <thead>
            <tr>
              <th scope="col" className="w-44 border-b border-white/10 p-4 text-left align-bottom text-xs uppercase tracking-wider text-steel">
                Característica
              </th>
              {vehicles.map((vehicle) => (
                <th key={vehicle.id} scope="col" className="border-b border-white/10 p-4 align-bottom">
                  <div className="flex flex-col items-start gap-2">
                    <ImageWithFallback
                      src={vehicle.imageUrls[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="h-28 w-full rounded-xl object-cover"
                    />
                    <ConditionBadge condition={vehicle.condition} />
                    <span className="text-base font-semibold text-white">
                      {vehicle.brand} {vehicle.model}
                    </span>
                    <span className="text-xs text-steel">{vehicle.version}</span>
                    <div className="mt-1 flex gap-1.5">
                      <Link to={vehiclePath(vehicle)} className="btn-ghost !px-3 !py-1.5 !text-xs">
                        Ver ficha
                      </Link>
                      <button
                        type="button"
                        onClick={() => compare.remove(vehicle.id)}
                        aria-label={`Quitar ${vehicle.brand} ${vehicle.model}`}
                        className="flex size-8 items-center justify-center rounded-full border border-white/15 text-steel transition hover:border-red-400 hover:text-red-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const differs = new Set(row.values.map((value) => value ?? UNKNOWN)).size > 1;
              return (
                <tr key={row.label} className="border-b border-white/5">
                  <th scope="row" className="p-4 text-left align-top text-xs font-semibold uppercase tracking-wider text-steel">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${index}`}
                      className={`p-4 align-top ${
                        differs && row.emphasize
                          ? "bg-lime/8 font-semibold text-lime"
                          : differs
                            ? "bg-white/4 text-white/90"
                            : "text-white/70"
                      }`}
                    >
                      {value ?? UNKNOWN}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-b border-white/5">
              <th scope="row" className="p-4 text-left align-top text-xs font-semibold uppercase tracking-wider text-steel">
                Costo mensual estimado
              </th>
              {vehicles.map((vehicle) => (
                <td key={`cost-${vehicle.id}`} className="bg-lime/8 p-4 align-top font-semibold text-lime">
                  ≈ {formatCOP(monthlyReference(vehicle))}
                  <p className="mt-1 text-[11px] font-normal leading-relaxed text-steel">
                    Referencia con 800 km/mes y gasolina a $3.900/L. Incluye mantenimiento (3% del precio al mes) y
                    cuota de referencia del 20% del precio en 60 meses. No incluye seguro, impuestos ni tasas reales.
                  </p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="display text-2xl font-bold text-lime">Qué opción conviene más</h2>
        <ul className="mt-4 space-y-3">
          {conclusions.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-white/85">
              <ArrowLeftRight className="mt-0.5 size-4 shrink-0 text-lime" />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-steel">
          Estas conclusiones se calculan con los datos declarados en cada anuncio. Confirma especificaciones, historial
          y costos reales con el vendedor y un taller antes de decidir.
        </p>
      </section>
    </div>
  );
}
