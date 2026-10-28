import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/utils/seo";
import { SITE, isDemoMode } from "@/config/site";

interface InfoContent {
  title: string;
  lead: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
}

const CONTENT: Record<string, InfoContent> = {
  faq: {
    title: "Preguntas frecuentes",
    lead: "Respuestas directas sobre cómo funciona la plataforma, los anuncios y el contacto con los vendedores.",
    sections: [
      {
        heading: "¿Los vehículos mostrados están realmente en venta?",
        paragraphs: [
          isDemoMode
            ? "En este entorno la plataforma funciona en modo demostración: los anuncios están marcados con la etiqueta «Demostración» y sus datos (precios, kilometrajes, vendedores) son ficticios, creados para evaluar la experiencia completa."
            : "Cada anuncio publicado proviene de un vendedor registrado en la plataforma. Las condiciones deben confirmarse directamente con él.",
        ],
      },
      {
        heading: "¿Cómo contacto a un vendedor?",
        paragraphs: [
          "Desde la ficha del vehículo puedes enviar el formulario de contacto o, si el vendedor configuró su número de WhatsApp, abrir una conversación con un mensaje prellenado que incluye marca, modelo, año y el enlace de la ficha.",
          "Si el número no está configurado, la plataforma no muestra un botón que no funcionaría: ofrece el formulario como canal alternativo.",
        ],
      },
      {
        heading: "¿Puedo comparar cualquier vehículo con otro?",
        paragraphs: [
          "El comparador admite hasta tres vehículos y solo permite comparar vehículos del mismo tipo (carros con carros, motos con motos), porque sus especificaciones no son intercambiables.",
        ],
      },
      {
        heading: "¿Qué es el asistente de recomendaciones?",
        paragraphs: [
          "Es un cuestionario que puntuje el catálogo según tu presupuesto, uso previsto, capacidad, terreno y preferencias técnicas. Cada recomendación explica con qué datos se ganó el puntaje y qué conviene verificar antes de comprar.",
          "El porcentaje de compatibilidad es el resultado de una fórmula transparente, no una garantía.",
        ],
      },
      {
        heading: "¿Cómo vendo mi vehículo en la plataforma?",
        paragraphs: [
          "Completa el formulario de «Vender mi vehículo». Tu anuncio queda en estado pendiente hasta que un administrador lo revise; solo se publica cuando es aprobado.",
        ],
      },
      {
        heading: "¿Guardan mis datos personales?",
        paragraphs: [
          "En modo demostración las solicitudes se guardan en tu navegador para simular el flujo comercial. Consulta la política de privacidad para conocer el tratamiento de datos cuando la plataforma opere con backend real.",
        ],
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    lead: "Cómo se tratan los datos personales en la plataforma.",
    sections: [
      {
        heading: "Datos que recopilamos",
        paragraphs: [
          "Cuando envías un formulario (consulta por vehículo, prueba de manejo, publicación o asesoría) recopilamos nombre, teléfono, correo electrónico si lo aportas, ciudad, vehículo de interés y el contenido de tu mensaje.",
          "No solicitamos datos sensibles (salud, origen étnico, información financiera detallada) ni los almacenamos.",
        ],
      },
      {
        heading: "Finalidad del tratamiento",
        paragraphs: [
          "Los datos se usan exclusivamente para responder tu solicitud, poner en contacto con el vendedor y dar seguimiento comercial.",
          "No se venden ni se ceden a terceros con fines publicitarios.",
        ],
      },
      {
        heading: "Conservación y eliminación",
        paragraphs: [
          "En modo demostración, las solicitudes viven en el almacenamiento local de tu navegador y puedes eliminarlas limpiando los datos del sitio.",
          "Con backend real, los registros se conservarán el tiempo necesario para atender la solicitud y se eliminarán bajo petición del titular.",
        ],
      },
      {
        heading: "Derechos del titular",
        paragraphs: [
          "Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo al correo de contacto indicado en el pie de página.",
        ],
      },
    ],
  },
  terminos: {
    title: "Términos y condiciones",
    lead: "Reglas de uso de la plataforma.",
    sections: [
      {
        heading: "Naturaleza del servicio",
        paragraphs: [
          "AUTOVÉRTICE es un marketplace que conecta compradores y vendedores de vehículos. No es parte de la transacción ni presta garantías sobre los vehículos publicados.",
        ],
      },
      {
        heading: "Responsabilidad del contenido del anuncio",
        paragraphs: [
          "Cada vendedor es responsable de la veracidad de las características, fotografías y precios publicados. El comprador debe verificar toda la información antes de negociar.",
          "La plataforma muestra claramente qué datos fueron declarados y cuáles faltan por confirmar.",
        ],
      },
      {
        heading: "Publicaciones",
        paragraphs: [
          "Todo anuncio enviado por usuarios pasa por revisión administrativa antes de publicarse. Se rechazan anuncios incompletos, engañosos o duplicados.",
        ],
      },
      {
        heading: "Uso del sitio",
        paragraphs: [
          "No se permite publicar contenido falso, suplantar identidades o usar los formularios para spam. Las solicitudes pueden validarse también en el servidor para evitar abusos.",
        ],
      },
      {
        heading: "Modificaciones",
        paragraphs: [
          "Estos términos pueden actualizarse conforme evolucione el servicio; la versión vigente siempre estará disponible en esta página.",
        ],
      },
    ],
  },
};

export default function InfoPage({ page }: { page: keyof typeof CONTENT }) {
  const content = CONTENT[page];
  useDocumentMeta(`${content.title} | ${SITE.name}`, content.lead);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav aria-label="Miga de pan" className="mb-4 text-xs text-steel">
        <Link to="/" className="transition hover:text-white">
          Inicio
        </Link>{" "}
        / {content.title}
      </nav>
      <h1 className="section-title">{content.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">{content.lead}</p>

      <div className="mt-10 space-y-9">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="display text-2xl font-bold text-lime">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-white/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-steel">
        Última actualización: septiembre de 2026. Para dudas sobre tus datos escribe a {SITE.email || "contacto@autovertice.demo"}.
      </p>
    </article>
  );
}
