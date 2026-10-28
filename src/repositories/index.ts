import type { Inquiry, PagedResult, Seller, Vehicle, VehicleFilters, VehicleSubmission, VehicleType } from "@/types/vehicle";
import { applyFilters, sortVehicles } from "@/services/filtering";
import type { InquiryRepository, SellerRepository, SubmissionRepository, VehicleRepository } from "./types";
import {
  demoInquiryRepository,
  demoSellerRepository,
  demoSubmissionRepository,
  demoVehicleRepository,
} from "./demoStore";

/**
 * Adaptador para un proyecto Supabase real (VITE_DATA_MODE=supabase).
 * Usa PostgREST con la clave pública (anon). Las escrituras dependen de las
 * políticas RLS definidas en `supabase/schema.sql`: sin sesión de administrador
 * el servidor las rechazará, que es exactamente lo que buscamos.
 *
 * Este archivo es el único punto que conoce el proveedor: la interfaz de la
 * aplicación no cambia al migrar de demostración a backend real.
 */
const env = import.meta.env;

function config() {
  const url = (env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
  const key = env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return null;
  return { url, key };
}

interface VehicleRow {
  id: string;
  slug: string;
  vehicle_type: "carro" | "moto";
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  currency: string;
  condition: "nuevo" | "usado";
  mileage: number;
  city: string;
  department: string;
  body_type?: string;
  motorcycle_category?: string;
  specs: Vehicle["specs"];
  description: string;
  image_urls: string[];
  seller_id: string;
  listing_status: Vehicle["listingStatus"];
  is_featured: boolean;
  lifestyle_tags: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  verification_notes: string[];
}

function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    slug: row.slug,
    vehicleType: row.vehicle_type,
    brand: row.brand,
    model: row.model,
    version: row.version,
    year: row.year,
    price: row.price,
    currency: "COP",
    condition: row.condition,
    mileage: row.mileage,
    city: row.city,
    department: row.department,
    bodyType: (row.body_type as Vehicle["bodyType"]) ?? undefined,
    motorcycleCategory: (row.motorcycle_category as Vehicle["motorcycleCategory"]) ?? undefined,
    specs: row.specs ?? { safetyFeatures: [], features: [] },
    description: row.description ?? "",
    imageUrls: row.image_urls ?? [],
    sellerId: row.seller_id,
    listingStatus: row.listing_status,
    isFeatured: row.is_featured,
    lifestyleTags: (row.lifestyle_tags ?? []) as Vehicle["lifestyleTags"],
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDemo: false,
    verificationNotes: row.verification_notes ?? [],
  };
}

interface SellerRow {
  id: string;
  name: string;
  type: Seller["type"];
  city: string;
  phone?: string;
  active: boolean;
  created_at: string;
}

function toSeller(row: SellerRow): Seller {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    city: row.city,
    phone: row.phone,
    active: row.active,
    createdAt: row.created_at,
  };
}

interface InquiryRow {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  vehicle_id?: string;
  vehicle_label?: string;
  request_type: Inquiry["requestType"];
  message?: string;
  consent: boolean;
  status: Inquiry["status"];
  source: Inquiry["source"];
}

function toInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    vehicleId: row.vehicle_id,
    vehicleLabel: row.vehicle_label,
    requestType: row.request_type,
    message: row.message,
    consent: row.consent,
    status: row.status,
    source: row.source,
  };
}

interface SubmissionRow {
  id: string;
  created_at: string;
  status: VehicleSubmission["status"];
  vehicle_type: VehicleSubmission["vehicleType"];
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  description: string;
  features: string[];
  photo_count: number;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  published_vehicle_id?: string;
}

function toSubmission(row: SubmissionRow): VehicleSubmission {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    vehicleType: row.vehicle_type,
    brand: row.brand,
    model: row.model,
    version: row.version,
    year: row.year,
    mileage: row.mileage,
    price: row.price,
    city: row.city,
    description: row.description,
    features: row.features ?? [],
    photoCount: row.photo_count,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    publishedVehicleId: row.published_vehicle_id,
  };
}

/** Convierte un Vehicle (camelCase de la app) a las columnas snake_case de la tabla. */
function vehicleToRow(vehicle: Vehicle): Record<string, unknown> {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    vehicle_type: vehicle.vehicleType,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    price: vehicle.price,
    currency: vehicle.currency,
    condition: vehicle.condition,
    mileage: vehicle.mileage,
    city: vehicle.city,
    department: vehicle.department,
    body_type: vehicle.bodyType ?? null,
    motorcycle_category: vehicle.motorcycleCategory ?? null,
    specs: vehicle.specs,
    description: vehicle.description,
    image_urls: vehicle.imageUrls,
    seller_id: vehicle.sellerId,
    listing_status: vehicle.listingStatus,
    is_featured: vehicle.isFeatured,
    lifestyle_tags: vehicle.lifestyleTags,
    published_at: vehicle.publishedAt ?? null,
    created_at: vehicle.createdAt,
    updated_at: vehicle.updatedAt,
    verification_notes: vehicle.verificationNotes,
  };
}

const VEHICLE_PATCH_COLUMNS: Record<string, string> = {
  slug: "slug",
  vehicleType: "vehicle_type",
  brand: "brand",
  model: "model",
  version: "version",
  year: "year",
  price: "price",
  currency: "currency",
  condition: "condition",
  mileage: "mileage",
  city: "city",
  department: "department",
  bodyType: "body_type",
  motorcycleCategory: "motorcycle_category",
  specs: "specs",
  description: "description",
  imageUrls: "image_urls",
  sellerId: "seller_id",
  listingStatus: "listing_status",
  isFeatured: "is_featured",
  lifestyleTags: "lifestyle_tags",
  publishedAt: "published_at",
  verificationNotes: "verification_notes",
};

function vehiclePatchToRow(patch: Partial<Vehicle>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const column = VEHICLE_PATCH_COLUMNS[key];
    if (column && value !== undefined) row[column] = value;
  }
  row.updated_at = new Date().toISOString();
  return row;
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = config();
  if (!cfg) throw new Error("Supabase no está configurado (faltan VITE_SUPABASE_URL / ANON_KEY).");
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase respondió ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

export const supabaseVehicleRepository: VehicleRepository = {
  async list(filters: VehicleFilters, pageSize = 9): Promise<PagedResult<Vehicle>> {
    const params = new URLSearchParams({
      listing_status: "eq.publicado",
      order: "created_at.desc",
      limit: "1000",
    });
    if (filters.vehicleType) params.set("vehicle_type", `eq.${filters.vehicleType}`);
    const rows = await rest<VehicleRow[]>(`vehicles?${params.toString()}`);
    const filtered = sortVehicles(applyFilters(rows.map(toVehicle), filters), filters.sort);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const start = (page - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), total, page, pageSize, totalPages };
  },
  async bySlug(slug) {
    const rows = await rest<VehicleRow[]>(`vehicles?slug=eq.${encodeURIComponent(slug)}&limit=1`);
    return rows[0] ? toVehicle(rows[0]) : null;
  },
  async byId(id) {
    const rows = await rest<VehicleRow[]>(`vehicles?id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows[0] ? toVehicle(rows[0]) : null;
  },
  async featured(limit = 8) {
    const rows = await rest<VehicleRow[]>(
      `vehicles?listing_status=eq.publicado&is_featured=eq.true&limit=${limit}`,
    );
    return rows.map(toVehicle);
  },
  async similar(vehicle, limit = 6) {
    const rows = await rest<VehicleRow[]>(
      `vehicles?listing_status=eq.publicado&vehicle_type=eq.${vehicle.vehicleType}&limit=200`,
    );
    const items = rows.map(toVehicle).filter((item) => item.id !== vehicle.id);
    return items.slice(0, limit);
  },
  async facets(vehicleType?: VehicleType) {
    const typeQuery = vehicleType ? `&vehicle_type=eq.${vehicleType}` : "";
    const rows = await rest<VehicleRow[]>(`vehicles?listing_status=eq.publicado&select=brand,model,city${typeQuery}`);
    const unique = (key: "brand" | "model" | "city") =>
      Array.from(new Set(rows.map((row) => row[key]))).sort((a, b) => a.localeCompare(b, "es"));
    return { brands: unique("brand"), models: unique("model"), cities: unique("city") };
  },
  async save(vehicle) {
    const rows = await rest<VehicleRow[]>("vehicles", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(vehicleToRow(vehicle)),
    });
    return rows[0] ? toVehicle(rows[0]) : vehicle;
  },
  async update(id, patch) {
    const rows = await rest<VehicleRow[]>(`vehicles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(vehiclePatchToRow(patch)),
    });
    return rows[0] ? toVehicle(rows[0]) : null;
  },
  async remove(id) {
    await rest<unknown>(`vehicles?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  },
};

/** Solo lectura: los vendedores se administran desde el panel con RLS. */
export const supabaseSellerRepository: SellerRepository = {
  async list() {
    const rows = await rest<SellerRow[]>("sellers?active=eq.true&order=name.asc");
    return rows.map(toSeller);
  },
  async byId(id) {
    const rows = await rest<SellerRow[]>(`sellers?id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows[0] ? toSeller(rows[0]) : null;
  },
  async save(seller) {
    const rows = await rest<SellerRow[]>("sellers", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id: seller.id,
        name: seller.name,
        type: seller.type,
        city: seller.city,
        phone: seller.phone ?? null,
        active: seller.active,
        created_at: seller.createdAt,
      }),
    });
    return rows[0] ? toSeller(rows[0]) : seller;
  },
  async update(id, patch) {
    const body: Record<string, unknown> = {};
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.type !== undefined) body.type = patch.type;
    if (patch.city !== undefined) body.city = patch.city;
    if (patch.phone !== undefined) body.phone = patch.phone || null;
    if (patch.active !== undefined) body.active = patch.active;
    const rows = await rest<SellerRow[]>(`sellers?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(body),
    });
    return rows[0] ? toSeller(rows[0]) : null;
  },
};

export const supabaseInquiryRepository: InquiryRepository = {
  async list() {
    const rows = await rest<InquiryRow[]>("inquiries?order=created_at.desc");
    return rows.map(toInquiry);
  },
  async create(input) {
    const rows = await rest<InquiryRow[]>("inquiries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        city: input.city,
        vehicle_id: input.vehicleId ?? null,
        vehicle_label: input.vehicleLabel ?? null,
        request_type: input.requestType,
        message: input.message ?? null,
        consent: input.consent,
        source: input.source,
      }),
    });
    return rows[0]
      ? toInquiry(rows[0])
      : { ...input, id: "", createdAt: new Date().toISOString(), status: "nuevo" };
  },
  async updateStatus(id, status) {
    await rest(`inquiries?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return null;
  },
};

export const supabaseSubmissionRepository: SubmissionRepository = {
  async list() {
    const rows = await rest<SubmissionRow[]>("vehicle_submissions?order=created_at.desc");
    return rows.map(toSubmission);
  },
  async create(input) {
    const rows = await rest<SubmissionRow[]>("vehicle_submissions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        vehicle_type: input.vehicleType,
        brand: input.brand,
        model: input.model,
        version: input.version,
        year: input.year,
        mileage: input.mileage,
        price: input.price,
        city: input.city,
        description: input.description,
        features: input.features,
        photo_count: input.photoCount,
        contact_name: input.contactName,
        contact_phone: input.contactPhone,
        contact_email: input.contactEmail ?? null,
      }),
    });
    return rows[0]
      ? toSubmission(rows[0])
      : { ...input, id: "", createdAt: new Date().toISOString(), status: "pendiente" };
  },
  async review(id, status, vehicleId) {
    await rest(`vehicle_submissions?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status, published_vehicle_id: vehicleId ?? null }),
    });
    return null;
  },
};

const supabaseConfigured = Boolean(config());

export const vehicleRepository: VehicleRepository = supabaseConfigured
  ? supabaseVehicleRepository
  : demoVehicleRepository;

export const sellerRepository: SellerRepository = supabaseConfigured
  ? supabaseSellerRepository
  : demoSellerRepository;

export const inquiryRepository: InquiryRepository = supabaseConfigured
  ? supabaseInquiryRepository
  : demoInquiryRepository;

export const submissionRepository: SubmissionRepository = supabaseConfigured
  ? supabaseSubmissionRepository
  : demoSubmissionRepository;

export const usingSupabase = supabaseConfigured;
