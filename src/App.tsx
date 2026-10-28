import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CompareBar from "@/components/comparison/CompareBar";
import { ToastProvider, useAsync } from "@/components/ui/feedback";
import { ShopProvider } from "@/context/ShopContext";
import { vehicleRepository } from "@/repositories";
import { createDefaultFilters } from "@/utils/filters";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import VehicleDetailPage from "@/pages/VehicleDetailPage";
import ComparePage from "@/pages/ComparePage";
import FavoritesPage from "@/pages/FavoritesPage";
import FinderPage from "@/pages/FinderPage";
import SellVehiclePage from "@/pages/SellVehiclePage";
import ContactPage from "@/pages/ContactPage";
import { GuidesPage } from "@/pages/GuidesPage";
import GuideArticlePage from "@/pages/GuideArticlePage";
import InfoPage from "@/pages/InfoPage";
import AdminPage from "@/pages/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";

/** Carga una vez el catálogo completo para favoritos, comparador y asistente. */
function AppProviders({ children }: { children: React.ReactNode }) {
  const pool = useAsync(() => vehicleRepository.list(createDefaultFilters(), 500), []);
  return (
    <ShopProvider vehiclePool={pool.data?.items ?? []}>
      {children}
    </ShopProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProviders>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/carros" element={<CatalogPage vehicleType="carro" />} />
              <Route path="/motos" element={<CatalogPage vehicleType="moto" />} />
              <Route path="/carros/:slug" element={<VehicleDetailPage vehicleType="carro" />} />
              <Route path="/motos/:slug" element={<VehicleDetailPage vehicleType="moto" />} />
              <Route path="/comparar" element={<ComparePage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="/encontrar" element={<FinderPage />} />
              <Route path="/vender" element={<SellVehiclePage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/guias" element={<GuidesPage />} />
              <Route path="/guias/:slug" element={<GuideArticlePage />} />
              <Route path="/faq" element={<InfoPage page="faq" />} />
              <Route path="/privacidad" element={<InfoPage page="privacidad" />} />
              <Route path="/terminos" element={<InfoPage page="terminos" />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          {/* Fuera de <Routes> pero dentro del router: usa <Link> y necesita el contexto. */}
          <CompareBar />
        </BrowserRouter>
      </AppProviders>
    </ToastProvider>
  );
}
