import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { useDocumentMeta } from "@/utils/seo";
import { SITE } from "@/config/site";

export default function NotFoundPage() {
  useDocumentMeta(`Página no encontrada | ${SITE.name}`, "La página que buscas no existe o fue movida.");

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-28 text-center">
      <div className="flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Compass className="size-9 text-lime" />
      </div>
      <p className="display text-7xl font-bold text-lime">404</p>
      <h1 className="section-title">Esta página no existe</h1>
      <p className="max-w-md text-sm leading-relaxed text-steel">
        Puede que el enlace esté desactualizado o que el vehículo ya no esté publicado. Vuelve al catálogo para seguir
        explorando.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Ir al inicio
        </Link>
        <Link to="/carros" className="btn-ghost">
          Ver carros
        </Link>
        <Link to="/motos" className="btn-ghost">
          Ver motos
        </Link>
      </div>
    </div>
  );
}
