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

## Producción: login con GitHub

Decap guarda cambios directamente en el repo GitHub (`branch: main`). Para login en producción necesitas **OAuth**.

### Netlify Identity (recomendada, gratis)

1. Crea un sitio en [Netlify](https://netlify.com) (puede estar vacío, solo para auth).
2. Settings → Identity → Enable Identity.
3. Settings → Identity → Services → Enable Git Gateway **o** OAuth externo.
4. `public/admin/config.yml` ya incluye:

```yaml
backend:
  name: github
  repo: dynastymarketinga/dynastymarketinga.com
  branch: main
  base_url: https://dynastymarketinga.com
  auth_endpoint: https://api.netlify.com/auth
```

5. Invita a la hermana: Netlify Identity → Invite users (email).

### Acceso al repo

La cuenta que edita debe ser **colaboradora** del repo:

1. Repo `dynastymarketinga/dynastymarketinga.com` → Settings → Collaborators.
2. Invita la cuenta GitHub de la hermana con rol **Write**.

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
