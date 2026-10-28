import { Link } from "react-router-dom";
import { SITE, isDemoMode } from "@/config/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/8 bg-graphite-2/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="display text-2xl font-bold">
            <span className="text-white">AUTO</span>
            <span className="text-lime">VÉRTICE</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-steel">{SITE.description}</p>
          {isDemoMode && (
            <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-200">
              Modo demostración: los anuncios son ficticios y se usan para evaluar la plataforma.
            </p>
          )}
        </div>

        <nav aria-label="Catálogo">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Catálogo</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-steel">
            <li><Link className="transition hover:text-white" to="/carros">Carros</Link></li>
            <li><Link className="transition hover:text-white" to="/motos">Motos</Link></li>
            <li><Link className="transition hover:text-white" to="/comparar">Comparar vehículos</Link></li>
            <li><Link className="transition hover:text-white" to="/encontrar">Encuentra tu vehículo ideal</Link></li>
            <li><Link className="transition hover:text-white" to="/favoritos">Mis favoritos</Link></li>
            <li><Link className="transition hover:text-white" to="/vender">Vender mi vehículo</Link></li>
          </ul>
        </nav>

        <nav aria-label="Contenido y ayuda">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Ayuda</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-steel">
            <li><Link className="transition hover:text-white" to="/guias">Guías y consejos</Link></li>
            <li><Link className="transition hover:text-white" to="/faq">Preguntas frecuentes</Link></li>
            <li><Link className="transition hover:text-white" to="/contacto">Contacto comercial</Link></li>
            <li><Link className="transition hover:text-white" to="/privacidad">Política de privacidad</Link></li>
            <li><Link className="transition hover:text-white" to="/terminos">Términos y condiciones</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Información comercial</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-steel">
            <li>Ciudad: {SITE.city}</li>
            {SITE.email && <li>Correo: {SITE.email}</li>}
            {SITE.socials.length > 0 ? (
              SITE.socials.map((social) => (
                <li key={social.label}>
                  <a className="transition hover:text-white" href={social.url} target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                </li>
              ))
            ) : (
              <li className="text-xs">Las redes sociales se muestran cuando se configuran en <code className="text-lime">src/config/site.ts</code>.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-steel sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {year} {SITE.legalName}. Proyecto de demostración sin ánimo de lucro.
          </p>
          <p className="max-w-xl">
            Las características, precios y condiciones de cada vehículo deben confirmarse directamente con su vendedor.
          </p>
        </div>
      </div>
    </footer>
  );
}
