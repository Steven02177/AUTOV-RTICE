import type { LifestyleId } from "@/types/vehicle";

export type LifestyleIcon =
  | "key"
  | "graduation"
  | "briefcase"
  | "family"
  | "store"
  | "route"
  | "gauge"
  | "fuel"
  | "package"
  | "mountain";

export interface LifestyleProfile {
  id: LifestyleId;
  label: string;
  short: string;
  description: string;
  icon: LifestyleIcon;
  /** Respuestas sugeridas al asistente cuando el usuario elige este perfil. */
  finderSeed: {
    passengers?: number;
    terrain?: "ciudad" | "carretera" | "mixto" | "terrenos-dificiles";
    runningCostImportance?: "alta" | "media" | "baja";
    transmission?: "manual" | "automatica";
  };
  /** Etiquetas de vehículo con mayor peso para este perfil. */
  tags: LifestyleId[];
}

export const LIFESTYLES: LifestyleProfile[] = [
  {
    id: "primer-vehiculo",
    label: "Compras tu primer vehículo",
    short: "Tu primera moto o carro",
    description:
      "Buscas algo confiable, fácil de manejar y con costos de mantenimiento predecibles.",
    icon: "key",
    finderSeed: { passengers: 2, terrain: "ciudad", runningCostImportance: "alta", transmission: "automatica" },
    tags: ["primer-vehiculo", "economico"],
  },
  {
    id: "estudiantes",
    label: "Estudiante universitario",
    short: "Moverse entre clases",
    description:
      "Presupuesto ajustado, trayectos cortos y prioridad a la economía de combustible.",
    icon: "graduation",
    finderSeed: { passengers: 2, terrain: "ciudad", runningCostImportance: "alta" },
    tags: ["estudiantes", "economico"],
  },
  {
    id: "commuting",
    label: "Te desplazas diariamente al trabajo",
    short: "Uso diario en ciudad",
    description:
      "Necesitas un vehículo ágil para tráfico urbano y consumos contenidos.",
    icon: "briefcase",
    finderSeed: { passengers: 2, terrain: "ciudad", runningCostImportance: "alta" },
    tags: ["commuting", "economico"],
  },
  {
    id: "familias",
    label: "Familia",
    short: "Viajar acompañado",
    description: "Espacio para cinco pasajeros, seguridad y maletero para el diario vivir.",
    icon: "family",
    finderSeed: { passengers: 5, terrain: "mixto", runningCostImportance: "media" },
    tags: ["familias"],
  },
  {
    id: "emprendedores",
    label: "Emprendedor o trabajador independiente",
    short: "Trabajo y negocio",
    description: "Vehículo que acompañe la actividad comercial y soporte uso intensivo.",
    icon: "store",
    finderSeed: { passengers: 3, terrain: "mixto", runningCostImportance: "media" },
    tags: ["emprendedores", "carga"],
  },
  {
    id: "viajes-largos",
    label: "Viajes largos",
    short: "Carretera y distancia",
    description: "Comodidad en ruta, autonomía y espacio para equipaje.",
    icon: "route",
    finderSeed: { passengers: 3, terrain: "carretera", runningCostImportance: "media" },
    tags: ["viajes-largos"],
  },
  {
    id: "deportivo",
    label: "Velocidad y diseño deportivo",
    short: "Prestaciones y estilo",
    description: "Buscas respuesta, prestaciones y un diseño que se note.",
    icon: "gauge",
    finderSeed: { passengers: 2, terrain: "carretera", runningCostImportance: "baja", transmission: "manual" },
    tags: ["deportivo"],
  },
  {
    id: "economico",
    label: "Economía de combustible",
    short: "Bajo consumo",
    description: "El costo por kilómetro es tu prioridad número uno.",
    icon: "fuel",
    finderSeed: { passengers: 2, terrain: "ciudad", runningCostImportance: "alta" },
    tags: ["economico"],
  },
  {
    id: "carga",
    label: "Transportar mercancía",
    short: "Carga y herramientas",
    description: "Necesitas capacidad de carga, plataformas o doble cabina.",
    icon: "package",
    finderSeed: { passengers: 2, terrain: "mixto", runningCostImportance: "media" },
    tags: ["carga", "emprendedores"],
  },
  {
    id: "aventura",
    label: "Aventura y terrenos difíciles",
    short: "Fuera del asfalto",
    description: "Tracción, altura libre al suelo y resistencia para caminos malos.",
    icon: "mountain",
    finderSeed: { passengers: 2, terrain: "terrenos-dificiles", runningCostImportance: "baja" },
    tags: ["aventura"],
  },
];

export function getLifestyle(id?: LifestyleId): LifestyleProfile | undefined {
  return LIFESTYLES.find((item) => item.id === id);
}
