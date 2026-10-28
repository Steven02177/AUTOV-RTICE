import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, FileCheck2, ImagePlus, Loader2 } from "lucide-react";
import { submissionRepository } from "@/repositories";
import { useToast } from "@/components/ui/feedback";
import { Field } from "@/components/ui/primitives";
import ContactForm from "@/components/forms/ContactForm";
import { useDocumentMeta } from "@/utils/seo";
import { SITE, isDemoMode } from "@/config/site";
import { moneyInputMask, parseMoneyInput } from "@/utils/format";
import type { VehicleType } from "@/types/vehicle";

const CURRENT_YEAR = new Date().getFullYear();

const schema = z
  .object({
    vehicleType: z.enum(["carro", "moto"]),
    brand: z.string().trim().min(2, "Indica la marca."),
    model: z.string().trim().min(1, "Indica el modelo."),
    version: z.string().trim().min(1, "Indica la versión o acabado."),
    year: z.coerce
      .number({ invalid_type_error: "Indica un año válido." })
      .int("El año debe ser un número entero.")
      .min(1980, "Los anuncios admiten vehículos desde 1980.")
      .max(CURRENT_YEAR, `El año no puede superar ${CURRENT_YEAR}.`),
    mileage: z.coerce
      .number({ invalid_type_error: "Indica el kilometraje." })
      .int("El kilometraje debe ser un número entero.")
      .min(0, "El kilometraje no puede ser negativo.")
      .max(1000000, "Verifica el kilometraje: supera el millón de kilómetros."),
    price: z.coerce
      .number({ invalid_type_error: "Indica el precio esperado." })
      .min(500000, "El precio mínimo permitido es $500.000.")
      .max(2000000000, "Verifica el precio: supera los $2.000 millones."),
    city: z.string().trim().min(2, "Indica la ciudad."),
    description: z
      .string()
      .trim()
      .min(40, "Describe el vehículo con al menos 40 caracteres.")
      .max(1500, "La descripción no puede superar 1500 caracteres."),
    features: z.string().trim().min(5, "Lista al menos una característica."),
    photoCount: z.coerce
      .number({ invalid_type_error: "Indica cuántas fotos vas a adjuntar." })
      .int("Debe ser un número entero.")
      .min(3, "Adjunta al menos 3 fotografías.")
      .max(20, "Puedes adjuntar máximo 20 fotografías."),
    contactName: z.string().trim().min(3, "Escribe el nombre del propietario o contacto autorizado."),
    contactPhone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[^\d+]/g, ""))
      .refine((value) => /^\+?\d{8,15}$/.test(value), "Escribe un teléfono válido (mínimo 8 dígitos)."),
    contactEmail: z
      .string()
      .trim()
      .email("El correo no tiene un formato válido.")
      .optional()
      .or(z.literal("")),
    consent: z
      .boolean()
      .refine((value) => value === true, { message: "Debes autorizar el tratamiento de tus datos." }),
  })
  .refine((data) => !data.contactEmail || data.contactEmail.length > 0, {
    message: "Correo inválido.",
    path: ["contactEmail"],
  });

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { id: 1, label: "Datos del vehículo", icon: ClipboardList },
  { id: 2, label: "Descripción y fotos", icon: ImagePlus },
  { id: 3, label: "Contacto y envío", icon: FileCheck2 },
];

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ["vehicleType", "brand", "model", "version", "year", "mileage", "price", "city"],
  2: ["description", "features", "photoCount"],
  3: ["contactName", "contactPhone", "contactEmail", "consent"],
};

export default function SellVehiclePage() {
  const [step, setStep] = useState(1);
  const [confirmation, setConfirmation] = useState<{ id: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { push } = useToast();

  useDocumentMeta(
    `Vender mi vehículo | ${SITE.name}`,
    "Publica tu carro o moto en AUTOVÉRTICE. Tu anuncio pasa por revisión antes de aparecer en el catálogo.",
  );

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleType: "carro",
      brand: "",
      model: "",
      version: "",
      year: undefined,
      mileage: undefined,
      price: undefined,
      city: "",
      description: "",
      features: "",
      photoCount: undefined,
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      consent: false,
    },
    mode: "onBlur",
  });

  const priceValue = watch("price");
  const photoCount = watch("photoCount");

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step] as never[], { shouldFocus: true });
    if (valid) setStep((value) => Math.min(value + 1, 3));
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const submission = await submissionRepository.create({
        vehicleType: values.vehicleType,
        brand: values.brand,
        model: values.model,
        version: values.version,
        year: values.year,
        mileage: values.mileage,
        price: values.price,
        city: values.city,
        description: values.description,
        features: values.features.split(",").map((item) => item.trim()).filter(Boolean),
        photoCount: values.photoCount,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail || undefined,
      });
      setConfirmation({ id: submission.id });
      push("Tu anuncio quedó en revisión. Te contactaremos pronto.", "success");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No fue posible registrar el anuncio.");
      push("No fue posible enviar el anuncio. Revisa los datos.", "error");
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <div className="card p-8 text-center" role="status" aria-live="polite">
          <CheckCircle2 className="mx-auto size-12 text-lime" />
          <h1 className="display mt-4 text-3xl font-bold">Anuncio recibido</h1>
          <p className="mt-4 text-sm leading-relaxed text-steel">
            Registramos tu publicación con el identificador <span className="text-lime">{confirmation.id}</span>. El
            anuncio quedó en estado <strong className="text-white">pendiente</strong>: no aparece en el catálogo hasta
            que un administrador lo revise y lo apruebe.
          </p>
          <ol className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-white/80">
            <li>1. Un administrador revisa la información y las fotografías.</li>
            <li>2. Si algo falta, te contactamos para pedir correcciones.</li>
            <li>3. Al aprobarse, el anuncio se publica en el catálogo.</li>
          </ol>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/carros" className="btn-primary">
              Volver al catálogo
            </Link>
            <button type="button" onClick={() => { setConfirmation(null); setStep(1); }} className="btn-ghost">
              Publicar otro vehículo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <nav aria-label="Miga de pan" className="mb-3 text-xs text-steel">
          <Link to="/" className="transition hover:text-white">
            Inicio
          </Link>{" "}
          / Vender mi vehículo
        </nav>
        <h1 className="section-title">Vende tu carro o moto</h1>
        <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
          Completa la información en tres pasos. Tu anuncio queda en revisión hasta ser aprobado por un administrador:
          nunca publicamos automáticamente anuncios sin verificarlos.
        </p>
      </header>

      {isDemoMode && (
        <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-200">
          Modo demostración: las solicitudes se guardan en este navegador para simular el flujo de revisión. Con backend
          configurado se envían a la base de datos y las fotografías se suben al almacenamiento de imágenes.
        </p>
      )}

      <ol className="mb-8 grid gap-3 sm:grid-cols-3">
        {STEPS.map((item) => {
          const Icon = item.icon;
          const active = step === item.id;
          const done = step > item.id;
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                active ? "border-lime bg-lime/10 text-white" : done ? "border-lime/30 bg-white/5 text-white/80" : "border-white/8 text-steel"
              }`}
            >
              <span className={`flex size-8 items-center justify-center rounded-full ${active ? "bg-lime text-graphite" : "bg-white/10"}`}>
                {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
              </span>
              {item.label}
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-5">
            <Field label="Tipo de vehículo" htmlFor="sell-type" required>
              <div className="flex gap-3">
                {(["carro", "moto"] as VehicleType[]).map((type) => (
                  <label
                    key={type}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      watch("vehicleType") === type ? "border-lime bg-lime/15 text-lime" : "border-white/12 text-white/70 hover:border-white/30"
                    }`}
                  >
                    <input type="radio" value={type} className="sr-only" {...register("vehicleType")} />
                    {type === "carro" ? "Carro" : "Moto"}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Marca" htmlFor="sell-brand" error={errors.brand?.message} required>
                <input id="sell-brand" type="text" className="field" {...register("brand")} />
              </Field>
              <Field label="Modelo" htmlFor="sell-model" error={errors.model?.message} required>
                <input id="sell-model" type="text" className="field" {...register("model")} />
              </Field>
            </div>

            <Field label="Versión o acabado" htmlFor="sell-version" error={errors.version?.message} required>
              <input id="sell-version" type="text" className="field" placeholder="Ej: LX 1.6, Zen 1.0, Sport 250" {...register("version")} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Año" htmlFor="sell-year" error={errors.year?.message} required>
                <input id="sell-year" type="number" inputMode="numeric" className="field" placeholder="2021" {...register("year")} />
              </Field>
              <Field label="Kilometraje" htmlFor="sell-mileage" error={errors.mileage?.message} required>
                <input id="sell-mileage" type="number" inputMode="numeric" className="field" placeholder="45000" {...register("mileage")} />
              </Field>
              <Field label="Ciudad" htmlFor="sell-city" error={errors.city?.message} required>
                <input id="sell-city" type="text" className="field" {...register("city")} />
              </Field>
            </div>

            <Field
              label="Precio esperado (COP)"
              htmlFor="sell-price"
              error={errors.price?.message}
              hint={priceValue ? `Registrado: $${Number(priceValue).toLocaleString("es-CO")}` : "Ej: 52000000"}
              required
            >
              <input
                id="sell-price"
                type="text"
                inputMode="numeric"
                className="field"
                value={priceValue ? moneyInputMask(String(priceValue)) : ""}
                onChange={(event) => setValue("price", parseMoneyInput(event.target.value) ?? 0, { shouldValidate: true })}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field
              label="Descripción"
              htmlFor="sell-description"
              error={errors.description?.message}
              hint="Menciona estado, mantenimiento, equipamiento y particularidades. Mínimo 40 caracteres."
              required
            >
              <textarea id="sell-description" rows={6} className="field resize-y" {...register("description")} />
            </Field>

            <Field
              label="Características destacadas"
              htmlFor="sell-features"
              error={errors.features?.message}
              hint="Sepáralas con comas. Ej: Aire acondicionado, cámara de reversa, ABS."
              required
            >
              <input id="sell-features" type="text" className="field" {...register("features")} />
            </Field>

            <Field
              label="Cantidad de fotografías"
              htmlFor="sell-photos"
              error={errors.photoCount?.message}
              hint="Adjunta entre 3 y 20 fotos reales del vehículo. En el entorno de demostración solo se registra la cantidad."
              required
            >
              <input
                id="sell-photos"
                type="number"
                inputMode="numeric"
                className="field"
                placeholder="6"
                {...register("photoCount")}
              />
            </Field>

            {photoCount !== undefined && Number(photoCount) > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-steel">
                Vas a adjuntar <span className="text-lime">{Number(photoCount)}</span> fotografía
                {Number(photoCount) === 1 ? "" : "s"}. Recomendamos incluir carrocería, interior, tablero y papeles
                (sin datos sensibles).
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del propietario o contacto autorizado" htmlFor="sell-name" error={errors.contactName?.message} required>
                <input id="sell-name" type="text" autoComplete="name" className="field" {...register("contactName")} />
              </Field>
              <Field label="Teléfono" htmlFor="sell-phone" error={errors.contactPhone?.message} hint="Formato: 3001234567" required>
                <input id="sell-phone" type="tel" inputMode="tel" autoComplete="tel" className="field" {...register("contactPhone")} />
              </Field>
            </div>

            <Field label="Correo electrónico (opcional)" htmlFor="sell-email" error={errors.contactEmail?.message}>
              <input id="sell-email" type="email" autoComplete="email" className="field" {...register("contactEmail")} />
            </Field>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-steel">
              <p className="font-semibold text-white">Resumen del anuncio</p>
              <ul className="mt-2 space-y-1">
                <li>
                  {watch("vehicleType") === "carro" ? "Carro" : "Moto"} · {watch("brand")} {watch("model")} {watch("version")}
                </li>
                <li>
                  {watch("year")} · {Number(watch("mileage") ?? 0).toLocaleString("es-CO")} km ·{" "}
                  {Number(watch("price") ?? 0).toLocaleString("es-CO")} {SITE.name}
                </li>
                <li>Ciudad: {watch("city")}</li>
              </ul>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-steel">
              <input type="checkbox" className="mt-0.5 size-4 accent-lime" {...register("consent")} />
              <span>
                Autorizo el tratamiento de mis datos para la publicación y seguimiento del anuncio, conforme a la
                política de privacidad. Confirmo que la información es veraz y que soy el propietario o contacto
                autorizado del vehículo.
              </span>
            </label>
            {errors.consent && (
              <p role="alert" className="text-xs font-medium text-red-300">
                {errors.consent.message}
              </p>
            )}
          </div>
        )}

        {serverError && (
          <p role="alert" className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
            {serverError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(value - 1, 1))}
            disabled={step === 1}
            className="btn-ghost disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Atrás
          </button>

          {step < 3 ? (
            <button type="button" onClick={goNext} className="btn-primary">
              Continuar <ChevronRight className="size-4" />
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Enviando...
                </>
              ) : (
                "Enviar a revisión"
              )}
            </button>
          )}
        </div>
      </form>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="display text-xl font-bold">¿Necesitas ayuda para publicar?</h2>
        <p className="mt-2 text-sm text-steel">
          Déjanos tus datos y un asesor te acompaña con el proceso, o revisa las preguntas frecuentes.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <ContactForm defaultRequestType="publicar-vehiculo" source="publicacion" compact />
          <div className="space-y-3 text-sm text-steel">
            <p>Consejos para un anuncio que recibe más consultas:</p>
            <ul className="space-y-2">
              <li>• Usa fotografías recientes, en buen día, sin filtros.</li>
              <li>• Menciona mantenimientos y documentos al día.</li>
              <li>• Fija un precio revisando anuncios similares del catálogo.</li>
              <li>• Responde rápido: el contacto llega directo a tu teléfono.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
