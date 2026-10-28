import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { inquiryRepository } from "@/repositories";
import { useToast } from "@/components/ui/feedback";
import { Field } from "@/components/ui/primitives";
import type { InquiryType } from "@/types/vehicle";

const REQUEST_LABELS: Record<InquiryType, string> = {
  "consulta-vehiculo": "Consulta por un vehículo",
  "prueba-manejo": "Solicitar prueba de manejo",
  "informacion-adicional": "Pedir información adicional",
  financiacion: "Opciones de financiación",
  "publicar-vehiculo": "Publicar un vehículo",
  asesoria: "Recibir asesoría",
};

const schema = z
  .object({
    name: z.string().trim().min(3, "Escribe tu nombre completo."),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[^\d+]/g, ""))
      .refine((value) => /^\+?\d{8,15}$/.test(value), "Escribe un teléfono válido (mínimo 8 dígitos)."),
    email: z
      .string()
      .trim()
      .email("El correo no tiene un formato válido.")
      .optional()
      .or(z.literal("")),
    city: z.string().trim().min(2, "Indica tu ciudad."),
    requestType: z.enum([
      "consulta-vehiculo",
      "prueba-manejo",
      "informacion-adicional",
      "financiacion",
      "publicar-vehiculo",
      "asesoria",
    ]),
    message: z.string().trim().max(1200, "El mensaje no puede superar 1200 caracteres.").optional(),
    consent: z
      .boolean()
      .refine((value) => value === true, { message: "Debes autorizar el tratamiento de tus datos." }),
    website: z.string().max(0).optional(),
  })
  .refine((data) => !data.email || data.email.length > 0, { message: "Correo inválido.", path: ["email"] });

type FormValues = z.infer<typeof schema>;

export interface ContactFormProps {
  defaultRequestType?: InquiryType;
  vehicleId?: string;
  vehicleLabel?: string;
  source?: "contacto" | "ficha-vehiculo" | "publicacion" | "prueba-manejo" | "financiacion";
  compact?: boolean;
}

export default function ContactForm({
  defaultRequestType = "consulta-vehiculo",
  vehicleId,
  vehicleLabel,
  source = "contacto",
  compact = false,
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { push } = useToast();
  const mountedAt = useState(() => Date.now())[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      requestType: defaultRequestType,
      message: "",
      consent: false,
      website: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    // Protección básica contra bots: si el formulario se envía en menos de 2 s, se descarta.
    if (Date.now() - mountedAt < 2000 && !values.message) {
      setServerError("El envío fue demasiado rápido. Revisa los campos e inténtalo de nuevo.");
      return;
    }
    try {
      const inquiry = await inquiryRepository.create({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        city: values.city,
        vehicleId,
        vehicleLabel,
        requestType: values.requestType,
        message: values.message || undefined,
        consent: values.consent,
        source,
      });
      setSubmitted(inquiry.id);
      reset();
      push("Tu solicitud fue registrada correctamente.", "success");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No fue posible enviar el formulario.");
      push("No fue posible enviar el formulario. Revisa los datos e inténtalo de nuevo.", "error");
    }
  };

  if (submitted) {
    return (
      <div className="card flex flex-col items-start gap-3 p-6" role="status" aria-live="polite">
        <CheckCircle2 className="size-8 text-lime" />
        <h3 className="display text-2xl font-bold">Solicitud registrada</h3>
        <p className="text-sm leading-relaxed text-steel">
          Guardamos tu solicitud con el identificador <span className="text-lime">{submitted}</span>. Un asesor dará
          seguimiento con los datos que nos enviaste.
          {vehicleLabel && <> Tu consulta corresponde a: <span className="text-white">{vehicleLabel}</span>.</>}
        </p>
        <button type="button" onClick={() => setSubmitted(null)} className="btn-ghost mt-2">
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={compact ? "space-y-4" : "space-y-5"}>
      <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} className="hidden" aria-hidden="true" />

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field label="Nombre completo" htmlFor="contact-name" error={errors.name?.message} required>
          <input id="contact-name" type="text" autoComplete="name" className="field" {...register("name")} />
        </Field>
        <Field label="Teléfono" htmlFor="contact-phone" error={errors.phone?.message} hint="Formato: 3001234567" required>
          <input id="contact-phone" type="tel" inputMode="tel" autoComplete="tel" className="field" {...register("phone")} />
        </Field>
      </div>

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field label="Correo electrónico (opcional)" htmlFor="contact-email" error={errors.email?.message}>
          <input id="contact-email" type="email" autoComplete="email" className="field" {...register("email")} />
        </Field>
        <Field label="Ciudad" htmlFor="contact-city" error={errors.city?.message} required>
          <input id="contact-city" type="text" autoComplete="address-level2" className="field" {...register("city")} />
        </Field>
      </div>

      <Field label="Tipo de solicitud" htmlFor="contact-request" error={errors.requestType?.message} required>
        <select id="contact-request" className="field" {...register("requestType")}>
          {Object.entries(REQUEST_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      {vehicleLabel && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span className="text-steel">Vehículo de interés: </span>
          <span className="font-semibold text-white">{vehicleLabel}</span>
        </div>
      )}

      <Field label="Mensaje (opcional)" htmlFor="contact-message" error={errors.message?.message}>
        <textarea id="contact-message" rows={4} className="field resize-y" placeholder="Cuéntanos qué necesitas saber..." {...register("message")} />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-steel">
        <input type="checkbox" className="mt-0.5 size-4 accent-lime" {...register("consent")} />
        <span>
          Autorizo el tratamiento de mis datos personales para dar seguimiento a esta solicitud, conforme a la{" "}
          <span className="text-lime">política de privacidad</span>. Mis datos no se comparten con terceros con fines
          publicitarios.
        </span>
      </label>
      {errors.consent && (
        <p role="alert" className="text-xs font-medium text-red-300">
          {errors.consent.message}
        </p>
      )}

      {serverError && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
          {serverError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Enviando...
          </>
        ) : (
          <>
            <Send className="size-4" /> Enviar solicitud
          </>
        )}
      </button>
      <p className="text-center text-[11px] text-steel">
        No guardamos datos sensibles. Puedes solicitar la eliminación de tu información en cualquier momento.
      </p>
    </form>
  );
}
