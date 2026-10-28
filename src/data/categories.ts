import type { CarBodyType, MotorcycleCategory, VehicleType } from "@/types/vehicle";

export interface VehicleCategory {
  id: string;
  label: string;
  vehicleType: VehicleType;
  bodyType?: CarBodyType;
  motorcycleCategory?: MotorcycleCategory;
  image: string;
  description: string;
}

export const CATEGORIES: VehicleCategory[] = [
  {
    id: "familiar",
    label: "Carros familiares",
    vehicleType: "carro",
    bodyType: "familiar",
    image: "/images/category-familiar.jpg",
    description: "Espacio para cinco pasajeros y maletero para viajes compartidos.",
  },
  {
    id: "suv",
    label: "SUV y camionetas",
    vehicleType: "carro",
    bodyType: "suv",
    image: "/images/category-suv.jpg",
    description: "Altura al suelo, versatilidad y uso mixto ciudad-carretera.",
  },
  {
    id: "sedan",
    label: "Sedanes",
    vehicleType: "carro",
    bodyType: "sedan",
    image: "/images/category-sedan.jpg",
    description: "Comodidad y maletero amplio en un formato tradicional.",
  },
  {
    id: "hatchback",
    label: "Hatchbacks",
    vehicleType: "carro",
    bodyType: "hatchback",
    image: "/images/category-hatchback.jpg",
    description: "Tamaño compacto, fácil estacionamiento y consumo contenido.",
  },
  {
    id: "deportivo",
    label: "Deportivos",
    vehicleType: "carro",
    bodyType: "deportivo",
    image: "/images/category-deportivo.jpg",
    description: "Respuesta, diseño y prestaciones por encima de lo habitual.",
  },
  {
    id: "pickup",
    label: "Pick-ups",
    vehicleType: "carro",
    bodyType: "pickup",
    image: "/images/category-pickup.jpg",
    description: "Carga, doble cabina y capacidad para caminos exigentes.",
  },
  {
    id: "moto-urbana",
    label: "Motos urbanas",
    vehicleType: "moto",
    motorcycleCategory: "urbana",
    image: "/images/category-moto-urbana.jpg",
    description: "Ágiles para moverte en la ciudad todos los días.",
  },
  {
    id: "moto-deportiva",
    label: "Motos deportivas",
    vehicleType: "moto",
    motorcycleCategory: "deportiva",
    image: "/images/category-moto-deportiva.jpg",
    description: "Postura agresiva y prestaciones para carretera.",
  },
  {
    id: "moto-touring",
    label: "Motos touring",
    vehicleType: "moto",
    motorcycleCategory: "touring",
    image: "/images/category-moto-touring.jpg",
    description: "Confort y equipaje para recorrer distancias largas.",
  },
  {
    id: "moto-doble",
    label: "Motos doble propósito",
    vehicleType: "moto",
    motorcycleCategory: "doble-proposito",
    image: "/images/category-moto-doble.jpg",
    description: "Asfalto y camino de tierra con la misma motocicleta.",
  },
  {
    id: "scooter",
    label: "Scooters",
    vehicleType: "moto",
    motorcycleCategory: "scooter",
    image: "/images/category-scooter.jpg",
    description: "Transmisión automática, espacio de carga y manejo sencillo.",
  },
  {
    id: "moto-trabajo",
    label: "Motos de trabajo",
    vehicleType: "moto",
    motorcycleCategory: "trabajo",
    image: "/images/category-moto-trabajo.jpg",
    description: "Bajo consumo y resistencia para actividad diaria.",
  },
];
