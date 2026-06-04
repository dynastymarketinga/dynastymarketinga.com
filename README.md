# Dynasty Marketing Agency — Web

Sitio estático con [Astro](https://astro.build). Diseño original conservado (pixel-parity); código por rutas, componentes y scripts.

## Desarrollo

```bash
npm install
cp .env.example .env   # opcional: Formspree
npm run dev
```

- http://localhost:4321/ — Home
- http://localhost:4321/portfolio — Portfolio
- http://localhost:4321/contact — Contacto

## Build y deploy

```bash
npm run build
npm run preview
```

### GitHub Pages (automático)

En cada push a `main`, GitHub Actions ejecuta `npm run build` y publica **solo** el contenido de `dist/` (no subas `dist/` a mano).

1. Repo: `dynastymarketinga/dynastymarketinga.com`
2. En GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. DNS del dominio `dynastymarketinga.com` apuntando a GitHub Pages (ver docs de Pages)
4. Opcional: secret `PUBLIC_FORMSPREE_ENDPOINT` en **Settings → Secrets → Actions**

### Deploy manual

Sube **todo** el contenido de `dist/` al hosting (incluye imágenes, `videos/`, `assets/`).

Los videos fuente no usados viven en `_archive/public-assets-raw/` (no van al build). `npm run prune:public` los saca de `public/assets/raw/` si vuelven a aparecer.

Sitio configurado: `https://dynastymarketinga.com` (`astro.config.mjs`).

## Estructura

```
public/                 # Estáticos (imágenes, videos, robots.txt)
  styles/               # ← generado desde src/styles/
  scripts/              # ← generado desde src/scripts/
src/
  components/Hero.astro # Hero de home (resto en partials)
  layouts/BaseLayout.astro
  pages/                # index, portfolio, contact
  partials/             # HTML legacy por sección
  content/cases/        # JSON (fase 2: /work/[slug])
  styles/               # Fuente CSS
  scripts/              # Fuente JS
scripts/
  copy-public.mjs       # src → public (CSS/JS)
  audit-root.mjs        # qué archivos de la raíz se pueden archivar
  archive-root.mjs      # mueve borradores y carpetas legacy a _archive/
  extract-legacy.mjs
index.legacy.html       # Referencia visual
```

### Fuente vs. servido (`src/` → `public/`)

Editar **solo** `src/styles/` y `src/scripts/`. `predev` / `prebuild` ejecutan `npm run copy:public` antes de dev/build.

### SEO

- `canonical`, `description` y Open Graph por página en `BaseLayout.astro`
- `public/robots.txt`
- Sitemap generado en build (`@astrojs/sitemap` → `dist/sitemap-index.xml`)

### Formulario de contacto

1. Crea un formulario en [Formspree](https://formspree.io)
2. Copia `.env.example` → `.env`
3. Añade `PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxx`
4. Sin variable de entorno: sigue el fallback `mailto:`

### Auditar archivos sueltos en la raíz

```bash
npm run audit:root
```

Lista qué conviene **keep**, **archive** o **review**.

Para limpiar la raíz (borradores de diseño, `project-*.html`, carpetas duplicadas):

```bash
npm run archive:root
```

Eso mueve todo a `_archive/` (gitignored). Borra `_archive/` cuando ya no necesites copias de seguridad.

## Regenerar partials desde legacy

```bash
npm run extract
```

## Fase 2 (pendiente)

- Rutas `/work/[slug]` desde `src/content/cases/*.json`
- Más componentes Astro (Nav, Services, ProjectCard…)
- Blog / CMS

## Notas

- **Design frozen:** no cambiar tokens (`:root`), clases ni copy sin revisión visual.
- Teléfonos unificados: `+1 (305) 339-3754` y `+58 424-5512363`.
- `axones/` es sitio aparte; el portfolio enlaza a `/axones/`.
