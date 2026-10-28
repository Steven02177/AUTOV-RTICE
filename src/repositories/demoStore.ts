import { DEMO_SELLERS } from "@/data/sellers";
import { DEMO_VEHICLES } from "@/data/vehicles";
import { applyFilters, simulateLatency, sortVehicles } from "@/services/filtering";
import type {
  Inquiry,
  PagedResult,
  Seller,
  Vehicle,
  VehicleFilters,
  VehicleSubmission,
  VehicleType,
} from "@/types/vehicle";
import { STORAGE_KEYS, readJSON, writeJSON } from "./localStore";
import type {
  InquiryRepository,
  SellerRepository,
  SubmissionRepository,
  VehicleRepository,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Estado local (solo modo demostración)                              */
/* ------------------------------------------------------------------ */

const getLocalVehicles = () => readJSON<Vehicle[]>(STORAGE_KEYS.vehicles, []);
const getLocalSellers = () => readJSON<Seller[]>(STORAGE_KEYS.sellers, []);

function mergeById<T extends { id: string }>(base: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.id, item);
  for (const item of local) map.set(item.id, item);
  return Array.from(map.values());
}

/** Catálogo completo: semilla de demostración + anuncios creados/editados localmente. */
export function getAllVehicles(): Vehicle[] {
  return mergeById(DEMO_VEHICLES, getLocalVehicles());
}

export function getAllSellers(): Seller[] {
  return mergeById(DEMO_SELLERS, getLocalSellers());
}

export function getSellerSync(id: string): Seller | undefined {
  return getAllSellers().find((seller) => seller.id === id);
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const PAGE_SIZE = 9;

/* ------------------------------------------------------------------ */
/*  Repositorio de vehículos                                           */
/* ------------------------------------------------------------------ */

export const demoVehicleRepository: VehicleRepository = {
  async list(filters: VehicleFilters, pageSize = PAGE_SIZE): Promise<PagedResult<Vehicle>> {
    const sellers = new Map(getAllSellers().map((seller) => [seller.id, seller]));
    const filtered = applyFilters(getAllVehicles(), filters, {
      sellerTypeOf: (vehicle) => sellers.get(vehicle.sellerId)?.type,
    });
    const ordered = sortVehicles(filtered, filters.sort);
    const total = ordered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const start = (page - 1) * pageSize;
    return simulateLatency({
      items: ordered.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    });
  },

  async bySlug(slug: string) {
    const vehicle = getAllVehicles().find((item) => item.slug === slug) ?? null;
    return simulateLatency(vehicle, 120);
  },

  async byId(id: string) {
    const vehicle = getAllVehicles().find((item) => item.id === id) ?? null;
    return simulateLatency(vehicle, 80);
  },

  async featured(limit = 8) {
    const items = getAllVehicles()
      .filter((vehicle) => vehicle.isFeatured && vehicle.listingStatus === "publicado")
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, limit);
    return simulateLatency(items, 220);
  },

  async similar(vehicle: Vehicle, limit = 6) {
    const scored = getAllVehicles()
      .filter((candidate) => candidate.id !== vehicle.id && candidate.listingStatus === "publicado")
      .filter((candidate) => candidate.vehicleType === vehicle.vehicleType)
      .map((candidate) => {
        let score = 0;
        if (candidate.bodyType && candidate.bodyType === vehicle.bodyType) score += 3;
        if (candidate.motorcycleCategory && candidate.motorcycleCategory === vehicle.motorcycleCategory) score += 3;
        if (candidate.brand === vehicle.brand) score += 1;
        const priceGap = Math.abs(candidate.price - vehicle.price) / Math.max(vehicle.price, 1);
        score += Math.max(0, 3 - priceGap * 6);
        score += Math.max(0, 2 - Math.abs(candidate.year - vehicle.year) * 0.5);
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.candidate);
    return simulateLatency(scored, 160);
  },

  async facets(vehicleType?: VehicleType) {
    const vehicles = getAllVehicles().filter(
      (vehicle) => vehicle.listingStatus === "publicado" && (!vehicleType || vehicle.vehicleType === vehicleType),
    );
    const unique = (selector: (vehicle: Vehicle) => string) =>
      Array.from(new Set(vehicles.map(selector))).sort((a, b) => a.localeCompare(b, "es"));
    return simulateLatency(
      {
        brands: unique((vehicle) => vehicle.brand),
        models: unique((vehicle) => vehicle.model),
        cities: unique((vehicle) => vehicle.city),
      },
      60,
    );
  },

  async save(vehicle: Vehicle) {
    const next = getLocalVehicles().filter((item) => item.id !== vehicle.id);
    next.push(vehicle);
    writeJSON(STORAGE_KEYS.vehicles, next);
    return simulateLatency(vehicle, 80);
  },

  async update(id, patch) {
    const local = getLocalVehicles();
    const index = local.findIndex((item) => item.id === id);
    if (index >= 0) {
      const updated = { ...local[index], ...patch, updatedAt: new Date().toISOString() };
      local[index] = updated;
      writeJSON(STORAGE_KEYS.vehicles, local);
      return simulateLatency(updated, 60);
    }
    const seedVehicle = getAllVehicles().find((item) => item.id === id);
    if (!seedVehicle) return simulateLatency(null, 40);
    const updated: Vehicle = { ...seedVehicle, ...patch, updatedAt: new Date().toISOString() };
    local.push(updated);
    writeJSON(STORAGE_KEYS.vehicles, local);
    return simulateLatency(updated, 60);
  },

  async remove(id) {
    const local = getLocalVehicles();
    const next = local.filter((item) => item.id !== id);
    const removed = next.length !== local.length;
    writeJSON(STORAGE_KEYS.vehicles, next);
    return simulateLatency(removed, 60);
  },
};

/* ------------------------------------------------------------------ */
/*  Repositorio de vendedores                                          */
/* ------------------------------------------------------------------ */

export const demoSellerRepository: SellerRepository = {
  async list() {
    return simulateLatency(getAllSellers(), 60);
  },
  async byId(id) {
    return simulateLatency(getSellerSync(id) ?? null, 40);
  },
  async save(seller) {
    const next = getLocalSellers().filter((item) => item.id !== seller.id);
    next.push(seller);
    writeJSON(STORAGE_KEYS.sellers, next);
    return simulateLatency(seller, 60);
  },
  async update(id, patch) {
    const current = getSellerSync(id);
    if (!current) return simulateLatency(null, 40);
    const updated = { ...current, ...patch };
    const local = getLocalSellers().filter((item) => item.id !== id);
    local.push(updated);
    writeJSON(STORAGE_KEYS.sellers, local);
    return simulateLatency(updated, 60);
  },
};

/* ------------------------------------------------------------------ */
/*  Solicitudes comerciales                                            */
/* ------------------------------------------------------------------ */

export const demoInquiryRepository: InquiryRepository = {
  async list() {
    const items = readJSON<Inquiry[]>(STORAGE_KEYS.inquiries, []);
    return simulateLatency(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 60);
  },
  async create(input) {
    const items = readJSON<Inquiry[]>(STORAGE_KEYS.inquiries, []);
    const inquiry: Inquiry = {
      ...input,
      id: uid("inq"),
      createdAt: new Date().toISOString(),
      status: "nuevo",
    };
    items.push(inquiry);
    writeJSON(STORAGE_KEYS.inquiries, items);
    return simulateLatency(inquiry, 260);
  },
  async updateStatus(id, status) {
    const items = readJSON<Inquiry[]>(STORAGE_KEYS.inquiries, []);
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return simulateLatency(null, 40);
    items[index] = { ...items[index], status };
    writeJSON(STORAGE_KEYS.inquiries, items);
    return simulateLatency(items[index], 60);
  },
};

/* ------------------------------------------------------------------ */
/*  Publicaciones de usuarios                                          */
/* ------------------------------------------------------------------ */

export const demoSubmissionRepository: SubmissionRepository = {
  async list() {
    const items = readJSON<VehicleSubmission[]>(STORAGE_KEYS.submissions, []);
    return simulateLatency(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 60);
  },
  async create(input) {
    const items = readJSON<VehicleSubmission[]>(STORAGE_KEYS.submissions, []);
    const submission: VehicleSubmission = {
      ...input,
      id: uid("sub"),
      createdAt: new Date().toISOString(),
      status: "pendiente",
    };
    items.push(submission);
    writeJSON(STORAGE_KEYS.submissions, items);
    return simulateLatency(submission, 320);
  },
  async review(id, status, vehicleId) {
    const items = readJSON<VehicleSubmission[]>(STORAGE_KEYS.submissions, []);
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return simulateLatency(null, 40);
    items[index] = { ...items[index], status, publishedVehicleId: vehicleId };
    writeJSON(STORAGE_KEYS.submissions, items);
    return simulateLatency(items[index], 60);
  },
};
