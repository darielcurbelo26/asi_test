# ASI TEST Copilot Vainilla

Este es el sitio web de TATC Portfolio.

## Cómo subir a GitHub

1. **Crear un repositorio en GitHub:**
   - Ve a [GitHub.com](https://github.com) y crea una nueva cuenta si no tienes una.
   - Haz clic en "New repository".
   - Nómbralo algo como "tatc-portfolio".
   - Elige público o privado según prefieras.
   - No inicialices con README, .gitignore o license, ya que ya tienes archivos.

2. **Inicializar Git en tu proyecto local:**
   - Abre una terminal en la carpeta del proyecto: `/Users/darielcurbelo/Desktop/ASI TEST Copilot Vainilla`
   - Ejecuta: `git init`

3. **Agregar archivos al repositorio:**
   - `git add .`
   - `git commit -m "Initial commit"`

4. **Conectar con GitHub:**
   - Copia la URL de tu repositorio (ej: https://github.com/tuusuario/tatc-portfolio.git)
   - Ejecuta: `git remote add origin https://github.com/tuusuario/tatc-portfolio.git`
   - `git push -u origin main`

5. **Trabajar desde GitHub:**
   - Para futuras actualizaciones, haz cambios locales, luego `git add .`, `git commit -m "mensaje"`, `git push`.
   - Si trabajas desde VS Code con GitHub, puedes usar la extensión Git para commits y pushes.

## Estructura del proyecto

- `index.html`: Página principal
- `style.css`: Estilos globales
- `script.js`: Lógica JavaScript
- `design-system.js`: Sistema de diseño y tema
- `content.json`: Contenido CMS
- `assets/`: Imágenes y recursos
- `projects/`: Páginas de proyectos individuales

## Notas

- El sitio usa un sistema de temas (claro/oscuro) guardado en localStorage.
- Páginas privadas requieren contraseña, definida en `content.json`.
- Interacciones optimizadas para mobile.