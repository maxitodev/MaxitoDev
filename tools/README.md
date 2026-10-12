# Generador de las imágenes del README

Las imágenes de `assets/` se generan con estos scripts. Todo el texto se convierte a trazos con las fuentes de
`fonts/`, así los SVG se ven igual en GitHub sin depender de fuentes externas.

## Reconstruir

```bash
cd tools
npm ci
npm run build              # genera todo en ../assets
node build.mjs hero        # solo lo que contenga "hero" en el nombre
```

## Qué editar

| Archivo | Contenido |
| --- | --- |
| `config.mjs` | nombre, enlaces, estado, frases que se escriben en el encabezado |
| `scenes/services.mjs` | textos de "Qué hago" |
| `scenes/stack.mjs` | tecnologías de cada carril |
| `scenes/projects.mjs` | tarjetas de proyectos |
| `scenes/terminal.mjs` | bloque de código de "Sobre mí" |
| `lib/theme.mjs` | paleta de colores y fuentes |

## Actividad (la serpiente)

`../.github/workflows/activity.yml` descarga tus contribuciones cada día, regenera `assets/activity.svg` y lo guarda
en el repo. También corre en cada push que toque `tools/` y desde la pestaña **Actions → Actualizar actividad → Run workflow**.

Para probarlo en tu equipo (usa la página pública de tu perfil si no hay token):

```bash
npm run activity
```

## Licencias

- Bricolage Grotesque y JetBrains Mono: SIL Open Font License (`fonts/OFL-*.txt`).
- Iconos de interfaz: [Lucide](https://lucide.dev) (ISC). Logos de tecnologías: [Simple Icons](https://simpleicons.org) (CC0);
  las marcas pertenecen a sus dueños.
