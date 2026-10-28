import type {
  Condition,
  LifestyleId,
  ListingStatus,
  Vehicle,
  VehicleSpecs,
  VehicleType,
} from "@/types/vehicle";

export interface SeedInput {
  slug: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  condition: Condition;
  mileage: number;
  city: string;
  department: string;
  bodyType?: Vehicle["bodyType"];
  motorcycleCategory?: Vehicle["motorcycleCategory"];
  specs: VehicleSpecs;
  description: string;
  /** Número de fotografías descargadas para este anuncio (1..3). */
  images: number;
  sellerId: string;
  isFeatured?: boolean;
  lifestyleTags: LifestyleId[];
  verificationNotes: string[];
  listingStatus?: ListingStatus;
  publishedAt?: string;
}

const BASE_DATE = "2026-09-15T09:00:00.000Z";

/**
 * Construye un vehículo de demostración con los campos por defecto.
 * Todos los registros generados quedan marcados con `isDemo: true`.
 */
export function seed(input: SeedInput): Vehicle {
  const imageUrls = Array.from(
    { length: input.images },
    (_, index) => `/images/vehicles/${input.slug}-${index + 1}.jpg`,
  );
  return {
    id: input.slug,
    slug: input.slug,
    vehicleType: input.vehicleType,
    brand: input.brand,
    model: input.model,
    version: input.version,
    year: input.year,
    price: input.price,
    currency: "COP",
    condition: input.condition,
    mileage: input.mileage,
    city: input.city,
    department: input.department,
    bodyType: input.bodyType,
    motorcycleCategory: input.motorcycleCategory,
    specs: {
      ...input.specs,
      safetyFeatures: input.specs.safetyFeatures ?? [],
      features: input.specs.features ?? [],
    },
    description: input.description,
    imageUrls,
    sellerId: input.sellerId,
    listingStatus: input.listingStatus ?? "publicado",
    isFeatured: input.isFeatured ?? false,
    lifestyleTags: input.lifestyleTags,
    publishedAt: input.publishedAt ?? BASE_DATE,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    isDemo: true,
    verificationNotes: input.verificationNotes,
  };
}

export const STANDARD_CAR_CHECKS = [
  "Service y historial de mantenimiento en concesionario o taller certificado.",
  "Estado de papeles: SOAT, tecnomecánica (TMPO) y eventual infracción o gravamen.",
  "Revisión de carrocería y pintura por golpes o reparaciones previas.",
];

export const STANDARD_MOTO_CHECKS = [
  "Kilometraje real versus el indicado en el tablero y el estado de la cadena/banda.",
  "Documentos al día: SOAT, tecnomecánica de motocicletas y tarjeta de propiedad.",
  "Estado de neumáticos, frenos y suspensiones antes de negociar el precio.",
];
