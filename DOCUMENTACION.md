# Documentación del proyecto · Landing de pintura comercial CSD Good Services

**Cliente:** CSD Good Services (pintura y limpieza comercial, Miami, FL)
**Servicio de esta landing:** pintura comercial interior y exterior + murales como adicional
**Canal:** Google Ads, campañas de búsqueda, tráfico mayormente móvil
**Idiomas:** inglés (`/`, por defecto) y español (`/es/`)
**Objetivo único:** que el visitante complete el formulario de cotización o llame
**Destino de los leads:** GoHighLevel (Inbound Webhook) → conversiones offline a Google Ads vía GCLID

---

## 1. Resumen ejecutivo

Se construyó una landing de captación **estática, sin build y lista para GitHub Pages**, con dos idiomas pre-renderizados, un formulario de cotización completo con plan B ante fallas, captura de atribución (GCLID/UTM) persistente por 90 días y medición preparada para Google Ads a través de GTM.

Todo lo que depende del cliente (teléfono, email, nombre legal, webhook, GTM, fotos, textos legales) se controla desde **un solo archivo, `assets/js/config.js`**. Mientras un dato no exista, el elemento se oculta: la página nunca muestra `[PENDIENTE]`, `undefined`, links vacíos ni un `tel:` sin número.

Después, en una segunda fase, se aplicó una capa de diseño premium (ver sección 9) respetando el manual de marca y las reglas del brief.

| Indicador | Resultado |
| --- | --- |
| Pruebas funcionales automatizadas (sección 12 del brief) | 102/102 OK |
| Scroll horizontal entre 360 y 1440 px | Ninguno |
| Recursos rotos bajo subruta `/csd-landing-painting/` | Ninguno |
| Palabras prohibidas en copy visible | Ninguna |
| Scripts de Google sin `gtmId` | Ninguno |

---

## 2. Arquitectura y decisiones técnicas

### 2.1 Stack
- HTML5 + CSS + JavaScript vanilla (ES modules). Sin frameworks, sin bundlers, sin npm en producción.
- Dependencias externas: solo Google Fonts (Inter 400/600/700/800, `display=swap`) y GTM si hay ID.
- Todas las rutas internas son **relativas**: funciona en la raíz de un dominio o bajo una subruta de GitHub Pages.

### 2.2 Páginas
| Ruta | Contenido |
| --- | --- |
| `/index.html` | Landing EN |
| `/thank-you/` | Gracias EN |
| `/privacy/`, `/terms/` | Placeholders legales EN |
| `/es/index.html` | Landing ES |
| `/es/gracias/` | Gracias ES |
| `/es/privacidad/`, `/es/terminos/` | Placeholders legales ES |

Cada idioma es una **página HTML ya renderizada** (no texto inyectado por JS): el titular aparece sin parpadeo, Google lee el contenido y cada idioma tiene su URL final para su campaña.

### 2.3 Módulos JavaScript
| Archivo | Responsabilidad |
| --- | --- |
| `config.js` | Única fuente de configuración editable |
| `util.js` | Helpers compartidos: raíz del sitio, idioma, `tel:` seguro, URLs seguras (agregado al esquema sugerido para no duplicar código entre `main.js` y `form.js`) |
| `tracking.js` | `dataLayer` siempre disponible; GTM solo con ID válido; `track()` y `trackAndWait()` |
| `attribution.js` | Captura y persistencia de GCLID/GBRAID/WBRAID/UTM/`h` |
| `main.js` | Datos de contacto, cambio de idioma, barra móvil, contenido condicional, galería, lightbox, antes/después, bloques opcionales, JSON-LD, animaciones |
| `form.js` | Validación, antispam, payload, envío al webhook, eventos y plan B |

### 2.4 Decisiones tomadas por cuenta propia
1. **Variantes del H1 en el propio HTML.** Los textos de `?h=office|exterior|warehouse` viven como atributos `data-h-*` del `<h1>`, y un script inline de una línea, ubicado justo después del H1, los aplica **antes del primer pintado** (un módulo diferido llegaría tarde y provocaría parpadeo). Solo se elige entre textos definidos: nunca se inserta texto de la URL.
2. **`noindex` estático en el HTML.** Google puede no renderizar JS si el HTML inicial ya trae `noindex`, así que la etiqueta va escrita en las 8 páginas. `config.noindex` la mantiene; para indexar hay que poner `false` y borrar la línea (comando en el README).
3. **GTM inyectado desde `tracking.js`** con el snippet oficial, porque el ID vive en `config.js`. El `<noscript>` de GTM no se incluye: no puede leer `config.js`, y sin JS el formulario no funciona, así que no se pierde ninguna conversión.
4. **Botón "Request a Quote" del header oculto en móvil (< 900 px).** En 360 px no entran logo (mín. 120 px) + idioma + teléfono + un botón primario de 19 px. En móvil la acción la cubren el botón del hero y la barra inferior fija.
5. **Atribución: un clic nuevo reemplaza el registro completo.** Si llega un `gclid`/`gbraid`/`wbraid` distinto, se reemplaza todo el registro (UTM, `landing_page`, `referrer`), para no mezclar los UTM de un clic viejo con un GCLID nuevo. En visitas sin clic nuevo se mantienen los valores existentes y solo se completan los que falten.
6. **Antispam silencioso.** Honeypot lleno o envío antes de 3 s desde la carga (`performance.now()`): no se envía nada, no hay evento ni redirección.
7. **Mensajes de validación** (no estaban en el brief): cortos, en el idioma de la página, con "usted" en español. Ej.: "Please enter a valid 10-digit US phone number." / "Ingrese un teléfono válido de EE. UU. de 10 dígitos."
8. **Etiqueta "Optional" / "Opcional"** junto a los dos campos opcionales (tamaño y mensaje), como ayuda de interfaz; no altera el copy de las etiquetas.
9. **"give us a call" / "llámenos" en la FAQ de viviendas** se convierte en link `tel:` solo si hay teléfono (por eso existe la ubicación `faq` en `click_to_call`). Sin teléfono queda como texto.
10. **Logo** _(resuelto en la fase 3, ver sección 9.6)_. Mientras faltaba, el `<img>` apuntaba a `assets/img/logo-csd.svg`. Si el archivo no existe, se oculta visualmente (opacidad 0) y conserva su espacio y su `alt` para lectores de pantalla. No se muestra el nombre escrito con otra fuente, porque el manual lo prohíbe.
11. **Favicon** _(fase 3)_: recorte del monograma "CSD" del logo oficial sobre `#0A0A0A` (reemplazó a la "C" provisoria).
12. **Imagen OG** generada: fondo `#0A0A0A`, logo oficial, H1 por defecto en blanco y línea cian. Sin fotos.
13. **Campos extra en `config.js`**: `openingHoursSchema` (horario en formato schema.org para JSON-LD: el texto libre de `hours_en` no es válido ahí) y `heroImageAlt_en/_es` (texto alternativo de la foto del hero).
14. **`hreflang` y `og:image` relativos**: el dominio final no está definido. Cuando lo esté, conviene pasarlos a URLs absolutas.
15. **Reseñas:** si algún día se activan, el bloque usa el título "Google reviews" / "Reseñas de Google" y el link "See on Google ↗" / "Ver en Google ↗". Sin estrellas.

---

## 3. Contenido y copy

- El copy de la sección 8 del brief está **literal** en EN y ES. Solo se ajustaron saltos de línea y jerarquía visual: en "How it works", la primera frase de cada paso va en negrita.
- Orden de secciones: Hero → What we paint → Why work with CSD → Spaces we paint → Our work (solo con fotos) → bloques opcionales (apagados) → How it works → FAQ → Formulario (`#quote`) → Pie.
- **Reglas verificadas:** no aparecen free, gratis, cheap, affordable, barato, guarantee, garantía, licensed, insured, on time, best, #1, bodega, presupuesto, tú ni vos. La única coincidencia en el código es la clave de configuración `optionalBlocks.guarantee`, que exige el propio brief y no se ve en pantalla.

---

## 4. Formulario de cotización

### 4.1 Campos y claves enviadas
| name | EN | ES | Tipo | Valores enviados |
| --- | --- | --- | --- | --- |
| `full_name` | Full name | Nombre completo | text | — |
| `company` | Company name | Nombre de la empresa | text | — |
| `phone` | Phone | Teléfono | tel | `(305) 555-0123` + `phone_e164` `+13055550123` |
| `email` | Email | Email | email | — |
| `property_type` | Property type | Tipo de propiedad | select | `office`, `retail`, `warehouse`, `restaurant`, `other_commercial`, `residential` |
| `service` | Service needed | Servicio que necesita | radio | `interior`, `exterior`, `mural`, `not_sure` |
| `location` | City or ZIP code | Ciudad o código postal | text | — |
| `size_sqft` | Approximate size (sq ft) | Tamaño aproximado (pies cuadrados) | number, opcional | número |
| `timeline` | When do you need it? | ¿Para cuándo lo necesita? | radio | `asap`, `within_1_month`, `1_3_months`, `comparing_quotes` |
| `message` | Tell us about the project | Cuéntenos sobre el proyecto | textarea, opcional | — |

Las claves son iguales en ambos idiomas, para que GoHighLevel las trate como el mismo campo.

### 4.2 Payload
Todos los campos + `phone_e164`, `lead_type` (`residential` si la propiedad es vivienda, si no `commercial`), `service_line: "painting"`, `language`, `headline_variant`, `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `h_param`, `landing_page`, `referrer`, `first_seen_at`, `page_url`, `submitted_at` (ISO 8601) y `user_agent`.

### 4.3 Validación y accesibilidad
- Teléfono: 10 dígitos de EE. UU. (acepta un 1 inicial); se muestra como `(305) 555-0123` al salir del campo.
- Errores junto a cada campo, en el idioma de la página, vinculados con `aria-describedby` y `aria-invalid`; el foco va al primer error.
- `autocomplete`: name, organization, tel, email, postal-code.
- Radios como botones grandes (56 px de alto), una columna en móvil y dos en escritorio.

### 4.4 Envío
- `webhookMode: "cors-json"` (por defecto): JSON, éxito con 2xx.
- `webhookMode: "no-cors"`: `text/plain` con el JSON; si no hay error, se toma como enviado.
- Botón deshabilitado y "Sending…" / "Enviando…" mientras envía. Timeout de 10 s.
- Falla → mensaje con teléfono (link `tel:` con `location: form_error`) y email. Si falta alguno, el mensaje se arma solo con lo que existe.
- Éxito → evento → redirección a `thank-you/` o `es/gracias/` conservando el query string.
- Sin `webhookUrl` → modo desarrollo: `console.info` del payload y aviso "Webhook not configured" solo en `localhost` / `127.0.0.1`.

---

## 5. Atribución (GCLID / UTM)

- Lee `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` y `h` (solo si `h` es una clave válida).
- Guarda en `localStorage` con fecha; expira a los 90 días. Si está bloqueado, usa `sessionStorage`, y si tampoco, una variable en memoria. Todo acceso va dentro de try/catch.
- Guarda `landing_page` (primera URL vista) y `referrer`.
- El cambio de idioma conserva el query string y el hash, y además el GCLID persiste en storage: si el usuario entra con `?gclid=…`, cambia a español y envía sin parámetros, el GCLID llega igual.

---

## 6. Medición para Google Ads

| Evento | Cuándo | Parámetros |
| --- | --- | --- |
| `form_start` | Primer foco en el formulario (una vez) | `form_id`, `language` |
| `generate_lead` | Envío OK comercial | `form_id`, `language`, `service_line`, `service`, `property_type`, `timeline`, `headline_variant`, `user_data { email, phone_number }` |
| `lead_residential` | Envío OK residencial | Igual, sin `user_data` |
| `click_to_call` | Clic en `tel:` | `location`, `language` |
| `language_switch` | Clic en idioma | `from`, `to` |

- **Conversión de Google Ads: solo `generate_lead`.** Así el algoritmo no aprende a traer particulares.
- Antes de redirigir se espera a GTM (`eventCallback` + `eventTimeout` de 2000 ms, más un temporizador propio por si GTM está bloqueado por un adblocker).
- La página de gracias no dispara conversión.
- Datos personales solo dentro de `user_data`; nunca en URL ni en consola en producción.

---

## 7. SEO, rendimiento y accesibilidad

- `<title>` y meta descripción literales; Open Graph y Twitter Card con `og-image.jpg` (1200×630).
- `noindex, follow` en las 8 páginas; `robots.txt` sin bloqueos (Google Ads necesita rastrear).
- `hreflang` recíprocos `en-US`, `es-US`, `x-default` → EN. `lang` correcto en cada página.
- JSON-LD `FAQPage` con las 6 preguntas visibles; `LocalBusiness` generado solo con los datos que existan en `config` (sin nombre legal, no se genera).
- Un solo `h1` por página, foco visible cian de 3 px, skip link, áreas táctiles ≥ 44 px, `prefers-reduced-motion` respetado.
- Sin JS que bloquee el render (módulos diferidos); fuentes con `display=swap`.
- Peso por landing (HTML + CSS + JS, sin fuentes ni imágenes): ~106 KB (ver sección 9.5).

---

## 8. Verificación realizada (sección 12 del brief)

Se automatizó con Playwright (Chromium headless) sirviendo el sitio bajo `/csd-landing-painting/`:

1. **Capturas** EN y ES en 360×800, 768×1024 y 1440×900: revisadas hero, barra móvil, formulario y pie. Sin scroll horizontal.
2. **Subruta**: sin recursos rotos.
3. **Formulario**: a) comercial, b) residencial, c) validación, d) honeypot y envío < 3 s, e) falla a los 10 s con mensaje de plan B. Además: envío real `cors-json` contra un webhook simulado con redirección a `es/gracias/`.
4. **Atribución**: GCLID persiste tras cambiar de idioma y enviar sin parámetros; con storage bloqueado no hay errores y el GCLID llega desde memoria.
5. **Titulares**: `office`, `exterior`, `warehouse` en EN y ES; `<script>`, claves desconocidas, mayúsculas y vacías dejan el H1 por defecto.
6. **Configuración vacía**: sin `tel:`, sin `mailto:`, sin `href=""`, sin galería, 4 pasos, sin bloques opcionales, sin scripts de Google y sin "[PENDIENTE]", "undefined" ni "null" en las 8 páginas. Con la configuración completa: GTM carga, aparecen los 4 `tel:` con su `location`, 5 pasos con `siteVisit`, cross-sell, pie completo, JSON-LD `LocalBusiness`, barra móvil que aparece después del hero y se oculta en el formulario, eventos `click_to_call` y `language_switch`.
7. **Copy y palabras prohibidas**: verificado.
8. **Contraste**: todo texto blanco sobre magenta es de 19 px y peso 700; no hay texto violeta.
9. **Rendimiento**: Lighthouse móvil 100 / 100 / 100 / 54 (ver secciones 9.5 y 9.6).

---

## 9. Fase 2: capa premium (skill "adrian-saenz-hostinger-premium-website")

### 9.1 Dirección de diseño
Del catálogo del skill se eligió el arquetipo **05 · Mouse-Reactive Gradient** (fondo casi negro, paleta monocroma con un acento neón, Inter, energía sobria). Es el que mejor calza con el manual de CSD: negro dominante y neones como puntos de luz. Se adaptó a la paleta oficial: cian para acentos, magenta para la acción y violeta solo en brillos.

**Efecto firma:** el **abanico de muestras de pintura** del hero, hecho solo con CSS. Se abre al cargar la página (1,1 s, sin retrasar el titular) sobre un mesh violeta y magenta que deriva lento, con un remache cian en el pivote. Comunica "pintura" sin fotos de stock.

### 9.2 Efectos aplicados (5, uno de firma y cuatro de apoyo)
| Efecto | Dónde | Notas |
| --- | --- | --- |
| Abanico de muestras que se abre + mesh gradient animado + grano | Hero (y mesh en `#quote`) | CSS puro; violeta al 10–20 %, nunca detrás de texto pequeño. En móvil se recorta como una franja baja de 230 px para no empujar el contenido |
| Halo cian que sigue el puntero + borde luminoso | Tarjetas de "What we paint" y "Why work with CSD" | Solo con mouse (`hover: hover` y `pointer: fine`). No es un cursor personalizado: el cursor del sistema no cambia |
| Bento asimétrico | "Why work with CSD" | Grilla 7/5 · 5/7 en escritorio; una columna en móvil |
| Ticker tipográfico | "Spaces we paint" | Repite los mismos 5 espacios del copy en tipografía grande (contorno/sólido). Es un duplicado decorativo `aria-hidden`: los chips siguen siendo la lista accesible |
| Barra de progreso de lectura | Borde inferior del header | CSS scroll-driven puro (`animation-timeline: scroll()`), sin JS. Los navegadores sin soporte no la muestran |

**Micro-detalles:** índice decorativo `01–06` en cada título de sección (contador CSS, sin texto en el HTML), botones con elevación y reflejo, subrayado animado en el cambio de idioma, pulso cian junto a "We'll call you back the same business day", línea de tiempo conectada en "How it works", FAQ con apertura suave (CSS `::details-content`, donde el navegador lo soporta), formulario con borde degradado de marca, línea de luz en el pie y halo en la insignia de gracias.

### 9.3 Robustez adoptada del skill
- **Cache-busting** `?v=20261016` en `styles.css`, `main.js` y `form.js`. **Hay que subir la fecha en cada publicación** (los imports internos entre módulos no llevan versión; GitHub Pages cachea 10 minutos).
- **`.htaccess`** del skill en la raíz: GitHub Pages lo ignora; sirve si algún día el sitio se aloja en Apache/Hostinger.
- **Cada `init` de `main.js` aislado con `safe()`**: si uno falla, el resto de la página sigue funcionando.
- **Reveals con umbral bajo (0,01) y red de seguridad a los 6 s**: ningún contenido queda oculto. Escalonado suave entre hermanos.
- **Contenido crítico en el HTML**: sin JS se lee todo (verificado: H1, 6 FAQ, formulario y ninguna sección oculta).
- **Reduced-motion bien graduado**: se apaga el **movimiento** (desplazamiento de los reveals, abanico, mesh, ticker, pulso, elevación al pasar el mouse), pero se mantienen las transiciones de color y borde. Así se cumple el brief sin dejar la página "muerta" en Windows, que trae esa preferencia activa en muchas instalaciones.
- **Fuentes sin bloquear el render**: Inter se carga con `preload` + `onload` (y `<noscript>` de respaldo). Esto bajó el LCP móvil de 2,6 s a 1,3 s.

### 9.4 Reglas del skill que NO se aplicaron (y por qué)
El brief del cliente tiene prioridad sobre el skill. Estos desvíos son intencionales:

| Regla del skill | Decisión | Motivo |
| --- | --- | --- |
| IIFE en vez de ES modules | Se mantienen **ES modules** | El brief los exige (sección 3) y la estructura de archivos depende de ellos. El sitio se sirve por HTTP (GitHub Pages), no por `file://` |
| GSAP, Lenis, Three.js en `lib/` | **Sin librerías** | El brief prohíbe librerías de animación; todo se hizo con CSS y JS vanilla |
| Fotos de stock de Openverse | **No** | Solo fotos reales de CSD. Sin fotos, la galería no se muestra |
| Parallax, cursor personalizado, split-text en el hero | **No** | Prohibidos por el brief ("nada de parallax ni cursores personalizados ni animaciones que retrasen el hero") |
| Todo en WebP | `og-image.jpg` y `apple-touch-icon.png` se mantienen | Facebook, LinkedIn, WhatsApp e iOS los requieren en JPG/PNG |
| No gatear nada con reduced-motion | Se gatea solo el movimiento | El brief pide respetar `prefers-reduced-motion` |

El verificador del skill (`verify_project.py`) marca esos puntos como errores. Todos corresponden a esta tabla (`hero.webp` aparece solo en una línea comentada).

### 9.5 Resultados después de la capa premium
| Métrica (Lighthouse 12, móvil, servidor con gzip como GitHub Pages) | EN | ES |
| --- | --- | --- |
| Rendimiento | **100** | **100** |
| Accesibilidad | **100** | **100** |
| Buenas prácticas | 96 → **100** con el logo | 96 → **100** con el logo |
| SEO | 54 | 54 |
| LCP | 1,3 s | 1,3 s |
| CLS | 0 | 0 |
| TBT | 0 ms | 0 ms |

- **Buenas prácticas:** el 96 se debía solo al 404 del logo pendiente. Con el logo cargado (fase 3) es 100.
- **SEO 54, intencional:** se debe al `noindex` (una landing de anuncios no debe competir con el sitio principal) y a los `hreflang` relativos (el dominio aún no está definido). No afecta a Google Ads.
- **Peso por landing:** ~106 KB de HTML + CSS + JS sin comprimir (límite: 120 KB) y ~28 KB con gzip.
- **Pruebas funcionales:** 102/102 OK después de la capa premium.
- **Contraste medido en el navegador:** ningún texto blanco sobre magenta por debajo de 19 px/700, ningún texto violeta, ningún texto < 14 px, un solo `h1` por página.

### 9.6 Fase 3: logo oficial
- **Archivo:** el PNG entregado por el cliente (331×152, fondo transparente) se recortó solo en su margen transparente y quedó como `assets/img/logo-csd.png` (266×119). No se redibujó, no se recoloreó y no se le agregaron sombras ni trazos.
- **Dónde aparece:** header y pie de las 8 páginas (con `width`/`height` reales, sin salto de layout), imagen OG (`og-image.jpg`), favicon (`favicon-32.png`, `favicon.png`) e ícono de iOS (`apple-touch-icon.png`). Los íconos usan el monograma "CSD" del mismo archivo, recortado y escalado sobre `#0A0A0A`, porque la línea "GOOD SERVICES LLC" no se lee a 32 px. Se eliminó el `favicon.svg` provisorio.
- **Tamaños:** 120 px de ancho en móvil (el mínimo del manual), 140 px en escritorio y 180 px en el pie. El área de resguardo horizontal (≥ altura de la "D") se respeta con el espacio libre entre el logo y el resto del header.
- **Desvío del brief:** el header pasa de 60 a **72 px en móvil** y de 76 a **84 px en escritorio**. Con 120 px de ancho, el logo mide 54 px de alto; en 60 px quedaba pegado a los bordes. Entre "header de 60 px" y "logo de 120 px mínimo con resguardo" se priorizó la identidad de marca (prioridad 3 del brief, por encima de velocidad y detalle de layout).
- **Caché:** versión de los assets subida a `?v=20261016.2`.
- **Resultado:** cero 404 en las 8 páginas. Lighthouse móvil EN y ES: rendimiento 100 (LCP 1,4 s, CLS 0), accesibilidad 100, buenas prácticas **100**, SEO 54 (intencional). Pruebas funcionales: 102/102.
- **Mejora opcional:** el archivo recibido tiene poca resolución (331 px de ancho). En pantallas retina el pie (180 px → 360 px físicos) lo escala apenas. Si CSD tiene el logo en SVG o en PNG de mayor resolución, conviene reemplazarlo.

## 10. Pendientes (`[PENDIENTE]`)

**En `config.js`**
- `legalName`: nombre legal exacto ("CSD Good Services, LLC", "CSD Good Service LLC" o "CSD Good Services LLC").
- `phone` y `phoneE164`.
- `email`.
- `address`.
- `hours_en` / `hours_es` (y opcionalmente `openingHoursSchema`).
- `webhookUrl` (Inbound Webhook del workflow de GoHighLevel) y confirmar `webhookMode`.
- `gtmId`.
- `crossSellUrl_en` / `crossSellUrl_es`.
- `siteVisit`: confirmar si CSD visita antes de cotizar.
- `gallery`, `heroImage`, `beforeAfter`: fotos reales.

**En el contenido y los activos**
- Textos legales revisados por abogado en las 4 páginas legales. **No lanzar campañas sin esto.**
- Revisión legal del texto de consentimiento (si piden casilla, se agrega).
- Con el dominio definitivo: `hreflang` y `og:image` absolutos.

---

## 11. Cómo mantenerlo

- **Cambiar datos, links, IDs o contenido condicional:** solo `assets/js/config.js`.
- **Cambiar copy:** solo si Jared lo pide, en EN y ES a la vez. Las 2 landings son `index.html` y `es/index.html`. Si cambian los espacios de "Spaces we paint", actualizar también el ticker (`.ticker__track`, que repite la lista dos veces).
- **Cambiar header, pie o formulario:** están repetidos en las 8 páginas; hay que replicar el cambio en todas.
- **Antes de publicar:** subir la fecha de `?v=AAAAMMDD` en los `<link>`/`<script>` de las 8 páginas y correr la verificación de `AGENTS.md`.

## 12. Historial

| Fase | Contenido |
| --- | --- |
| 1 · Construcción | Estructura, copy EN/ES, formulario, atribución, medición, SEO, accesibilidad, README y guías para agentes |
| 2 · Capa premium | Abanico de muestras animado, mesh, grano, bento, halo en tarjetas, ticker, barra de progreso, timeline, cache-busting, `.htaccess`, `safe()`, fuentes sin bloquear el render |
| 3 · Logo oficial | Logo en header, pie e imagen OG; favicon e ícono de iOS desde el monograma; header 72/84 px |
