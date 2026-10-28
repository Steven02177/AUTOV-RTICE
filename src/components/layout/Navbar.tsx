import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Heart, Menu, Scale, Search, UserRound, X } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/config/site";
import { useShop } from "@/context/ShopContext";

interface NavItem {
  to: string;
  label: string;
}

const PRIMARY: NavItem[] = [
  { to: "/", label: "Inicio" },
  { to: "/carros", label: "Carros" },
  { to: "/motos", label: "Motos" },
  { to: "/comparar", label: "Comparar" },
  { to: "/encontrar", label: "Encuentra tu vehículo" },
  { to: "/vender", label: "Vender mi vehículo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();
  const { favorites, compare } = useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.search]);

  const carCategories = CATEGORIES.filter((category) => category.vehicleType === "carro");
  const motoCategories = CATEGORIES.filter((category) => category.vehicleType === "moto");

  const dropdown = (label: string, items: typeof carCategories, base: string) => (
    <div className="relative" onMouseLeave={() => setOpenMenu(null)}>
      <button
        type="button"
        onMouseEnter={() => setOpenMenu(label)}
        onClick={() => setOpenMenu(openMenu === label ? null : label)}
        aria-expanded={openMenu === label}
        className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
          location.pathname === base ? "text-lime" : "text-white/80 hover:text-white"
        }`}
      >
        {label}
        <ChevronDown className={`size-3.5 transition ${openMenu === label ? "rotate-180" : ""}`} />
      </button>
      {openMenu === label && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-graphite-2/98 p-2 shadow-card animate-fade-up">
          <NavLink
            to={base}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-lime transition hover:bg-white/5"
          >
            Ver todos
          </NavLink>
          {items.map((category) => (
            <Link
              key={category.id}
              to={`${base}?${category.bodyType ? `bodyTypes=${category.bodyType}` : `motorcycleCategories=${category.motorcycleCategory}`}`}
              className="block rounded-xl px-3 py-2 text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
            >
              {category.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/8 bg-graphite/92 backdrop-blur-xl" : "border-b border-transparent bg-graphite/60 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label={`${SITE.name} - Inicio`} className="display shrink-0 text-xl font-bold tracking-wide">
          <span className="text-white">AUTO</span>
          <span className="text-lime">VÉRTICE</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 xl:flex" aria-label="Navegación principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "text-lime" : "text-white/80 hover:text-white"}`
            }
          >
            Inicio
          </NavLink>
          {dropdown("Carros", carCategories, "/carros")}
          {dropdown("Motos", motoCategories, "/motos")}
          <NavLink
            to="/comparar"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "text-lime" : "text-white/80 hover:text-white"}`
            }
          >
            Comparar
          </NavLink>
          <NavLink
            to="/encontrar"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "text-lime" : "text-white/80 hover:text-white"}`
            }
          >
            Encuentra tu vehículo
          </NavLink>
          <NavLink
            to="/vender"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "text-lime" : "text-white/80 hover:text-white"}`
            }
          >
            Vender mi vehículo
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/favoritos"
            aria-label={`Favoritos (${favorites.ids.length})`}
            className="relative rounded-full p-2.5 text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            <Heart className="size-[18px]" />
            {favorites.ids.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-graphite">
                {favorites.ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/comparar"
            aria-label={`Comparar (${compare.ids.length})`}
            className="relative rounded-full p-2.5 text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            <Scale className="size-[18px]" />
            {compare.ids.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-graphite">
                {compare.ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/carros"
            aria-label="Buscar vehículos"
            className="hidden rounded-full p-2.5 text-white/80 transition hover:bg-white/5 hover:text-white sm:block"
          >
            <Search className="size-[18px]" />
          </Link>
          <Link to="/contacto" className="btn-primary hidden !px-4 !py-2 text-xs sm:inline-flex">
            Contacto
          </Link>
          <Link
            to="/admin"
            aria-label="Cuenta y panel administrativo"
            className="rounded-full p-2.5 text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            <UserRound className="size-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            className="rounded-full p-2.5 text-white/80 transition hover:bg-white/5 xl:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[75vh] overflow-y-auto border-t border-white/8 bg-graphite px-4 pb-6 pt-3 xl:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {PRIMARY.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-base font-medium transition ${isActive ? "bg-white/5 text-lime" : "text-white/85"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <details className="rounded-xl px-3 py-2">
              <summary className="cursor-pointer list-none py-1.5 text-base font-medium text-white/85">Categorías de carros</summary>
              <div className="mt-1 flex flex-col">
                {carCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/carros?${category.bodyType ? `bodyTypes=${category.bodyType}` : "bodyTypes=familiar"}`}
                    className="rounded-lg px-3 py-2 text-sm text-white/70"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </details>
            <details className="rounded-xl px-3 py-2">
              <summary className="cursor-pointer list-none py-1.5 text-base font-medium text-white/85">Categorías de motos</summary>
              <div className="mt-1 flex flex-col">
                {motoCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/motos?motorcycleCategories=${category.motorcycleCategory}`}
                    className="rounded-lg px-3 py-2 text-sm text-white/70"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </details>
            <Link to="/contacto" className="btn-primary mt-3">
              Contacto
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
