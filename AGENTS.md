# Guía para agentes · Landing de pintura comercial CSD Good Services

Este archivo es la guía de trabajo para cualquier agente (Claude Code, Gemini CLI u otro) que edite este repositorio. `CLAUDE.md` y `GEMINI.md` tienen el mismo contenido.

## Qué es

Landing estática (HTML/CSS/JS vanilla, sin build ni npm) de **pintura comercial** en Miami para CSD Good Services. Tráfico de Google Ads (búsqueda), mayormente móvil. EN por defecto (`/`), ES en `/es/`. Leads → Inbound Webhook de GoHighLevel. GCLID viaja con cada lead para conversiones offline.

Prioridades, en orden: 1) copy exacto, 2) medición correcta para Google Ads, 3) identidad de marca fiel al manual, 4) velocidad en móvil, 5) código limpio.

## Regla de copy

**El copy se cambia solo si Jared lo pide, en los dos idiomas a la vez.** El texto de las páginas es literal (sección 8 del brief). No reescribir, no resumir, no agregar frases de venta.

## Reglas de contenido que no se rompen

1. El copy se usa literal. Solo se pueden ajustar saltos de línea y jerarquía visual.
2. **Prohibido afirmar** (no hay respaldo):
   - Precios, "desde", "cheap", "affordable", "low price", "barato" ni "mejor precio".
   - Garantías de cualquier tipo.
   - Plazos de entrega, "on time" ni "fast".
   - "Licensed", "insured", "bonded" ni años de experiencia.
   - Cantidad de clientes o proyectos.
   - "#1", "best" ni "top rated".
   - "Free estimate" o "free quote": no está confirmado que la cotización sea gratis.
3. **Sin reseñas, testimonios, estrellas, logos de clientes, contadores, temporizadores ni sellos.** Los bloques opcionales (`config.optionalBlocks`) quedan apagados y solo se encienden con contenido real.
4. **Solo fotos reales de trabajos comerciales de CSD.** Nada de stock, nada residencial, nada generado por IA. Sin fotos, la galería no se muestra.
5. **Español:** neutro, trato de "usted", para el público hispano de Miami. "cotización" (no "presupuesto" ni "estimado"); "almacenes" (no "bodegas").
6. **Inglés:** de EE. UU.
7. **Formatos:** teléfono (305) 555-0123; tamaños en pies cuadrados (sq ft).
8. Nada marcado `[PENDIENTE]` se rellena con datos inventados ni aparece en pantalla: sale de `config.js` o queda oculto.
9. Nada de chat, pop-ups, WhatsApp flotante, banners promocionales, frameworks, Tailwind ni librerías de animación.

## Identidad visual (resumen del manual)

| Token | Valor | Uso |
| --- | --- | --- |
| `--csd-cyan` | `#75FCE4` | Acentos secundarios, hover, íconos, foco |
| `--csd-violet` | `#7C00FF` | **Solo decorativo** (brillos 10–20 %). Nunca texto |
| `--csd-magenta` | `#DF20B0` | Acción principal (CTA) |
| `--csd-bg` | `#0A0A0A` | Fondo dominante |
| `--csd-white` | `#FFFFFF` | Títulos y cuerpo |
| `--csd-gray` | `#A0A0A0` | Texto secundario |
| `--csd-surface` | `#141414` | Tarjetas, secciones alternas (derivado) |
| `--csd-border` | `#262626` | Bordes finos (derivado) |

**Contraste (WCAG 2.x)**

| Combinación | Contraste | Regla |
| --- | --- | --- |
| Blanco sobre `#0A0A0A` | 19,80:1 | Libre |
| `#A0A0A0` sobre `#0A0A0A` | 7,57:1 | Libre para texto secundario |
| Cian sobre `#0A0A0A` | 15,84:1 | Libre como acento de texto |
| Magenta sobre `#0A0A0A` | 4,69:1 | AA; etiquetas cortas |
| `#0A0A0A` sobre magenta | 4,69:1 | AA |
| **Blanco sobre magenta** | **4,22:1** | **No pasa AA en texto normal** → botón primario: blanco, **≥ 19 px, peso 700**, mayúsculas, tracking 1,5 px (único desvío del manual, comentado en el CSS) |
| **Violeta sobre `#0A0A0A`** | **3,11:1** | **Nunca para texto** |

**Tipografía:** Inter 400/600/700/800 (Google Fonts, `display=swap`). H1/H2 ExtraBold 800 blancos. Cuerpo 400, 16–18 px, interlineado 1,5. Etiquetas y botones 600, mayúsculas, tracking 1,5–2 px. H1 34→56 px (lh 1,05), H2 26→40 px, H3 20 px. Nunca texto < 14 px. Nunca Light sobre oscuro.

**Logo:** solo el archivo oficial (`assets/img/logo-csd.png`, 266×119, transparente; en el HTML lleva `width="266" height="119"` y el ancho lo fija el CSS: 120 px en móvil, 140 px en escritorio, 180 px en el pie). Favicon e ícono de iOS = recorte del monograma "CSD" de ese archivo. No recrear, no redibujar, no escribir "CSD" ni "GOOD SERVICES LLC" con otra fuente. Ancho mínimo 120 px. Área de resguardo = altura de la "D" del monograma. Sin sombras, biseles ni trazos. Siempre sobre `#0A0A0A`.

**Sistema:** negro dominante, neones como puntos de luz. Botón primario pill magenta, alto ≥ 52 px, ancho completo en móvil, hover con borde/brillo cian, foco outline cian 3 px. Secundario ghost con borde blanco 1,5 px o texto con "↗". Tarjetas `--csd-surface`, borde `--csd-border`, radio 16 px. Íconos SVG de línea 1,75 px en cian. Animaciones mínimas (fade + 8 px), respetando `prefers-reduced-motion`. Sin parallax ni cursores personalizados.

**Capa premium (fase 2):** abanico de muestras animado en el hero (firma), mesh violeta/magenta al 10–20 %, grano, halo cian en tarjetas solo con mouse (sin cursor personalizado), bento en "Why", ticker decorativo `aria-hidden` en "Spaces we paint", barra de progreso CSS scroll-driven. Con `prefers-reduced-motion` se apaga el movimiento; se mantienen las transiciones de color y borde. No agregar parallax, cursores personalizados, GSAP, Lenis ni fotos de stock aunque un skill de diseño lo sugiera: manda el brief.

## Medición (dataLayer)

| Evento | Cuándo | Parámetros |
| --- | --- | --- |
| `form_start` | Primer foco en el formulario (una vez) | `form_id: "painting_quote"`, `language` |
| `generate_lead` | Envío OK, `lead_type = "commercial"` | `form_id`, `language`, `service_line: "painting"`, `service`, `property_type`, `timeline`, `headline_variant`, `user_data: { email, phone_number }` |
| `lead_residential` | Envío OK, `lead_type = "residential"` | Igual, sin `user_data` |
| `click_to_call` | Clic en `tel:` | `location` (`header`, `sticky_bar`, `faq`, `footer`, `thank_you`, `form_error`), `language` |
| `language_switch` | Clic en el botón de idioma | `from`, `to` |

La conversión de Google Ads se configura **solo** sobre `generate_lead`. La página de gracias no dispara conversión. Email/teléfono solo dentro de `user_data`.

## Dónde está cada cosa

- `assets/js/config.js`: **toda** la configuración editable. Ya tiene los datos reales de la empresa (de los textos legales del cliente): nombre legal, dirección, teléfono principal (botones de llamada) y secundario (solo pie, `data-tel="secondary"`), email y `siteVisit: true`. Solo faltan `webhookUrl` y `gtmId`.
- Textos legales (`privacy/`, `terms/`, `es/privacidad/`, `es/terminos/`) y consentimiento del formulario: texto aprobado por el cliente; no editar sin su aprobación. Los SMS son solo notificaciones de la solicitud, nunca marketing.
- `index.html` / `es/index.html`: copy literal pre-renderizado (sin parpadeo, SEO). Las variantes del H1 están en atributos `data-h-*` del propio `<h1>`.
- `assets/js/main.js`: datos de contacto, idioma, barra móvil, galería, bloques opcionales, JSON-LD, animaciones.
- `assets/js/form.js`: formulario. `assets/js/attribution.js`: GCLID/UTM. `assets/js/tracking.js`: GTM.
- Si cambias header, footer o formulario, **cámbialo en las 8 páginas** (o en las 2 landings) y en los dos idiomas.
- Si cambian los espacios de "Spaces we paint", actualiza también el ticker (`.ticker__track`, lista repetida dos veces).
- Cada `init` de `main.js` va dentro de `safe()`; mantén ese patrón al agregar uno nuevo.
- En cada publicación, sube `?v=AAAAMMDD` en los `<link>`/`<script>` locales de las 8 páginas.

## Verificación antes de cada commit

1. **Capturas** EN y ES en 360×800, 768×1024 y 1440×900 (Playwright). Revisar hero, barra inferior móvil, formulario y pie.
2. **Subruta:** servir bajo `/csd-landing-painting/` y confirmar que no hay recursos rotos (no debe haber ningún 404).
3. **Formulario** con `webhookUrl` vacío y `?gclid=TEST123&utm_source=google&utm_campaign=painting&h=office`:
   a) comercial → payload completo, `phone_e164`, `lead_type: "commercial"`, `headline_variant: "office"`, gclid y UTM; `generate_lead` con `user_data`; redirige a `thank-you/` con el query string.
   b) residencial → `lead_type: "residential"`, `lead_residential`, sin `generate_lead`.
   c) validación → teléfono de 9 dígitos y email inválido muestran error junto al campo; foco al primero.
   d) antispam → con el campo trampa lleno no se envía nada.
   e) falla → con un webhook que no responde, a los 10 s aparece el mensaje con teléfono y email.
4. **Atribución:** entrar con `?gclid=TEST123`, ir a `/es/` y enviar sin parámetros → el gclid sigue en el payload. Con storage bloqueado, sin errores.
5. **Titulares:** `?h=office|retail|warehouse|restaurant|residential` cambian el H1 en EN y ES y llegan al payload como `headline_variant` y `h_param`; `?h=exterior` (retirada), `?h=<script>` o claves desconocidas dejan el H1 por defecto. Para agregar una variante, toca a la vez el `data-h-*` de los dos HTML, la lista del script inline y `HEADLINE_KEYS` de `attribution.js`.
6. **Configuración vacía** (probar con una copia de `config.js` con los campos de contacto vacíos y `siteVisit: false`, porque el `config.js` real ya tiene datos): sin teléfono no hay `tel:`; sin galería no hay sección; sin GTM no hay scripts de Google; `siteVisit: false` → 4 pasos; nunca "[PENDIENTE]", "undefined" ni "null" en pantalla.
7. **Copy y reglas:** comparar con el brief palabra por palabra. Buscar y confirmar que no aparecen: free, gratis, cheap, affordable, barato, guarantee, garantía, licensed, insured, on time, best, #1, bodega, presupuesto, tú, vos. Excepciones: las claves de config `optionalBlocks.guarantee` y los **textos legales oficiales** (`privacy/`, `terms/`, `es/privacidad/`, `es/terminos/`), que se publican literal tal como los entregó el cliente ("garantías" en la cláusula de exención; "presupuesto(s)" pendiente de decisión, ver `DOCUMENTACION.md` §9.7). Los textos legales no se editan sin aprobación del cliente.
8. **Contraste:** nada de blanco sobre magenta < 19 px negrita; nada de texto violeta.
9. **Rendimiento:** Lighthouse móvil ≥ 90 en rendimiento, accesibilidad y buenas prácticas (SEO baja por el `noindex`, es intencional). Peso HTML+CSS+JS < 120 KB por página.
