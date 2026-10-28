import { Link, useParams } from "react-router-dom";
import { ARTICLES, getArticle } from "@/data/articles";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";
import { EmptyState } from "@/components/ui/feedback";
import { ImageWithFallback } from "@/components/ui/primitives";
import NotFoundPage from "./NotFoundPage";

export function GuidesPage() {
  useDocumentMeta(
    `Guías y consejos para comprar vehículos | ${SITE.name}`,
    "Artículos prácticos sobre compra de usados, costos de mantenimiento, documentación en Colombia y comparación de vehículos.",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
          <Link to="/" className="transition hover:text-white">
            Inicio
          </Link>{" "}
          / Guías y consejos
        </nav>
        <h1 className="section-title">Guías y consejos</h1>
        <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
          Contenido orientativo para que compres con criterio: qué revisar, qué documentos pedir y cómo comparar costos
          reales antes de decidir.
        </p>
      </header>

      {ARTICLES.length === 0 ? (
        <EmptyState title="Sin artículos publicados" description="Aún no hay guías disponibles." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              to={`/guias/${article.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/8 bg-graphite-2/60 transition hover:-translate-y-1 hover:border-lime/40"
            >
              <ImageWithFallback
                src={article.cover}
                alt={article.title}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <p className="text-xs text-steel">
                  {new Date(article.publishedAt).toLocaleDateString("es-CO", { month: "long", year: "numeric" })} ·{" "}
                  {article.readingMinutes} min
                </p>
                <h2 className="mt-2 text-lg font-semibold leading-snug transition group-hover:text-lime">
                  {article.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-steel">{article.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-lime">Leer guía →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuideArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug);

  useDocumentMeta(
    article ? `${article.title} | ${SITE.name}` : `Guía no encontrada | ${SITE.name}`,
    article?.excerpt ?? "La guía solicitada no existe.",
    article?.cover,
  );

  if (!article) return <NotFoundPage />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav aria-label="Miga de pan" className="mb-4 text-xs text-steel">
        <Link to="/" className="transition hover:text-white">
          Inicio
        </Link>{" "}
        / <Link to="/guias">Guías</Link> / {article.title}
      </nav>

      <ImageWithFallback
        src={article.cover}
        alt={article.title}
        className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-80"
        loading="eager"
      />

      <h1 className="section-title">{article.title}</h1>
      <p className="mt-3 text-sm text-steel">
        {article.readingMinutes} minutos de lectura · Publicado{" "}
        {new Date(article.publishedAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <p className="mt-6 border-l-2 border-lime pl-4 text-base leading-relaxed text-white/85">{article.excerpt}</p>

      <div className="mt-10 space-y-9">
        {article.sections.map((section) => (
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

      <div className="mt-12 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="w-full text-sm text-steel">¿Listo para aplicar lo leído?</p>
        <Link to="/carros" className="btn-primary">
          Explorar carros
        </Link>
        <Link to="/motos" className="btn-ghost">
          Explorar motos
        </Link>
        <Link to="/encontrar" className="btn-ghost border-lime/50 text-lime">
          Usar el asistente
        </Link>
      </div>
    </article>
  );
}
