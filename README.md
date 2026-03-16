# TATC — Portfolio (sitio estático)

Sitio web estático (HTML/CSS/JS) para el portfolio de TATC/ISEEASI.

Incluye:
- Theme switch (claro/oscuro) con transición “simple dissolve”.
- CMS ligero basado en [public/content.json](public/content.json) con “draft” opcional desde el panel admin (localStorage).
- Páginas: Home, Projects, Project Page (template), Blog/Post, Info/About, Artist, y experiencias (incluye una experiencia 3D).

## Estructura

- El sitio “publicable” está en la carpeta [public/](public/)
- Contenido editable: [public/content.json](public/content.json)
- Admin (edición local + export JSON): [public/admin/admin.html](public/admin/admin.html)

## Desarrollo local

Servidor estático (recomendado):

`cd public && python3 -m http.server 8000`

Luego abre `http://localhost:8000`.

## Publicación (GitHub Pages)

Este repo incluye despliegue automático con GitHub Actions:
- Workflow: [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)
- `.nojekyll` incluido para que GitHub Pages no ignore archivos con prefijo `_`.

Pasos (una sola vez en GitHub):
1. En el repo: **Settings → Pages**
2. En “Build and deployment”, selecciona **Source: GitHub Actions**

Cada `git push` a `main` publicará el contenido de [public/](public/).

## Seguridad (hardening básico)

- CSP/Permissions-Policy/Referrer-Policy añadidos como meta tags en páginas principales.
- Enlaces `target="_blank"` forzados a `rel="noopener noreferrer"`.
- Renderizado CMS seguro por defecto (usa `textContent` salvo opt-in de HTML).

Nota: al ser un sitio estático, el “admin” no es un backend con auth real; evita publicar datos sensibles en el panel.