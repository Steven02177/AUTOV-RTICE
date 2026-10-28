import type { Seller } from "@/types/vehicle";

/**
 * Vendedores de demostración.
 * IMPORTANTE: no se publican números telefónicos ficticios.
 * Si `phone` está vacío, la ficha del vehículo ofrece el formulario de contacto
 * en lugar de un botón de WhatsApp que no funcionaría.
 * Los teléfonos reales se configuran desde el panel administrativo o en la base de datos.
 */
export const DEMO_SELLERS: Seller[] = [
  {
    id: "seller-norte-motor",
    name: "Norte Motor (demostración)",
    type: "concesionario",
    city: "Bogotá D.C.",
    phone: "",
    active: true,
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "seller-andes-motos",
    name: "Andes Motos (demostración)",
    type: "concesionario",
    city: "Medellín",
    phone: "",
    active: true,
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "seller-particular-lm",
    name: "Vendedor particular (demostración)",
    type: "particular",
    city: "Cali",
    phone: "",
    active: true,
    createdAt: "2026-08-02T08:00:00.000Z",
  },
  {
    id: "seller-caribe-auto",
    name: "Caribe Auto (demostración)",
    type: "concesionario",
    city: "Barranquilla",
    phone: "",
    active: true,
    createdAt: "2026-08-03T08:00:00.000Z",
  },
  {
    id: "seller-ruta-andina",
    name: "Ruta Andina Empresarial (demostración)",
    type: "empresa",
    city: "Bucaramanga",
    phone: "",
    active: true,
    createdAt: "2026-08-04T08:00:00.000Z",
  },
];
