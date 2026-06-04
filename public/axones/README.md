# Axones — landing fallback (HTML)

Página estática de presentación / demo hasta publicar `pulse-ui-react` + API en dominio real.

## Contenido

- `index.html` — landing principal
- `axones.css` — estilos (paleta violeta/lavanda del UI)
- `assets/` — logo y capturas de pantalla

## Activar el demo en línea

En `index.html`, asigna la URL del login:

```js
const AXONES_DEMO_URL = "https://app.tudominio.com/axones/auth/basic/login";
```

## Copiar a DYNAM

```powershell
Copy-Item -Recurse -Force "axones-fallback-landing\*" "C:\Users\pc\Downloads\Dynam\axones\"
```

Enlace desde la agencia: `axones/index.html`
