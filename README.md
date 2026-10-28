# AUTOVÉRTICE

Marketplace premium de **carros y motos** en Colombia: catálogo con filtros reales, comparador, favoritos, asistente de recomendaciones, flujo de publicación con revisión y panel administrativo.

Proyecto funcional con **modo demostración** (sin backend, datos ficticios claramente etiquetados) y arquitectura lista para **Supabase** (PostgreSQL + RLS + Auth) sin cambiar el código de la aplicación.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Funcionalidades](#funcionalidades)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Modo demostración](#modo-demostración)
- [Backend con Supabase](#backend-con-supabase)
- [Panel administrativo](#panel-administrativo)
- [WhatsApp y contacto](#whatsapp-y-contacto)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Verificación](#verificación)
- [Pendientes de configuración externa](#pendientes-de-configuración-externa)
- [Notas y créditos](#notas-y-créditos)

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | React 18 + TypeScript 5 |
| Build | Vite 6 |
| Estilos | Tailwind CSS 4 (`@theme` + `@utility`) |
| Enrutamiento | React Router 6 |
| Formularios | React Hook Form + Zod |
| Carrusel | Embla Carousel |
| Iconos | Lucide React |
| Backend (opcional) | Supabase (PostgREST + Auth) vía adaptador propio |

---

## Funcionalidades

**Público**

- **Inicio**: hero, carrusel de destacados, categorías, buscador rápido, asistente de compra, oportunidades de precio (calculadas contra la mediana de su grupo), estilos de vida, comparador, confianza, guías editoriales y pie de página.
- **Catálogo** (`/carros`, `/motos`): filtros combinables (palabra clave, estado, precio, año, kilometraje, marca, modelo, ciudad, tipo de vendedor, carrocería/categoría, combustible, transmisión, tracción, cilindraje, puertas, pasajeros), ordenamiento (6 opciones), paginación y **sincronización bidireccional con la URL** (los filtros se pueden compartir o recargar).
- **Ficha de vehículo** (`/carros/:slug`, `/motos/:slug`): galería con lightbox, especificaciones completas, notas de verificación, **calculadora de costos estimados** (seguro SOAT/Tecnomecánica, impuestos, cuota de crédito con enganche y tasa editables), vehículos similares y contacto con el vendedor.
- **Asistente "Encontrar mi vehículo"** (`/encontrar`): asistente tipo chat con motor de puntuación **determinista y explicable** (cada recomendación muestra por qué apareció).
- **Comparador** (`/comparar`): máximo 3 vehículos del mismo tipo, con resaltado de diferencias.
- **Favoritos** (`/favoritos`): persistencia en `localStorage`.
- **Vender** (`/vender`): formulario en 3 pasos con validación Zod; el anuncio queda en estado `pendiente` hasta que un administrador lo apruebe.
- **Contacto** (`/contacto`): consultas, solicitudes de prueba de manejo y financiación.
- **Guías** (`/guias`): artículos editoriales de compra.
- Estados de carga, error y vacío en cada vista; 404 personalizada; accesibilidad (labels, aria, foco visible, `prefers-reduced-motion`); SEO (títulos/descripciones por ruta, Open Graph, `robots.txt`, favicon SVG).

**Administración** (`/admin`)

- Autenticación real con roles (`admin` / `vendedor`), sesión de 8 horas.
- Métricas del panel calculadas con datos reales (conteos, precios, estado del catálogo).
- Gestión de vehículos: crear, editar, pausar, marcar como vendido, eliminar (con confirmación).
- Revisión de publicaciones de usuarios: **aprobar crea el vehículo publicado; rechazar deja constancia**.
- Gestión de consultas (cambio de estado) y de vendedores (teléfono/WhatsApp editable por vendedor).

---

## Requisitos previos

- Node.js 18+ (probado con Node 24) y npm 9+.
- Conexión a internet solo para `npm install` (la aplicación no la necesita en modo demo).

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) configurar variables de entorno
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux

# 3. Arrancar en modo desarrollo
npm run dev                 # http://localhost:5173

# 4. Build de producción
npm run build               # genera dist/

# 5. Vista previa del build
npm run preview
```

Sin `.env`, la aplicación arranca en **modo demo** con el catálogo de demostración incluido.

### Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Typecheck (`tsc -b`) + build de producción |
| `npm run preview` | Sirve el build de `dist/` |
| `npm run typecheck` | Solo verifica tipos sin generar archivos |

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores. **Nunca subas `.env` al repositorio** (ya está en `.gitignore`).

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_DATA_MODE` | No | `demo` (por defecto) o `supabase`. |
| `VITE_SUPABASE_URL` | Sí en modo supabase | URL del proyecto, por ejemplo `https://xxx.supabase.co`. |
| `VITE_SUPABASE_ANON_KEY` | Sí en modo supabase | Clave pública (anon). Es la única que vive en el navegador. |
| `VITE_DEFAULT_WHATSAPP` | No | Teléfono/plataforma en formato internacional sin signos (ej: `573001112233`). |
| `VITE_IMAGE_BASE_URL` | No | Prefijo para imágenes remotas (ej: bucket de Supabase Storage). |

> La clave **Service Role** de Supabase jamás se coloca en variables `VITE_*`: viajaría al navegador. Las operaciones sensibles se restringen con RLS en el servidor.

---

## Modo demostración

- Es el modo por defecto: no requiere backend ni credenciales.
- El catálogo incluye **22 carros y 16 motos ficticios** (marcas y modelos reales, pero precios, anuncios y vendedores inventados para evaluar la plataforma).
- Todos los anuncios de demostración llevan la etiqueta **"DEMOSTRACIÓN"** y el sitio muestra un aviso permanente de que los datos son ficticios.
- Cuando un dato no existe se muestra **"No informado"**: nunca se inventan especificaciones técnicas.
- Persistencia local (`localStorage`, prefijo `av:`): favoritos, comparación, consultas, publicaciones de usuarios, vendedores editados, vehículos creados desde el panel y la sesión de administración. Todo se limpia desde **Admin > Borrar datos locales**.

---

## Backend con Supabase

La aplicación no depende de Supabase: el acceso a datos pasa por una capa de repositorios (`src/repositories/`) con dos implementaciones intercambiables:

- `demoStore.ts` → catálogo embebido + `localStorage`.
- `index.ts` (adaptador Supabase) → PostgREST con la clave anon, con mapeo camelCase ↔ snake_case.

La selección se hace automáticamente según `VITE_DATA_MODE`; **ninguna página conoce el proveedor**.

### Pasos para conectar un proyecto real

1. Crea el proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta el archivo [`supabase/schema.sql`](supabase/schema.sql). Crea:
   - Tablas: `profiles`, `sellers`, `vehicles`, `inquiries`, `vehicle_submissions`.
   - **Row Level Security** en todas: el catálogo público solo lee vehículos `publicado`; cualquier visitante puede enviar consultas y publicaciones; la gestión completa es solo para el rol `admin`.
   - Trigger que crea el perfil de usuario al registrarse.
3. En **Authentication > Providers** deja habilitado el Email.
4. Copia `.env.example` a `.env` y completa:

   ```env
   VITE_DATA_MODE=supabase
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   ```

5. Reinicia `npm run dev`. El login de `/admin` pasará a usar **Supabase Auth** automáticamente.

### Consideraciones importantes

- Las políticas RLS exigen que exista el `perfil` con `role = 'admin'`: hasta entonces el servidor rechaza las escrituras (eso es intencional).
- Las imágenes remotas deben permitir el hotlinking de tu dominio; usa `VITE_IMAGE_BASE_URL` para apuntar a tu bucket.
- El envío de correos (notificaciones al aprobar un anuncio, por ejemplo) **no está implementado**: se debe agregar con Supabase Edge Functions.

---

## Panel administrativo

Ruta: **`/admin`**

### Modo demo (sin backend)

1. Ingresa a `/admin`: al no existir usuarios, aparece el flujo **"Crear primer administrador"**.
2. Crea el usuario con correo y contraseña (mínimo 8 caracteres). Solo funciona la **primera vez**: luego el formulario desaparece.
3. Cierra sesión y vuelve a entrar con esas credenciales.

> La contraseña se guarda hasheada con SHA-256 en `localStorage`. Esto protege contra exposición casual en un proyecto de demostración, **no es un sistema de autenticación para producción**: en producción se usa Supabase Auth.

### Modo Supabase

1. Registra el usuario desde la aplicación o desde **Authentication > Add user** (con correo confirmado).
2. Asigna el rol admin ejecutando en el SQL Editor:

   ```sql
   update public.profiles
      set role = 'admin'
    where email = 'tu-correo@ejemplo.com';
   ```

3. Ese usuario podrá administrar catálogo, consultas y publicaciones desde `/admin`.

### Flujo de revisión de publicaciones

1. Un usuario envía su anuncio desde **`/vender`** → estado `pendiente`.
2. En `/admin > Publicaciones` el administrador lo revisa.
3. **Aprobar** crea el vehículo con estado `publicado` en el catálogo; **rechazar** deja registro con su motivo.

---

## WhatsApp y contacto

- La aplicación **nunca inventa números**: el botón de WhatsApp solo se activa si existe un número configurado.
- Fuentes, en orden de prioridad:
  1. Teléfono del vendedor editado desde el panel administrativo.
  2. Variable `VITE_DEFAULT_WHATSAPP`.
  3. Sin número: se desactiva el botón y se ofrece el formulario de contacto (canal interno).
- El mensaje incluye el nombre del vehículo y el enlace a su ficha para dar contexto al vendedor.

---

## Estructura del proyecto

```
├── public/
│   ├── images/               # Fotografías locales del catálogo + credits.json
│   ├── favicon.svg
│   └── robots.txt
├── scripts/
│   ├── download-images.mjs   # Descarga imágenes de Wikimedia Commons / Unsplash
│   └── fix-images.mjs        # Reparación/reutilización de descargas
├── supabase/
│   └── schema.sql            # Esquema completo: tablas, RLS, triggers, roles
└── src/
    ├── components/
    │   ├── comparison/       # Comparador y barra flotante
    │   ├── filters/          # Panel de filtros (escritorio y móvil)
    │   ├── forms/            # Formulario de contacto
    │   ├── layout/           # Navbar, Footer, Layout
    │   ├── recommendations/  # Asistente de compra
    │   ├── ui/               # Primitivas, feedback (loading/error/empty), toasts
    │   └── vehicles/         # Tarjetas y carrusel
    ├── config/site.ts        # Configuración central del sitio
    ├── context/ShopContext.tsx # Favoritos y comparación globales
    ├── data/                 # Datos demo: vehículos, vendedores, artículos
    ├── pages/                # Una página por ruta
    ├── repositories/         # Capa de datos (demo ↔ Supabase)
    ├── services/             # Filtrado, costos, recomendaciones, WhatsApp, auth
    ├── styles/index.css      # Sistema de diseño (Tailwind 4)
    ├── types/vehicle.ts      # Tipos compartidos
    └── utils/                # Formato, SEO, filtros ↔ URL
```

---

## Verificación

Ejecutado sobre este código:

- **`npm run typecheck`** → sin errores de tipos.
- **`npm run build`** → build de producción correcto (`tsc -b` + Vite).
- **Verificación manual en navegador** (flujo completo, consola sin errores):
  - Inicio: carrusel de destacados, categorías, oportunidades calculadas contra la mediana, estilos de vida y comparador.
  - Catálogo: filtros combinados (marca + estado), sincronización con la URL, ordenamiento, paginación, drawer de filtros en tablet/móvil y facets limitadas al tipo de vehículo.
  - Ficha de vehículo: galería, especificaciones con "No informado" cuando falta dato, calculadora de costos y ausencia de WhatsApp inventado (usa formulario).
  - Favoritos y comparación: persistencia, barra flotante, comparación lado a lado con diferencias resaltadas y bloqueo de tipos mixtos.
  - Asistente: las 10 preguntas, resultados con porcentaje de compatibilidad y explicación "por qué aparece".
  - Vender: formulario de 3 pasos con validación → anuncio `pendiente` → aprobación en el panel → visible en el catálogo público.
  - Panel admin: creación del primer administrador, login, persistencia de sesión al navegar, métricas reales, aprobación de publicaciones y bandeja de solicitudes.
  - Formulario de contacto, página 404 y menú móvil.

Durante la verificación se corrigieron: el cruce de `<Link>` fuera del router (barra de comparación), la sesión de administrador no persistente tras el alta, el hueco de filtros entre 640 y 1024 px, las facets globales en catálogos por tipo y el mapeo camelCase ↔ snake_case del adaptador Supabase.

---

## Pendientes de configuración externa

Estos puntos requieren decisiones o recursos fuera del repositorio:

1. **Credenciales de Supabase** (URL + clave anon) para salir del modo demo, y ejecución de `supabase/schema.sql`.
2. **Número de WhatsApp real** (`VITE_DEFAULT_WHATSAPP` o vendedor por defecto en el panel).
3. **Fotografías propias de los vehículos**: las actuales son de Wikimedia Commons/Unsplash con fines de demostración (`public/images/credits.json`).
4. **Dominio y certificado SSL** para despliegue.
5. **Notificaciones por correo** (aprobación de anuncios, consultas): requiere Edge Functions de Supabase u otro servicio transaccional.
6. **Subida real de fotos** en el flujo "Vender": hoy se registra el número de fotos que el usuario tendrá listas; la carga a un bucket está pendiente.

---

## Notas y créditos

- Proyecto de demostración: **AUTOVÉRTICE** es una marca ficticia; los anuncios, precios y vendedores no representan ofertas reales.
- Imágenes: Wikimedia Commons y Unsplash, con atribución en `public/images/credits.json`.
- Licencia del código: uso académico ( Ingeniería de Prompts, 2026 ).
