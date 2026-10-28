import type {
  Inquiry,
  InquiryType,
  ListingStatus,
  PagedResult,
  Seller,
  SellerType,
  Vehicle,
  VehicleFilters,
  VehicleSubmission,
  VehicleType,
} from "@/types/vehicle";

export interface VehicleRepository {
  list(filters: VehicleFilters, pageSize?: number): Promise<PagedResult<Vehicle>>;
  bySlug(slug: string): Promise<Vehicle | null>;
  byId(id: string): Promise<Vehicle | null>;
  featured(limit?: number): Promise<Vehicle[]>;
  similar(vehicle: Vehicle, limit?: number): Promise<Vehicle[]>;
  facets(vehicleType?: VehicleType): Promise<{ brands: string[]; models: string[]; cities: string[] }>;
  save(vehicle: Vehicle): Promise<Vehicle>;
  update(id: string, patch: Partial<Vehicle>): Promise<Vehicle | null>;
  remove(id: string): Promise<boolean>;
}

export interface SellerRepository {
  list(): Promise<Seller[]>;
  byId(id: string): Promise<Seller | null>;
  save(seller: Seller): Promise<Seller>;
  update(id: string, patch: Partial<Seller>): Promise<Seller | null>;
}

export interface InquiryRepository {
  list(): Promise<Inquiry[]>;
  create(input: Omit<Inquiry, "id" | "createdAt" | "status">): Promise<Inquiry>;
  updateStatus(id: string, status: Inquiry["status"]): Promise<Inquiry | null>;
}

export interface SubmissionRepository {
  list(): Promise<VehicleSubmission[]>;
  create(input: Omit<VehicleSubmission, "id" | "createdAt" | "status">): Promise<VehicleSubmission>;
  review(
    id: string,
    status: Extract<VehicleSubmission["status"], "aprobado" | "rechazado">,
    vehicleId?: string,
  ): Promise<VehicleSubmission | null>;
}

export type { ListingStatus, SellerType, InquiryType };
