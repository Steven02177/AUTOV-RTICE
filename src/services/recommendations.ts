import type { LifestyleId, Recommendation, RecommendationAnswer, Vehicle } from "@/types/vehicle";
import { getLifestyle } from "@/data/lifestyles";

/**
 * Motor de recomendaciones determinista y explicable.
 * Cada punto asignado proviene de un dato concreto del anuncio o de una
 * respuesta del usuario; no hay afirmaciones sin respaldo en el catálogo.
 */

const WEIGHTS = {
  budget: 30,
  vehicleType: 15,
  condition: 10,
  lifestyle: 20,
  passengers: 8,
  terrain: 12,
  runningCost: 12,
  transmission: 8,
  brands: 5,
  mustHaves: 10,
} as const;

const MAX_SCORE = Object.values(WEIGHTS).reduce((sum, value) => sum + value, 0);

function consumptionKmPerLiter(vehicle: Vehicle): number | undefined {
  const match = vehicle.specs.fuelConsumption?.match(/([\d.,]+)\s*km\/l/i);
  if (match) return Number(match[1].replace(",", "."));
  return undefined;
}

function efficiencyPoints(vehicle: Vehicle): number {
  const declared = consumptionKmPerLiter(vehicle);
  if (declared) return Math.min(declared / 45, 1);
  const cc = vehicle.specs.engineDisplacement ?? 0;
  if (!cc) return 0.5;
  if (vehicle.vehicleType === "moto") return Math.max(0, 1 - cc / 900);
  return Math.max(0, 1 - cc / 3500);
}

function fitsTerrain(vehicle: Vehicle, terrain: RecommendationAnswer["terrain"]): boolean {
  if (!terrain || terrain === "mixto") return true;
  const body = vehicle.bodyType;
  const category = vehicle.motorcycleCategory;
  const drivetrain = vehicle.specs.drivetrain;

  if (vehicle.vehicleType === "moto") {
    if (terrain === "ciudad") return ["urbana", "scooter", "naked", "trabajo"].includes(category ?? "");
    if (terrain === "carretera") return ["touring", "deportiva", "naked", "cruiser", "doble-proposito"].includes(category ?? "");
    return category === "doble-proposito" || category === "touring";
  }

  if (terrain === "ciudad") return ["hatchback", "sedan", "suv", "coupe"].includes(body ?? "");
  if (terrain === "carretera") return ["sedan", "suv", "familiar", "pickup", "coupe", "deportivo"].includes(body ?? "");
  if (body === "pickup" || body === "suv") return drivetrain === "4x4" || drivetrain === "awd" || body === "pickup";
  return false;
}

interface Scored {
  score: number;
  reasons: string[];
  drawbacks: string[];
}

function scoreVehicle(vehicle: Vehicle, answers: RecommendationAnswer): Scored {
  const reasons: string[] = [];
  const drawbacks: string[] = [];
  let score = 0;

  // 1. Presupuesto (30)
  if (answers.budget !== undefined) {
    if (vehicle.price <= answers.budget) {
      score += WEIGHTS.budget;
      reasons.push("Está dentro del presupuesto que indicaste.");
    } else if (vehicle.price <= answers.budget * 1.1) {
      score += Math.round(WEIGHTS.budget * 0.4);
      drawbacks.push(`Super tu presupuesto en ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(vehicle.price - answers.budget)}.`);
    } else {
      drawbacks.push("Está por encima del presupuesto que indicaste.");
    }
  }

  // 2. Tipo de vehículo (15)
  if (answers.vehicleType) {
    if (vehicle.vehicleType === answers.vehicleType) {
      score += WEIGHTS.vehicleType;
    } else {
      drawbacks.push(`Es ${vehicle.vehicleType === "carro" ? "un carro" : "una moto"} y pediste ${answers.vehicleType === "carro" ? "carro" : "moto"}.`);
    }
  }

  // 3. Condición (10)
  if (answers.condition) {
    if (vehicle.condition === answers.condition) score += WEIGHTS.condition;
    else drawbacks.push(`Está en estado ${vehicle.condition}.`);
  }

  // 4. Uso principal / estilo de vida (20)
  if (answers.mainUse) {
    const profile = getLifestyle(answers.mainUse);
    const direct = vehicle.lifestyleTags.includes(answers.mainUse);
    const related = profile?.tags.some((tag) => vehicle.lifestyleTags.includes(tag)) ?? false;
    if (direct) {
      score += WEIGHTS.lifestyle;
      if (profile) reasons.push(`Se alinea con tu caso de uso: ${profile.label.toLowerCase()}.`);
    } else if (related) {
      score += Math.round(WEIGHTS.lifestyle * 0.6);
    } else {
      score += Math.round(WEIGHTS.lifestyle * 0.2);
    }
  }

  // 5. Capacidad de pasajeros (8)
  if (answers.passengers !== undefined) {
    const capacity = vehicle.specs.passengerCapacity ?? (vehicle.vehicleType === "moto" ? 2 : 0);
    if (capacity >= answers.passengers) {
      score += WEIGHTS.passengers;
      if (vehicle.vehicleType === "carro") {
        reasons.push(`Según el anuncio, tiene capacidad para ${capacity} pasajeros.`);
      }
    } else {
      drawbacks.push(`Capacidad declarada: ${capacity} pasajeros; necesitas ${answers.passengers}.`);
    }
  }

  // 6. Terreno (12)
  if (answers.terrain) {
    if (fitsTerrain(vehicle, answers.terrain)) {
      score += WEIGHTS.terrain;
      if (answers.terrain !== "mixto") reasons.push(`Su configuración es compatible con uso en ${answers.terrain.replace("-", " ")}.`);
    } else {
      drawbacks.push(`No es la configuración más adecuada para ${answers.terrain.replace("-", " ")}.`);
    }
  }

  // 7. Costos de uso (12)
  if (answers.runningCostImportance) {
    const efficiency = efficiencyPoints(vehicle);
    if (answers.runningCostImportance === "alta") {
      score += Math.round(WEIGHTS.runningCost * efficiency);
      const declared = consumptionKmPerLiter(vehicle);
      if (declared) reasons.push(`Declara un consumo de ${declared} km/l.`);
      else if (efficiency >= 0.6) reasons.push("Su cilindraje sugiere costos de combustible contenidos.");
      else drawbacks.push("No informa consumo declarado y su cilindraje sugiere un gasto moderado o alto.");
    } else if (answers.runningCostImportance === "media") {
      score += Math.round(WEIGHTS.runningCost * (0.5 + efficiency / 2));
    } else {
      score += Math.round(WEIGHTS.runningCost * 0.5);
    }
  }

  // 8. Transmisión (8)
  if (answers.transmission && vehicle.specs.transmission) {
    if (vehicle.specs.transmission === answers.transmission) {
      score += WEIGHTS.transmission;
      reasons.push(`Tiene la transmisión ${answers.transmission === "automatica" ? "automática" : "mecánica"} que pediste.`);
    } else {
      drawbacks.push(`Su transmisión es ${vehicle.specs.transmission === "automatica" ? "automática" : vehicle.specs.transmission === "manual" ? "mecánica" : vehicle.specs.transmission}.`);
    }
  }

  // 9. Marcas favoritas (5)
  if (answers.favoriteBrands.length > 0) {
    if (answers.favoriteBrands.some((brand) => brand.toLowerCase() === vehicle.brand.toLowerCase())) {
      score += WEIGHTS.brands;
      reasons.push("Es de una de tus marcas favoritas.");
    }
  }

  // 10. Características indispensables (10)
  if (answers.mustHaves.length > 0) {
    const haystack = [
      vehicle.description,
      ...vehicle.specs.features,
      ...vehicle.specs.safetyFeatures,
      vehicle.bodyType ?? "",
      vehicle.motorcycleCategory ?? "",
      vehicle.specs.transmission ?? "",
      vehicle.specs.fuelType ?? "",
      vehicle.specs.drivetrain ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const hits = answers.mustHaves.filter((needle) => haystack.includes(needle.toLowerCase().trim()));
    if (hits.length > 0) {
      score += Math.round((hits.length / answers.mustHaves.length) * WEIGHTS.mustHaves);
      reasons.push(`Incluye características que pediste: ${hits.join(", ")}.`);
    } else {
      drawbacks.push("El anuncio no menciona las características indispensables que indicaste.");
    }
  }

  return { score, reasons, drawbacks };
}

function collectLimitingFactors(answers: RecommendationAnswer, pool: Vehicle[], matched: number): string[] {
  if (matched >= 3) return [];
  const factors: string[] = [];
  // Universo vacío tras el filtro duro de tipo: hay que decirlo de forma explícita.
  if (pool.length === 0) {
    if (answers.vehicleType) {
      factors.push(
        `no hay ${answers.vehicleType === "carro" ? "carros" : "motos"} publicados en el catálogo que cumplan tus criterios`,
      );
    } else {
      factors.push("no hay vehículos publicados que cumplan tus criterios");
    }
    return factors;
  }
  const budget = answers.budget;
  const passengers = answers.passengers;
  if (budget !== undefined) {
    const withinBudget = pool.filter((vehicle) => vehicle.price <= budget).length;
    if (withinBudget === 0) factors.push("ningún vehículo del catálogo entra en tu presupuesto");
    else if (withinBudget < 3) factors.push("pocos vehículos entran en tu presupuesto");
  }
  if (answers.vehicleType) {
    const sameType = pool.filter((vehicle) => vehicle.vehicleType === answers.vehicleType).length;
    if (sameType === 0) factors.push(`no hay ${answers.vehicleType === "carro" ? "carros" : "motos"} publicados`);
  }
  if (answers.condition) {
    const sameCondition = pool.filter((vehicle) => vehicle.condition === answers.condition).length;
    if (sameCondition === 0) factors.push(`no hay vehículos ${answers.condition}s publicados`);
  }
  if (answers.transmission) {
    const sameTransmission = pool.filter((vehicle) => vehicle.specs.transmission === answers.transmission).length;
    if (sameTransmission === 0) factors.push("no hay vehículos con esa transmisión");
  }
  if (passengers !== undefined) {
    const capacity = pool.filter((vehicle) => (vehicle.specs.passengerCapacity ?? 2) >= passengers).length;
    if (capacity === 0) factors.push("ningún vehículo alcanza la capacidad de pasajeros pedida");
  }
  if (answers.terrain && answers.terrain !== "mixto") {
    const terrain = answers.terrain;
    const terrainFit = pool.filter((vehicle) => fitsTerrain(vehicle, terrain)).length;
    if (terrainFit === 0) factors.push("ningún vehículo coincide con el terreno indicado");
  }
  return factors;
}

export interface RecommendationResult {
  results: Recommendation[];
  limitingFactors: string[];
  budgetAlternatives: Vehicle[];
  scoredCount: number;
}

export function recommend(
  pool: Vehicle[],
  answers: RecommendationAnswer,
  limit = 3,
): RecommendationResult {
  const eligible = pool.filter((vehicle) => vehicle.listingStatus === "publicado");
  // El tipo de vehículo es un filtro duro: si el usuario pidió carro, jamás se
  // recomienda una moto (y viceversa), aunque puntúe bien en otros criterios.
  const universe = answers.vehicleType
    ? eligible.filter((vehicle) => vehicle.vehicleType === answers.vehicleType)
    : eligible;

  const scored = universe
    .map((vehicle) => ({ vehicle, ...scoreVehicle(vehicle, answers) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.vehicle.price - b.vehicle.price);

  const results: Recommendation[] = scored.slice(0, limit).map((entry) => ({
    vehicle: entry.vehicle,
    score: entry.score,
    maxScore: MAX_SCORE,
    percentage: Math.min(99, Math.max(1, Math.round((entry.score / MAX_SCORE) * 100))),
    reasons: entry.reasons.slice(0, 4),
    drawbacks: entry.drawbacks.slice(0, 3),
    verify: entry.vehicle.verificationNotes.slice(0, 4),
  }));

  const budget = answers.budget;
  // Las alternativas por presupuesto también respetan el tipo pedido.
  const budgetAlternatives =
    budget !== undefined
      ? universe
          .filter((vehicle) => vehicle.price > budget)
          .sort((a, b) => a.price - b.price)
          .slice(0, 3)
      : [];

  return {
    results,
    limitingFactors: collectLimitingFactors(answers, universe, results.length),
    budgetAlternatives:
      results.length >= limit ? [] : budgetAlternatives,
    scoredCount: scored.length,
  };
}

/** Etiqueta legible de la respuesta de uso principal. */
export function mainUseLabel(id?: LifestyleId): string | undefined {
  return getLifestyle(id)?.label;
}
