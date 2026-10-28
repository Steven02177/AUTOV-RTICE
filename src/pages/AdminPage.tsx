import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Star,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { inquiryRepository, sellerRepository, submissionRepository, vehicleRepository } from "@/repositories";
import { createFirstAdmin, getSession, hasAdminUsers, signIn, signOut, usingSupabaseAuth, type AuthUser } from "@/services/auth";
import { STORAGE_KEYS, removeKey } from "@/repositories/localStore";
import { useAsync, useToast } from "@/components/ui/feedback";
import { Field, Modal, StatusBadge } from "@/components/ui/primitives";
import { createDefaultFilters } from "@/utils/filters";
import { formatCOP, formatDateTime, formatMileage } from "@/utils/format";
import { useDocumentMeta } from "@/utils/seo";
import { SITE, isDemoMode } from "@/config/site";
import type { Inquiry, ListingStatus, Seller, Vehicle, VehicleSubmission } from "@/types/vehicle";

type Tab = "dashboard" | "vehiculos" | "solicitudes" | "publicaciones" | "vendedores" | "datos";

function LoginPanel({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [creatingFirst, setCreatingFirst] = useState(() => !hasAdminUsers() && !usingSupabaseAuth());
  const { push } = useToast();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (creatingFirst) {
        const user = await createFirstAdmin({ email, password, name });
        onAuthenticated(user);
        push("Primer administrador creado. Ya puedes ingresar.", "success");
      } else {
        const user = await signIn(email, password);
        onAuthenticated(user);
        push(`Bienvenido, ${user.name}.`, "success");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible autenticar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lime">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h1 className="display text-2xl font-bold">{creatingFirst ? "Crear primer administrador" : "Acceso administrativo"}</h1>
            <p className="text-xs text-steel">{SITE.name} · panel privado</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {creatingFirst && (
            <Field label="Nombre del administrador" htmlFor="admin-name" required>
              <input id="admin-name" type="text" className="field" value={name} onChange={(event) => setName(event.target.value)} required minLength={3} />
            </Field>
          )}
          <Field label="Correo" htmlFor="admin-email" required>
            <input id="admin-email" type="email" autoComplete="username" className="field" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          <Field
            label="Contraseña"
            htmlFor="admin-password"
            required
            hint={creatingFirst ? "Mínimo 8 caracteres. Guárdala en un administrador de contraseñas." : undefined}
          >
            <input
              id="admin-password"
              type="password"
              autoComplete={creatingFirst ? "new-password" : "current-password"}
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={creatingFirst ? 8 : 4}
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Verificando..." : creatingFirst ? "Crear administrador" : "Ingresar"}
          </button>
        </form>

        {!creatingFirst && !hasAdminUsers() && !usingSupabaseAuth() && (
          <button type="button" onClick={() => setCreatingFirst(true)} className="mt-4 w-full text-xs text-steel underline underline-offset-4 hover:text-white">
            ¿Aún no hay administradores? Crear el primero
          </button>
        )}

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-[11px] leading-relaxed text-steel">
          <p className="font-semibold text-white">Seguridad</p>
          {usingSupabaseAuth() ? (
            <p className="mt-1">Autenticación mediante Supabase Auth. El rol de administrador se verifica en la tabla profiles.</p>
          ) : (
            <p className="mt-1">
              Modo demostración: la sesión y las contraseñas (en hash SHA-256) viven en este navegador. Esto NO constituye
              seguridad real: para producción configura Supabase Auth y las políticas RLS incluidas en
              <code className="text-lime"> supabase/schema.sql</code>.
            </p>
          )}
          <p className="mt-1">
            El panel <code className="text-lime">/admin</code> también está bloqueado en robots.txt.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-steel">
          <Link to="/" className="underline underline-offset-4 hover:text-white">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Car }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-steel">{label}</span>
        <Icon className="size-4 text-lime" />
      </div>
      <p className="display mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<AuthUser | null>(() => getSession());
  const [tab, setTab] = useState<Tab>("dashboard");
  const [statusFilter, setStatusFilter] = useState<"" | ListingStatus>("");
  const [inquiryFilter, setInquiryFilter] = useState<"" | Inquiry["status"]>("");
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | null>(null);
  const { push } = useToast();

  useDocumentMeta(`Panel administrativo | ${SITE.name}`, "Gestión privada del marketplace.");

  const vehiclesState = useAsync(() => vehicleRepository.list({ ...createDefaultFilters(), page: 1 }, 500), [session?.email]);
  const inquiriesState = useAsync(() => inquiryRepository.list(), [session?.email, tab]);
  const submissionsState = useAsync(() => submissionRepository.list(), [session?.email, tab]);
  const sellersState = useAsync(() => sellerRepository.list(), [session?.email, tab]);

  const allVehicles = useMemo(() => vehiclesState.data?.items ?? [], [vehiclesState.data]);

  const counts = useMemo(() => {
    const vehicles = allVehicles;
    return {
      total: vehicles.length,
      published: vehicles.filter((vehicle) => vehicle.listingStatus === "publicado").length,
      pending: submissionsState.data?.filter((item) => item.status === "pendiente").length ?? 0,
      rejected: submissionsState.data?.filter((item) => item.status === "rechazado").length ?? 0,
      featured: vehicles.filter((vehicle) => vehicle.isFeatured).length,
      inquiries: inquiriesState.data?.length ?? 0,
    };
  }, [allVehicles, submissionsState.data, inquiriesState.data]);

  if (!session) return <LoginPanel onAuthenticated={setSession} />;

  const tabs: Array<{ id: Tab; label: string; icon: typeof Car }> = [
    { id: "dashboard", label: "Dashboard", icon: BadgeCheck },
    { id: "vehiculos", label: "Vehículos", icon: Car },
    { id: "solicitudes", label: "Solicitudes", icon: MessageSquare },
    { id: "publicaciones", label: "Publicaciones", icon: Plus },
    { id: "vendedores", label: "Vendedores", icon: Users },
    { id: "datos", label: "Datos locales", icon: RefreshCcw },
  ];

  const updateVehicle = async (id: string, patch: Partial<Vehicle>, message: string) => {
    try {
      await vehicleRepository.update(id, patch);
      vehiclesState.reload();
      push(message, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "No fue posible actualizar el vehículo.", "error");
    }
  };

  const deleteVehicle = async () => {
    if (!confirmDelete) return;
    try {
      await vehicleRepository.remove(confirmDelete.id);
      setConfirmDelete(null);
      vehiclesState.reload();
      push("Vehículo eliminado del catálogo local.", "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "No fue posible eliminar el vehículo.", "error");
    }
  };

  const approveSubmission = async (submission: VehicleSubmission) => {
    const slug = `${submission.brand}-${submission.model}-${submission.year}-${Date.now().toString(36)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const vehicle: Vehicle = {
      id: `local-${submission.id}`,
      slug,
      vehicleType: submission.vehicleType,
      brand: submission.brand,
      model: submission.model,
      version: submission.version,
      year: submission.year,
      price: submission.price,
      currency: "COP",
      condition: submission.mileage > 0 ? "usado" : "nuevo",
      mileage: submission.mileage,
      city: submission.city,
      department: "Por confirmar",
      bodyType: submission.vehicleType === "carro" ? "sedan" : undefined,
      motorcycleCategory: submission.vehicleType === "moto" ? "urbana" : undefined,
      specs: { safetyFeatures: [], features: submission.features, color: "No informado" },
      description: submission.description,
      imageUrls: [],
      sellerId: "seller-particular-lm",
      listingStatus: "publicado",
      isFeatured: false,
      lifestyleTags: [],
      createdAt: submission.createdAt,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      isDemo: false,
      verificationNotes: ["Anuncio enviado por un usuario: verificar documentos, fotografías y características antes de comercializar."],
    };
    try {
      await vehicleRepository.save(vehicle);
      await submissionRepository.review(submission.id, "aprobado", vehicle.id);
      submissionsState.reload();
      vehiclesState.reload();
      push(`Se aprobó y publicó «${submission.brand} ${submission.model}».`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "No fue posible aprobar la publicación.", "error");
    }
  };

  const rejectSubmission = async (submission: VehicleSubmission) => {
    try {
      await submissionRepository.review(submission.id, "rechazado");
      submissionsState.reload();
      push("Publicación rechazada.", "info");
    } catch (error) {
      push(error instanceof Error ? error.message : "No fue posible rechazar la publicación.", "error");
    }
  };

  const filteredVehicles = statusFilter
    ? allVehicles.filter((vehicle) => vehicle.listingStatus === statusFilter)
    : allVehicles;
  const filteredInquiries = inquiryFilter
    ? (inquiriesState.data ?? []).filter((item) => item.status === inquiryFilter)
    : inquiriesState.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Panel administrativo</h1>
          <p className="mt-2 text-sm text-steel">
            Sesión: <span className="text-lime">{session.name}</span> ({session.email}) · rol {session.role}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut();
            setSession(null);
            push("Sesión cerrada.", "info");
          }}
          className="btn-ghost"
        >
          <LogOut className="size-4" /> Cerrar sesión
        </button>
      </header>

      {isDemoMode && (
        <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-200">
          Los cambios realizados aquí se guardan en el almacenamiento local de este navegador (modo demostración). Con
          Supabase configurado, las mismas operaciones escriben en PostgreSQL respetando las políticas RLS.
        </p>
      )}

      <nav className="mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="Secciones del panel">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.id ? "bg-lime text-graphite" : "border border-white/12 text-white/75 hover:border-lime/50"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "dashboard" && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Metric label="Total vehículos" value={counts.total} icon={Car} />
            <Metric label="Publicados" value={counts.published} icon={Eye} />
            <Metric label="Pendientes" value={counts.pending} icon={ShieldAlert} />
            <Metric label="Rechazados" value={counts.rejected} icon={XCircle} />
            <Metric label="Destacados" value={counts.featured} icon={Star} />
            <Metric label="Solicitudes" value={counts.inquiries} icon={MessageSquare} />
          </div>

          <section className="card p-6">
            <h2 className="display text-xl font-bold">Solicitudes recientes</h2>
            {(inquiriesState.data ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-steel">Aún no hay solicitudes registradas.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {(inquiriesState.data ?? []).slice(0, 5).map((inquiry) => (
                  <li key={inquiry.id} className="rounded-xl border border-white/8 bg-white/5 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        {inquiry.name} · {inquiry.requestType}
                      </span>
                      <span className="text-xs text-steel">{formatDateTime(inquiry.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-steel">
                      {inquiry.vehicleLabel ?? "Sin vehículo específico"} · {inquiry.city} · {inquiry.phone}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "vehiculos" && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-steel">
              Estado
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | ListingStatus)} className="field !w-auto !py-2">
                <option value="">Todos</option>
                <option value="publicado">Publicados</option>
                <option value="desactivado">Desactivados</option>
                <option value="vendido">Vendidos</option>
              </select>
            </label>
            <span className="text-sm text-steel">{filteredVehicles.length} anuncios</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-steel">
                  <th className="p-3">Vehículo</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Kilometraje</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Destacado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-white/5">
                    <td className="p-3">
                      <Link to={`/${vehicle.vehicleType === "carro" ? "carros" : "motos"}/${vehicle.slug}`} className="font-semibold text-white transition hover:text-lime">
                        {vehicle.brand} {vehicle.model} {vehicle.version}
                      </Link>
                      <p className="text-xs text-steel">
                        {vehicle.year} · {vehicle.city}
                      </p>
                    </td>
                    <td className="p-3">{formatCOP(vehicle.price)}</td>
                    <td className="p-3">{formatMileage(vehicle.mileage)}</td>
                    <td className="p-3">
                      <StatusBadge status={vehicle.listingStatus} />
                    </td>
                    <td className="p-3">
                      {vehicle.isFeatured ? (
                        <span className="flex items-center gap-1 text-xs text-lime">
                          <Star className="size-3.5 fill-current" /> Sí
                        </span>
                      ) : (
                        <span className="text-xs text-steel">No</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateVehicle(
                              vehicle.id,
                              { listingStatus: vehicle.listingStatus === "publicado" ? "desactivado" : "publicado" },
                              vehicle.listingStatus === "publicado" ? "Anuncio desactivado." : "Anuncio publicado.",
                            )
                          }
                          className="btn-ghost !px-3 !py-1.5 !text-xs"
                        >
                          {vehicle.listingStatus === "publicado" ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateVehicle(vehicle.id, { isFeatured: !vehicle.isFeatured }, vehicle.isFeatured ? "Se quitó el destacado." : "Anuncio destacado.")}
                          className="btn-ghost !px-3 !py-1.5 !text-xs"
                          aria-label="Cambiar destacado"
                        >
                          <Star className={`size-3.5 ${vehicle.isFeatured ? "fill-current text-lime" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateVehicle(vehicle.id, { listingStatus: "vendido" }, "Marcado como vendido.")}
                          className="btn-ghost !px-3 !py-1.5 !text-xs"
                        >
                          <CheckCircle2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(vehicle)}
                          className="btn-ghost !px-3 !py-1.5 !text-xs hover:border-red-400 hover:text-red-300"
                          aria-label="Eliminar vehículo"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredVehicles.length === 0 && <p className="mt-4 text-sm text-steel">No hay vehículos con ese estado.</p>}
        </section>
      )}

      {tab === "solicitudes" && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-steel">
              Estado
              <select value={inquiryFilter} onChange={(event) => setInquiryFilter(event.target.value as "" | Inquiry["status"])} className="field !w-auto !py-2">
                <option value="">Todas</option>
                <option value="nuevo">Nuevas</option>
                <option value="contactado">Contactadas</option>
                <option value="cerrado">Cerradas</option>
              </select>
            </label>
            <span className="text-sm text-steel">{filteredInquiries.length} solicitudes</span>
          </div>

          {filteredInquiries.length === 0 ? (
            <p className="text-sm text-steel">No hay solicitudes con ese filtro.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-steel">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Vehículo</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b border-white/5">
                      <td className="p-3 text-xs text-steel">{formatDateTime(inquiry.createdAt)}</td>
                      <td className="p-3">
                        <p className="font-semibold text-white">{inquiry.name}</p>
                        <p className="text-xs text-steel">
                          {inquiry.phone} · {inquiry.city}
                          {inquiry.email ? ` · ${inquiry.email}` : ""}
                        </p>
                      </td>
                      <td className="p-3 text-xs">{inquiry.requestType}</td>
                      <td className="p-3 text-xs">{inquiry.vehicleLabel ?? "—"}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                            inquiry.status === "nuevo"
                              ? "bg-lime/15 text-lime"
                              : inquiry.status === "contactado"
                                ? "bg-sky-500/15 text-sky-300"
                                : "bg-white/10 text-steel"
                          }`}
                        >
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={inquiry.status}
                          onChange={async (event) => {
                            await inquiryRepository.updateStatus(inquiry.id, event.target.value as Inquiry["status"]);
                            inquiriesState.reload();
                            push("Estado actualizado.", "success");
                          }}
                          className="field !w-auto !py-1.5 !text-xs"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="contactado">Contactado</option>
                          <option value="cerrado">Cerrado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "publicaciones" && (
        <section className="space-y-4">
          {(submissionsState.data ?? []).length === 0 ? (
            <p className="text-sm text-steel">
              No hay publicaciones enviadas por usuarios. Cuando alguien use el formulario «Vender mi vehículo»
              aparecerán aquí para revisión.
            </p>
          ) : (
            (submissionsState.data ?? []).map((submission) => (
              <article key={submission.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {submission.brand} {submission.model} {submission.version}
                    </h3>
                    <p className="text-xs text-steel">
                      {submission.year} · {formatMileage(submission.mileage)} · {formatCOP(submission.price)} · {submission.city}
                    </p>
                    <p className="mt-1 text-xs text-steel">
                      Enviado por {submission.contactName} ({submission.contactPhone}) el {formatDateTime(submission.createdAt)} ·{" "}
                      {submission.photoCount} fotos declaradas
                    </p>
                  </div>
                  <StatusBadge status={submission.status === "aprobado" ? "publicado" : submission.status === "rechazado" ? "rechazado" : "pendiente"} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{submission.description}</p>
                {submission.status === "pendiente" && (
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => approveSubmission(submission)} className="btn-primary !py-2 text-xs">
                      Aprobar y publicar
                    </button>
                    <button type="button" onClick={() => rejectSubmission(submission)} className="btn-ghost !py-2 text-xs">
                      Rechazar
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      )}

      {tab === "vendedores" && (
        <section className="grid gap-4 md:grid-cols-2">
          {(sellersState.data ?? []).map((seller) => (
            <SellerCard key={seller.id} seller={seller} onSaved={() => sellersState.reload()} />
          ))}
        </section>
      )}

      {tab === "datos" && (
        <section className="card max-w-2xl p-6">
          <h2 className="display text-xl font-bold">Datos locales de demostración</h2>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            Esta acción borra todo lo que guardaste en este navegador: favoritos, comparación, solicitudes,
            publicaciones, ediciones de anuncios y la sesión administrativa. El catálogo base de demostración no se
            modifica.
          </p>
          <button
            type="button"
            onClick={() => {
              Object.values(STORAGE_KEYS).forEach((key) => removeKey(key));
              window.location.reload();
            }}
            className="btn-ghost mt-5 hover:border-red-400 hover:text-red-300"
          >
            <Trash2 className="size-4" /> Borrar datos locales
          </button>
          <p className="mt-5 text-xs text-steel">
            Hash de referencia para pruebas: <code className="text-lime">SHA-256 activo</code>.
          </p>
        </section>
      )}

      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Confirmar eliminación">
        <p className="text-sm leading-relaxed text-steel">
          Vas a eliminar <span className="text-white">{confirmDelete?.brand} {confirmDelete?.model} {confirmDelete?.version}</span> del
          catálogo local. Esta acción no se puede deshacer en este dispositivo.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={deleteVehicle} className="btn-primary flex-1 bg-red-500 text-white hover:bg-red-600">
            Eliminar definitivamente
          </button>
          <button type="button" onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1">
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SellerCard({ seller, onSaved }: { seller: Seller; onSaved: () => void }) {
  const [phone, setPhone] = useState(seller.phone ?? "");
  const [active, setActive] = useState(seller.active);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await sellerRepository.update(seller.id, { phone: phone.replace(/[^\d+]/g, ""), active });
      onSaved();
      push(`Datos de ${seller.name} actualizados.`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "No fue posible guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="card p-5">
      <h3 className="text-base font-semibold text-white">{seller.name}</h3>
      <p className="text-xs text-steel">
        {seller.type} · {seller.city}
      </p>
      <div className="mt-4 space-y-3">
        <Field label="Teléfono / WhatsApp" htmlFor={`seller-phone-${seller.id}`} hint="Formato internacional sin signos: 573001112233">
          <input
            id={`seller-phone-${seller.id}`}
            type="tel"
            className="field"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Ej: 573001112233"
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/85">
          <input type="checkbox" className="size-4 accent-lime" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Perfil activo
        </label>
        <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2 text-xs disabled:opacity-60">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </article>
  );
}
