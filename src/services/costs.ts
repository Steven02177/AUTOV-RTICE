import type { Vehicle } from "@/types/vehicle";

/** Parámetros editables de la calculadora orientativa de costos. */
export interface CostInput {
  /** Porcentaje de cuota inicial (0-100). */
  downPaymentPercent: number;
  /** Tasa de interés anual (%) que el usuario declara haber cotizado. */
  annualRatePercent: number;
  /** Plazo en meses. */
  months: number;
  /** Kilómetros que recorre al mes. */
  monthlyKm: number;
  /** Precio por litro de combustible que el usuario cotizó. */
  fuelPricePerLiter: number;
  /** Costo mensual de seguro cotizado por el usuario. */
  insuranceMonthly: number;
}

export interface CostEstimate {
  downPayment: number;
  financedAmount: number;
  monthlyPayment: number;
  totalToPay: number;
  fuelMonthly?: number;
  /** Reserva mensual sugerida para mantenimiento (orientativa). */
  maintenanceMonthly: number;
  insuranceMonthly: number;
  monthlyTotal?: number;
  notes: string[];
}

/** Km por litro estimados cuando el anuncio no informa consumo. */
function estimatedKmPerLiter(vehicle: Vehicle): number | undefined {
  const declared = vehicle.specs.fuelConsumption?.match(/([\d.,]+)\s*km\/l/i);
  if (declared) return Number(declared[1].replace(",", "."));
  if (!vehicle.specs.engineDisplacement) return undefined;
  if (vehicle.vehicleType === "moto") {
    if (vehicle.specs.engineDisplacement <= 125) return 45;
    if (vehicle.specs.engineDisplacement <= 200) return 38;
    if (vehicle.specs.engineDisplacement <= 300) return 30;
    if (vehicle.specs.engineDisplacement <= 700) return 22;
    return 18;
  }
  if (vehicle.specs.engineDisplacement <= 1200) return 14;
  if (vehicle.specs.engineDisplacement <= 2000) return 11;
  if (vehicle.specs.engineDisplacement <= 3000) return 8;
  return 6;
}

/**
 * Estimación orientativa. Los únicos valores exactos son los ingresados por el
 * usuario y el precio del anuncio: todo lo demás es cálculo con supuestos.
 */
export function estimateCosts(vehicle: Vehicle, input: CostInput): CostEstimate {
  const notes: string[] = [];
  const downPaymentRatio = Math.min(Math.max(input.downPaymentPercent, 0), 100) / 100;
  const downPayment = Math.round(vehicle.price * downPaymentRatio);
  const financedAmount = Math.max(vehicle.price - downPayment, 0);
  const months = Math.max(input.months, 1);
  const monthlyRate = Math.max(input.annualRatePercent, 0) / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = financedAmount / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (financedAmount * monthlyRate * factor) / (factor - 1);
  }
  if (!Number.isFinite(monthlyPayment)) monthlyPayment = 0;

  const kmPerLiter = estimatedKmPerLiter(vehicle);
  let fuelMonthly: number | undefined;
  if (kmPerLiter && input.fuelPricePerLiter > 0) {
    fuelMonthly = Math.round((input.monthlyKm / kmPerLiter) * input.fuelPricePerLiter);
    if (!vehicle.specs.fuelConsumption) {
      notes.push("El consumo usado en el cálculo es una estimación por cilindraje: el anuncio no informa consumo declarado.");
    }
  } else {
    notes.push("Falta el precio del combustible para estimar el gasto mensual de combustible.");
  }

  // Reserva orientativa: 3% del precio de compra al mes para mantenimiento.
  const maintenanceMonthly = Math.round(vehicle.price * 0.03);

  if (vehicle.listingStatus !== "publicado") notes.push("Este anuncio no está publicado actualmente.");
  notes.push("Las tasas, seguros, impuestos y costos reales deben confirmarse con una entidad financiera y un taller.");

  return {
    downPayment,
    financedAmount,
    monthlyPayment: Math.round(monthlyPayment),
    totalToPay: Math.round(monthlyPayment * months) + downPayment,
    fuelMonthly,
    maintenanceMonthly,
    insuranceMonthly: Math.round(input.insuranceMonthly),
    monthlyTotal:
      fuelMonthly !== undefined
        ? Math.round(monthlyPayment + fuelMonthly + maintenanceMonthly + input.insuranceMonthly)
        : undefined,
    notes,
  };
}
