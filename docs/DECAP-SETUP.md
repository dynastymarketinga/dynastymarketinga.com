# Panel de administración del Portfolio (Decap CMS)

La hermana de Valeria edita el portfolio en:

**https://www.dynastymarketinga.com/admin/**

(Sitio local: http://localhost:4321/admin/)

El panel usa la estética Dynasty (Cinzel, Montserrat, colores burdeos), **miniaturas** en la lista de proyectos y una **vista previa visual** a la derecha que replica el detalle del proyecto.

---

## Hosting en producción

| Qué | Dónde |
|-----|-------|
| Sitio público | **Vercel** — proyecto `dynastymarketinga-com` |
| Dominio | `www.dynastymarketinga.com` |
| Rama de deploy | `main` (push → Vercel rebuild automático) |
| CMS | `/admin/` servido como página estática de Astro |

GitHub Pages está **desactivado** (`.github/workflows/deploy.yml`). No uses `public/CNAME` — el DNS apunta a Vercel.

---

## Qué puede editar

| En el panel | Qué hace |
|-------------|----------|
| **Foto de la carta** | Miniatura en la lista del admin + imagen en `/portfolio` |
| **Título** / **Subtítulo** / **Descripción** | Textos del detalle del proyecto |
| **Logo** | Logo en la presentación del proyecto |
| **Fotos del proyecto** | Bloques de 1, 2 o 3 imágenes (galería) |
| **Posición en la lista** | Orden (1 = primero) |
| **Mostrar en el sitio** | Publicar u ocultar un proyecto |
| **Tipo de trabajo** | Filtro: Branding, Redes sociales, Contenido, etc. |

**No puede editar:** home, servicios, contacto, diseño global.

**Lista con miniaturas:** `npm run portfolio:index` genera `public/admin/portfolio-index.json`; el script `dynasty-cms-boot.js` inyecta la foto de carta en cada fila.

---

## Desarrollo local (sin OAuth)

1. Añade **temporalmente** al inicio de `public/admin/config.yml`:

```yaml
local_backend: true
```

2. Terminal 1 — sitio:

```bash
npm run dev
```

3. Terminal 2 — backend local de Decap:

```bash
npm run cms
```

4. Abre http://localhost:4321/admin/ — login automático en local.

5. **Antes de commit a `main`**, quita `local_backend: true` (producción usa OAuth).

Ver también `public/admin/config.local.yml.example`.

---

## Producción: login con GitHub (todo en Vercel)

El sitio vive en **Vercel**, no en Netlify. Decap CMS (antes “Netlify CMS”) solo comparte el nombre — el login corre en **funciones serverless de Vercel** (`/api/auth` y `/api/callback`).

### ¿Por qué no le paso mi usuario y contraseña de GitHub?

**No lo hagas.** El panel es una página web: cualquier contraseña o token escrito en el código o en el navegador lo podría ver cualquiera. Además, si ella usa **su propia cuenta GitHub** (invitada al repo), tú no compartes acceso personal y puedes quitarla cuando quieras.

Lo correcto: **una vez** pulsa “Iniciar sesión con GitHub” con la cuenta de ella. GitHub pide permiso al repo y listo — como “Continuar con Google”.

### Paso 1 — Invitar a tu hermana al repo

1. GitHub → `dynastymarketinga/dynastymarketinga.com` → **Settings → Collaborators**
2. Invítala con rol **Write** (puede editar contenido, no borrar el repo entero)

### Paso 2 — Crear GitHub OAuth App (solo tú, una vez)

1. [GitHub → Developer settings → OAuth Apps → New](https://github.com/settings/developers)
2. **Application name:** Dynasty CMS
3. **Homepage URL:** `https://www.dynastymarketinga.com`
4. **Authorization callback URL:** `https://www.dynastymarketinga.com/api/callback`
5. Guarda **Client ID** y genera **Client Secret**

### Paso 3 — Variables en Vercel

Vercel → proyecto `dynastymarketinga-com` → **Settings → Environment Variables** (Production):

| Variable | Valor |
|----------|--------|
| `ORIGIN` | `www.dynastymarketinga.com,dynastymarketinga.com` |
| `COMPLETE_URL` | `https://www.dynastymarketinga.com/api/callback` |
| `ADMIN_PANEL_URL` | `https://www.dynastymarketinga.com/admin/` |
| `OAUTH_CLIENT_ID` | *(Client ID del paso 2)* |
| `OAUTH_CLIENT_SECRET` | *(Client Secret del paso 2)* |

Redeploy después de guardar las variables.

Plantilla: [`.env.example`](../.env.example) en la raíz del repo.

### Paso 4 — Probar

1. Abre https://www.dynastymarketinga.com/admin/
2. **Iniciar sesión con GitHub** (cuenta de tu hermana)
3. Edita un proyecto de prueba → **Publicar**

`config.yml` apunta al OAuth de Vercel:

```yaml
backend:
  name: github
  repo: dynastymarketinga/dynastymarketinga.com
  branch: main
  base_url: https://www.dynastymarketinga.com
  auth_endpoint: api/auth
```

---

## Flujo de publicación

1. Hermana entra a `/admin`, edita un proyecto, sube imágenes.
2. Revisa la **vista previa** en el panel derecho.
3. Pulsa **Publicar** para guardar.
4. Decap hace commit a `main` en GitHub.
5. **Vercel** reconstruye el sitio (~1–2 min).
6. Cambios visibles en `/portfolio`.

---

## Imágenes y biblioteca Medios

| Origen | Ruta |
|--------|------|
| Imágenes **nuevas** desde el CMS | `public/assets/portfolio/` → URL `/assets/portfolio/...` |
| Imágenes **existentes** del sitio | `/assets/be-academy/`, `/assets/dynasty-marketing/`, etc. |

**No muevas** carpetas de assets masivamente — las URLs en producción ya las usan.

Al **reemplazar** una foto en el panel, Decap guarda la nueva ruta en el JSON automáticamente.

**Medios** en el admin muestra solo lo subido vía CMS (`/assets/portfolio/`). Es normal que no aparezcan todas las imágenes del sitio — el resto vive en sus carpetas originales.

---

## Ramas

- **Producción:** `main` (Vercel + CMS OAuth)
- **Desarrollo:** ramas feature; para probar CMS local usa `local_backend: true`
