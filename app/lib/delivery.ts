/**
 * Configuración de rangos tarifarios de delivery para LA OBRA.
 * Punto de salida / Taller: BARRANCO, Lima.
 * 
 * Reglas de negocio:
 * - Punto de origen: Barranco
 * - Tarifa mínima: S/ 10 (Zona 1: Barranco y distritos vecinos/limítrofes)
 * - Incremento por rango de distancia: S/ 10 (S/ 10, S/ 20, S/ 30)
 * - Tarifa máxima: S/ 30 (Zona 3: Lima Norte, Callao y zonas periféricas)
 * - Envío GRATUITO para compras a partir de S/ 250
 */

export const DELIVERY_ORIGIN = "Barranco";
export const FREE_DELIVERY_THRESHOLD = 250;
export const MIN_DELIVERY_RATE = 10;
export const MAX_DELIVERY_RATE = 30;
export const DEFAULT_DELIVERY_RATE = 10;
export const DEFAULT_DISTRICT = "Barranco";

export interface DeliveryZone {
  zoneId: number; // 1, 2, 3
  rate: number;   // 10, 20, 30
  name: string;   // "Zona 1 (Cercana)", etc.
  description: string;
  districts: string[];
}

export const DELIVERY_ZONES: Record<number, DeliveryZone> = {
  1: {
    zoneId: 1,
    rate: 10,
    name: "Zona 1 · S/ 10 (Barranco y distritos vecinos)",
    description: "Barranco, Chorrillos, Miraflores, Surco, San Borja, Surquillo, San Isidro y aledaños",
    districts: [
      "Barranco",
      "Chorrillos",
      "Miraflores",
      "Santiago de Surco",
      "Surquillo",
      "San Borja",
      "San Isidro",
      "Lince",
      "Jesús María",
      "Magdalena del Mar",
      "San Luis",
    ],
  },
  2: {
    zoneId: 2,
    rate: 20,
    name: "Zona 2 · S/ 20 (Lima Centro, Este y Lima Sur)",
    description: "Pueblo Libre, San Miguel, La Victoria, La Molina, Cercado, SJM, VES, VMT y aledaños",
    districts: [
      "Pueblo Libre",
      "San Miguel",
      "La Victoria",
      "Breña",
      "Cercado de Lima",
      "La Molina",
      "San Juan de Miraflores",
      "Villa María del Triunfo",
      "Villa El Salvador",
      "Ate",
      "Santa Anita",
      "Rímac",
      "El Agustino",
    ],
  },
  3: {
    zoneId: 3,
    rate: 30,
    name: "Zona 3 · S/ 30 (Lima Norte, Callao y zonas periféricas)",
    description: "Callao, Los Olivos, Independencia, SMP, Comas, SJL, Puente Piedra y balnearios",
    districts: [
      "Callao (Cercado)",
      "Bellavista",
      "La Perla",
      "La Punta",
      "Carmen de la Legua",
      "San Martín de Porres",
      "Los Olivos",
      "Independencia",
      "Comas",
      "San Juan de Lurigancho",
      "Ventanilla",
      "Mi Perú",
      "Puente Piedra",
      "Carabayllo",
      "Lurín",
      "Pachacámac",
      "Chaclacayo",
      "Chosica (Lurigancho)",
      "Ancón",
      "Cieneguilla",
      "Santa Rosa",
      "Balnearios del Sur (Punta Hermosa / San Bartolo)",
    ],
  },
};

/**
 * Obtiene la tarifa correspondiente a un distrito dado tomando como origen Barranco.
 * Si no se encuentra, retorna DEFAULT_DELIVERY_RATE (S/ 10).
 */
export function getDeliveryRateForDistrict(districtName?: string): number {
  if (!districtName) return DEFAULT_DELIVERY_RATE;

  const normalized = districtName.trim().toLowerCase();

  for (const zone of Object.values(DELIVERY_ZONES)) {
    if (
      zone.districts.some(
        (d) => d.toLowerCase() === normalized || normalized.includes(d.toLowerCase())
      )
    ) {
      return zone.rate;
    }
  }

  return DEFAULT_DELIVERY_RATE;
}

/**
 * Calcula el costo final de delivery según el subtotal de productos y el distrito seleccionado.
 * Si subtotal >= FREE_DELIVERY_THRESHOLD (S/ 250), el costo es S/ 0 (Gratis).
 */
export function calculateDeliveryCost(
  subtotal: number,
  districtName?: string
): {
  deliveryCost: number;
  isFreeDelivery: boolean;
  baseRate: number;
} {
  const baseRate = getDeliveryRateForDistrict(districtName);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;

  return {
    deliveryCost: isFreeDelivery ? 0 : baseRate,
    isFreeDelivery,
    baseRate,
  };
}
