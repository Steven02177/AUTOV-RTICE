import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";

export default function ContactPage() {
  useDocumentMeta(
    `Contacto comercial | ${SITE.name}`,
    "Escríbenos para consultar por un vehículo, solicitar una prueba de manejo, pedir información o recibir asesoría.",
  );

  const whatsapp = SITE.whatsapp.replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
          <Link to="/" className="transition hover:text-white">
            Inicio
          </Link>{" "}
          / Contacto
        </nav>
        <h1 className="section-title">Hablemos de tu próximo vehículo</h1>
        <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
          Completa el formulario y un asesor dará seguimiento a tu solicitud. Si prefieres, también puedes escribir
          directamente al vendedor desde la ficha de cada vehículo.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card p-6 sm:p-8">
          <ContactForm />
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="display text-xl font-bold">Canales de contacto</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-lime" />
                <div>
                  <p className="font-semibold text-white">Correo</p>
                  <p className="text-steel">{SITE.email || "Configura el correo en src/config/site.ts"}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-lime" />
                <div>
                  <p className="font-semibold text-white">Ciudad</p>
                  <p className="text-steel">{SITE.city}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                {whatsapp.length >= 10 ? (
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-lime" />
                ) : (
                  <Phone className="mt-0.5 size-4 shrink-0 text-lime" />
                )}
                <div>
                  <p className="font-semibold text-white">WhatsApp comercial</p>
                  {whatsapp.length >= 10 ? (
                    <a
                      className="text-lime underline underline-offset-4"
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, quisiera información sobre los vehículos publicados en AUTOVÉRTICE.")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Escribir por WhatsApp
                    </a>
                  ) : (
                    <p className="text-steel">
                      Aún no hay un número configurado. Defínelo con la variable <code>VITE_DEFAULT_WHATSAPP</code> o
                      desde el panel administrativo para habilitar este canal.
                    </p>
                  )}
                </div>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="display text-xl font-bold">¿Vendes un vehículo?</h2>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Publica tu anuncio con nuestro formulario guiado. Queda en revisión hasta que un administrador lo apruebe.
            </p>
            <Link to="/vender" className="btn-primary mt-4 w-full">
              Vender mi vehículo
            </Link>
          </div>

          <div className="card p-6">
            <h2 className="display text-xl font-bold">Preguntas frecuentes</h2>
            <p className="mt-3 text-sm leading-relaxed text-steel">
              Cómo funciona la plataforma, la revisión de anuncios y el tratamiento de tus datos.
            </p>
            <Link to="/faq" className="btn-ghost mt-4 w-full">
              Ver preguntas frecuentes
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
