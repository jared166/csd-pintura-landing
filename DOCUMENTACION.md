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
| Recursos rotos bajo subruta `/csd-landing-painting/` | Ninguno (salvo el logo, pendiente del cliente) |
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
10. **Logo pendiente.** El `<img>` apunta a `assets/img/logo-csd.svg`. Si el archivo no existe, se oculta visualmente (opacidad 0) y conserva su espacio y su `alt` para lectores de pantalla. No se muestra el nombre escrito con otra fuente, porque el manual lo prohíbe.
11. **Favicon provisorio**: una "C" cian sobre negro, dibujada como trazo SVG (no como letra de una fuente). Reemplazar por el isotipo oficial.
12. **Imagen OG** generada: fondo `#0A0A0A`, H1 por defecto en blanco y línea cian. Sin logo (no está disponible) y sin fotos.
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
- Peso por landing (HTML + CSS + JS, sin fuentes ni imágenes): ver sección 10.

---

## 8. Verificación realizada (sección 12 del brief)

Se automatizó con Playwright (Chromium headless) sirviendo el sitio bajo `/csd-landing-painting/`:

1. **Capturas** EN y ES en 360×800, 768×1024 y 1440×900: revisadas hero, barra móvil, formulario y pie. Sin scroll horizontal.
2. **Subruta**: sin recursos rotos (único 404: `logo-csd.svg`, pendiente).
3. **Formulario**: a) comercial, b) residencial, c) validación, d) honeypot y envío < 3 s, e) falla a los 10 s con mensaje de plan B. Además: envío real `cors-json` contra un webhook simulado con redirección a `es/gracias/`.
4. **Atribución**: GCLID persiste tras cambiar de idioma y enviar sin parámetros; con storage bloqueado no hay errores y el GCLID llega desde memoria.
5. **Titulares**: `office`, `exterior`, `warehouse` en EN y ES; `<script>`, claves desconocidas, mayúsculas y vacías dejan el H1 por defecto.
6. **Configuración vacía**: sin `tel:`, sin `mailto:`, sin `href=""`, sin galería, 4 pasos, sin bloques opcionales, sin scripts de Google y sin "[PENDIENTE]", "undefined" ni "null" en las 8 páginas. Con la configuración completa: GTM carga, aparecen los 4 `tel:` con su `location`, 5 pasos con `siteVisit`, cross-sell, pie completo, JSON-LD `LocalBusiness`, barra móvil que aparece después del hero y se oculta en el formulario, eventos `click_to_call` y `language_switch`.
7. **Copy y palabras prohibidas**: verificado.
8. **Contraste**: todo texto blanco sobre magenta es de 19 px y peso 700; no hay texto violeta.
9. **Rendimiento**: ver sección 10.

---

## 9. Fase 2: capa premium

_Ver sección siguiente, completada tras aplicar el skill de diseño premium._

---

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
- Logo oficial en `assets/img/logo-csd.svg` (o PNG ajustando la ruta).
- Isotipo oficial para el favicon (hoy provisorio).
- Textos legales revisados por abogado en las 4 páginas legales. **No lanzar campañas sin esto.**
- Revisión legal del texto de consentimiento (si piden casilla, se agrega).
- Con el dominio definitivo: `hreflang` y `og:image` absolutos.
