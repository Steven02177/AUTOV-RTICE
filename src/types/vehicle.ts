export type VehicleType = "carro" | "moto";
export type Condition = "nuevo" | "usado";
export type ListingStatus = "publicado" | "pendiente" | "rechazado" | "vendido" | "desactivado";
export type SellerType = "particular" | "concesionario" | "empresa";
export type Currency = "COP";

export type CarBodyType =
  | "sedan"
  | "hatchback"
  | "suv"
  | "pickup"
  | "familiar"
  | "deportivo"
  | "coupe"
  | "furgoneta";

export type MotorcycleCategory =
  | "urbana"
  | "deportiva"
  | "touring"
  | "doble-proposito"
  | "scooter"
  | "trabajo"
  | "naked"
  | "cruiser";

export type FuelType = "gasolina" | "diesel" | "electrico" | "hibrido" | "gnv";
export type Transmission = "manual" | "automatica" | "cvt" | "semiautomatica";
export type Drivetrain = "fwd" | "rwd" | "awd" | "4x4";
export type Cooling = "aire" | "liquida";

/** Estilos de vida usados por el asistente de recomendaciones. */
export type LifestyleId =
  | "primer-vehiculo"
  | "estudiantes"
  | "commuting"
  | "familias"
  | "emprendedores"
  | "viajes-largos"
  | "deportivo"
  | "economico"
  | "carga"
  | "aventura";

export interface VehicleSpecs {
  /** Cilindraje en cc (carros: capacidad del motor en cc equivalente). */
  engineDisplacement?: number;
  /** Texto libre cuando el dato existe en la fuente del anuncio. */
  enginePower?: string;
  torque?: string;
  fuelType?: FuelType;
  transmission?: Transmission;
  drivetrain?: Drivetrain;
  /** Ej.: "14,2 km/l - dato declarado por el vendedor". */
  fuelConsumption?: string;
  passengerCapacity?: number;
  doors?: number;
  /** Altura de asiento en mm (motos). */
  seatHeight?: number;
  /** Peso en kg. */
  weight?: number;
  cooling?: Cooling;
  color?: string;
  safetyFeatures: string[];
  features: string[];
}

export interface Seller {
  id: string;
  name: string;
  type: SellerType;
  city: string;
  /** Teléfono/WhatsApp en formato internacional sin signos. Vacío = no informado. */
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  currency: Currency;
  condition: Condition;
  mileage: number;
  city: string;
  department: string;
  bodyType?: CarBodyType;
  motorcycleCategory?: MotorcycleCategory;
  specs: VehicleSpecs;
  description: string;
  imageUrls: string[];
  sellerId: string;
  listingStatus: ListingStatus;
  isFeatured: boolean;
  /** Etiquetas de uso que el vendedor/asistente considera aplicables. */
  lifestyleTags: LifestyleId[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** true cuando el registro proviene del catálogo de demostración. */
  isDemo: boolean;
  /** Observaciones del asistente (qué verificar antes de comprar). */
  verificationNotes: string[];
}

export type SortKey =
  | "precio-asc"
  | "precio-desc"
  | "anio-desc"
  | "km-asc"
  | "km-desc"
  | "recientes";

export interface VehicleFilters {
  q?: string;
  vehicleType?: VehicleType;
  brands: string[];
  models: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  conditions: Condition[];
  cities: string[];
  sellerTypes: SellerType[];
  mileageMax?: number;
  featured?: boolean;
  /** Estados que se muestran en el catálogo público por defecto. */
  statuses: ListingStatus[];
  bodyTypes: CarBodyType[];
  motorcycleCategories: MotorcycleCategory[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  displacementMin?: number;
  displacementMax?: number;
  doors?: number;
  passengerCapacity?: number;
  drivetrains: Drivetrain[];
  coolings: Cooling[];
  seatHeightMax?: number;
  weightMax?: number;
  sort: SortKey;
  page: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  vehicleId?: string;
  vehicleLabel?: string;
  requestType: InquiryType;
  message?: string;
  consent: boolean;
  status: "nuevo" | "contactado" | "cerrado";
  source: "contacto" | "ficha-vehiculo" | "publicacion" | "prueba-manejo" | "financiacion";
}

export type InquiryType =
  | "consulta-vehiculo"
  | "prueba-manejo"
  | "informacion-adicional"
  | "financiacion"
  | "publicar-vehiculo"
  | "asesoria";

export interface VehicleSubmission {
  id: string;
  createdAt: string;
  status: "pendiente" | "aprobado" | "rechazado";
  vehicleType: VehicleType;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  description: string;
  features: string[];
  photoCount: number;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  /** Identificador del vehículo publicado tras la aprobación (modo demo). */
  publishedVehicleId?: string;
}

export interface RecommendationAnswer {
  vehicleType?: VehicleType;
  budget?: number;
  condition?: Condition;
  mainUse?: LifestyleId;
  passengers?: number;
  terrain?: "ciudad" | "carretera" | "mixto" | "terrenos-dificiles";
  runningCostImportance?: "alta" | "media" | "baja";
  transmission?: Transmission;
  favoriteBrands: string[];
  mustHaves: string[];
}

export interface Recommendation {
  vehicle: Vehicle;
  score: number;
  maxScore: number;
  percentage: number;
  reasons: string[];
  drawbacks: string[];
  verify: string[];
}
