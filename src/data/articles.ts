export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface EditorialArticle {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  readingMinutes: number;
  publishedAt: string;
  sections: ArticleSection[];
}

/**
 * Contenido editorial de demostración. Los artículos son orientativos y generales:
 * no sustituyen la revisión técnica, legal o financiera de cada caso.
 */
export const ARTICLES: EditorialArticle[] = [
  {
    slug: "revisar-antes-de-comprar-carro-usado",
    title: "Qué revisar antes de comprar un carro usado",
    excerpt:
      "Una lista ordenada para revisar carrocería, motor, papeles y kilometraje antes de comprometer tu dinero.",
    cover: "/images/guide-1.jpg",
    readingMinutes: 6,
    publishedAt: "2026-08-20T10:00:00.000Z",
    sections: [
      {
        heading: "Empieza por los papeles",
        paragraphs: [
          "Antes de mirar el vehículo, pide los documentos: tarjeta de propiedad, SOAT vigente y última tecnomecánica (TMPO). Confirma que el número de motor y chasis coincidan con los impresos en la carpeta.",
          "Pide un certificado de gravámenes en la Superintendencia de Industria y Comercio para verificar que no existan embargos o prohibiciones de negociar. También revisa si hay multas de tránsito pendientes, porque en algunos casos pasan al nuevo propietario.",
        ],
      },
      {
        heading: "Kilometraje y historial",
        paragraphs: [
          "Compara el kilometraje del tablero con la edad del vehículo y el desgaste evidente: el desgaste del pedal del acelerador, el volante y los asientos suele ser difícil de disimular.",
          "Pide facturas de mantenimiento, talleres o concesionario. Un historial completo no garantiza nada por sí solo, pero su ausencia es una señal para bajar el precio o exigir una revisión independiente.",
        ],
      },
      {
        heading: "Revisión de carrocería y pintura",
        paragraphs: [
          "Mide el espesor de pintura con un medidor si es posible, o revisa uniformidad en juntas, bordes de puertas y diferencias de tono. Reparaciones recientes en un solo panel suelen indicar un golpe anterior.",
          "Revisa el estado de neumáticos, discos y pastillas: si están desgastados, es un costo que deberás asumir en las primeras semanas.",
        ],
      },
      {
        heading: "Prueba de manejo",
        paragraphs: [
          "Maneja el vehículo en ciudad y, si es posible, en carretera. Presta atención a ruidos al frenar, vibraciones en el volante, cambios de caja y humo en el escape.",
          "Pide encender el vehículo en frío si puedes, y verifica que las luces de advertencia del tablero se apaguen tras el arranque.",
        ],
      },
      {
        heading: "Cierra con claridad",
        paragraphs: [
          "Acuerda por escrito el precio, el estado del vehículo y quién asume el traslado de la tarjeta. Un documento simple con firmas y copias de cédula reduce riesgos posteriores.",
          "Este contenido es orientativo: las condiciones de cada anuncio deben confirmarse directamente con su vendedor.",
        ],
      },
    ],
  },
  {
    slug: "elegir-primera-moto",
    title: "Cómo elegir tu primera moto",
    excerpt:
      "Cilindraje, tipo de moto, altura de asiento y costos reales de uso para decidir con criterio.",
    cover: "/images/guide-2.jpg",
    readingMinutes: 5,
    publishedAt: "2026-08-21T10:00:00.000Z",
    sections: [
      {
        heading: "Define el uso antes que la marca",
        paragraphs: [
          "Si tu recorrido es urbano, una moto de baja cilindrada con buena posición de manejo suele ser suficiente y consume menos. Para carretera o viajes largos, el confort y la estabilidad importan más que el precio inicial.",
          "Si necesitas transportar mercancía, revisa el portaequipajes y la capacidad de carga declarada por el fabricante.",
        ],
      },
      {
        heading: "Altura y peso importan",
        paragraphs: [
          "Prueba la moto antes de comprar. Con los pies en el suelo y el peso repartido, debes sentirte estable. Una moto demasiado alta o pesada aumenta el riesgo en maniobras lentas y en semáforos.",
          "El peso en orden de marcha también se nota al parquear y al retirarla de un estacionamiento pequeño.",
        ],
      },
      {
        heading: "Tipos de moto y su uso real",
        paragraphs: [
          "Las scooters y urbanas tienen transmisión automática o simple, y son cómodas para tráfico intenso. Las deportivas priorizan respuesta; las touring y doble propósito priorizan distancia y versatilidad.",
          "Las motos de trabajo están optimizadas para consumo y resistencia, no para confort en viajes largos.",
        ],
      },
      {
        heading: "Costos que no aparecen en el precio",
        paragraphs: [
          "Incluye casco certificado, guantes, impermeable, SOAT, tecnomecánica y un presupuesto para mantenimiento periódico (aceite, filtros, llantas y frenos).",
          "Cotiza el seguro antes de decidir: varía mucho según cilindraje, ciudad y uso.",
        ],
      },
    ],
  },
  {
    slug: "presupuesto-mantener-vehiculo",
    title: "Qué presupuesto necesitas para mantener un vehículo",
    excerpt:
      "Cómo calcular combustible, mantenimiento, seguro y gastos fijos para no llevarte sorpresas.",
    cover: "/images/guide-3.jpg",
    readingMinutes: 5,
    publishedAt: "2026-08-22T10:00:00.000Z",
    sections: [
      {
        heading: "Parte de tus kilómetros reales",
        paragraphs: [
          "Estima cuántos kilómetros recorres al mes. Multiplícalos por el consumo del vehículo y por el precio del combustible en tu ciudad: ese es tu gasto variable principal.",
          "En ciudad el consumo suele ser peor que el de carretera, así que usa el dato conservador, no el mejor escenario.",
        ],
      },
      {
        heading: "Mantenimiento programado",
        paragraphs: [
          "Aceite, filtros, revisión de frenos, neumáticos y suspensiones tienen intervalos definidos por el fabricante. Divide el costo anual estimado entre doce meses para saber cuánto separar cada mes.",
          "Los vehículos de mayor cilindraje y las marcas de importación suelen tener repuestos más costosos: verifica precios reales antes de comprar.",
        ],
      },
      {
        heading: "Seguro y gastos fijos",
        paragraphs: [
          "Cotiza el seguro con al menos tres compañías y compara franquicias, no solo la prima mensual. Añade SOAT, tecnomecánica y, si aplica, parqueadero.",
          "Un fondo de emergencia para reparaciones evita que un imprevisto te deje sin vehículo.",
        ],
      },
      {
        heading: "Regla simple",
        paragraphs: [
          "Como referencia práctica, separa cada mes: consumo + mantenimiento acumulado + seguro + gastos fijos. Si esa suma supera el 15% de tus ingresos, considera un vehículo de menor costo de operación.",
          "Los valores dependen de cada caso: confirma tasas, seguros y precios vigentes antes de decidir.",
        ],
      },
    ],
  },
  {
    slug: "automatico-o-mecanico",
    title: "Diferencias entre vehículos automáticos y mecánicos",
    excerpt:
      "Conducción, consumo, costo de mantenimiento y uso real: qué conviene según tu día a día.",
    cover: "/images/guide-4.jpg",
    readingMinutes: 4,
    publishedAt: "2026-08-23T10:00:00.000Z",
    sections: [
      {
        heading: "Manejo diario",
        paragraphs: [
          "En tráfico intenso, una caja automática o CVT elimina el uso del clutch y reduce la fatiga. En carretera con muchas pendientes, la mecánica da más control directo al conductor.",
          "Ninguna es universalmente mejor: depende del tráfico, la pendiente y la preferencia personal.",
        ],
      },
      {
        heading: "Consumo",
        paragraphs: [
          "Con tecnología actual, la diferencia de consumo entre cajas modernas suele ser pequeña y depende más del motor, del peso y del estilo de manejo.",
          "Compara el consumo declarado del fabricante con el dato real que reporten propietarios del mismo modelo.",
        ],
      },
      {
        heading: "Costo de mantenimiento",
        paragraphs: [
          "Una caja mecánica suele tener un mantenimiento más simple y de menor costo. Las cajas automáticas y CVT requieren cambios de fluido con intervalos definidos.",
          "Antes de comprar, pide el costo de un servicio de caja al taller de la marca.",
        ],
      },
      {
        heading: "Para quién conviene cada una",
        paragraphs: [
          "Automática o CVT: ciudad, primera moto o carro, y quien prioriza comodidad. Mecánica: quien busca menor costo de mantenimiento, control en ruta o un uso más deportivo.",
          "En motos, las scooters con CVT son las más sencillas para empezar; las manuales dan más control en carretera.",
        ],
      },
    ],
  },
  {
    slug: "documentos-compra-usado-colombia",
    title: "Qué documentos revisar al comprar un usado en Colombia",
    excerpt:
      "Tarjeta de propiedad, SOAT, tecnomecánica, gravámenes y contrato: el checklist ordenado.",
    cover: "/images/guide-5.jpg",
    readingMinutes: 5,
    publishedAt: "2026-08-24T10:00:00.000Z",
    sections: [
      {
        heading: "Documentos del vehículo",
        paragraphs: [
          "Tarjeta de propiedad vigente a nombre del vendedor, SOAT pagado y último recibo de tecnomecánica (TMPO). Verifica que placa, motor y chasis coincidan con el vehículo físico.",
          "Solicita el certificado de matrícula o consulta de gravámenes para descartar embargos o prohibiciones.",
        ],
      },
      {
        heading: "Situación del vendedor",
        paragraphs: [
          "Si vende una persona natural, confirma su identidad con cédula y compara con la tarjeta de propiedad. Si vende una empresa, revisa el NIT y la representación legal.",
          "Desconfía de quien se niega a mostrar documentos o pide transferencias a terceros.",
        ],
      },
      {
        heading: "Multas y sanciones",
        paragraphs: [
          "Revisa en el sistema de tránsito si hay multas pendientes y en qué estado está la tecnomecánica. También confirma que el vehículo no esté reportado como perdido.",
          "Si hay multas, acuerde por escrito quién las asume.",
        ],
      },
      {
        heading: "Contrato de compraventa",
        paragraphs: [
          "Un contrato simple con datos de las partes, descripción del vehículo, precio, forma de pago y fecha de entrega reduce discusiones posteriores.",
          "Guarda copias de todo: cédulas, contrato y recibos de pago.",
        ],
      },
    ],
  },
  {
    slug: "comparar-consumo-mantenimiento-precio",
    title: "Cómo comparar consumo, mantenimiento y precio",
    excerpt:
      "Un método en tres pasos para comparar vehículos sin quedarte solo con el precio de lista.",
    cover: "/images/guide-6.jpg",
    readingMinutes: 5,
    publishedAt: "2026-08-25T10:00:00.000Z",
    sections: [
      {
        heading: "Paso 1: costo por kilómetro",
        paragraphs: [
          "Divide el consumo mensual entre los kilómetros que recorres. Un carro más caro con mejor consumo puede resultar más barato a dos años de uso.",
          "Usa siempre un consumo realista: el de ciudad o un valor intermedio, no el óptimo de carretera.",
        ],
      },
      {
        heading: "Paso 2: mantenimiento y repuestos",
        paragraphs: [
          "Compara precios de aceite, filtros, pastillas y llantas entre los modelos que estás evaluando. Busca precios de repuestos en talleres independientes, no solo en agencia.",
          "Los vehículos con más tecnología suelen ser más cómodos, pero su servicio puede costar más.",
        ],
      },
      {
        heading: "Paso 3: valor de reventa",
        paragraphs: [
          "Los modelos con alta demanda suelen depreciarse menos. Revisa cuántos años tarda en venderse un vehículo similar en tu ciudad y a qué precio se publica.",
          "También considera la vigencia de la garantía: un usado con garantía de agencia restante reduce el riesgo.",
        ],
      },
      {
        heading: "Plantilla de comparación",
        paragraphs: [
          "Crea una tabla con: precio, consumo estimado, costo mensual de mantenimiento, seguro, garantía restante y valor esperado de reventa. Suma dos años de uso y compara totales.",
          "Los resultados dependen de datos reales de cada anuncio: valida siempre con el vendedor.",
        ],
      },
    ],
  },
];

export function getArticle(slug?: string): EditorialArticle | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
