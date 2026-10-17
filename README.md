# CSD Good Services · Landing de pintura comercial (Miami)

Landing de captación para el servicio de **pintura comercial** de CSD Good Services. Recibe tráfico de **Google Ads (búsqueda)**, sobre todo desde el celular. Está en **inglés por defecto** (`/`) y tiene una versión en **español** (`/es/`).

- Sitio **estático, sin build**: HTML5, CSS y JavaScript vanilla (ES modules).
- Se publica tal cual en **GitHub Pages**, también bajo una subruta (`usuario.github.io/csd-landing-painting/`). Todas las rutas internas son relativas.
- **Todo lo editable vive en `assets/js/config.js`.** No hace falta tocar el HTML para cambiar un teléfono, un link o un ID.
- Sin dependencias externas salvo Google Fonts (Inter) y, si hay ID configurado, Google Tag Manager.

## Estructura

```
/
├── index.html                  Landing EN
├── thank-you/index.html        Gracias EN
├── privacy/index.html          Privacy Policy EN (texto oficial del cliente)
├── terms/index.html            Terms of Service EN (texto oficial del cliente)
├── es/
│   ├── index.html              Landing ES
│   ├── gracias/index.html      Gracias ES
│   ├── privacidad/index.html   Política de privacidad ES (texto oficial del cliente)
│   └── terminos/index.html     Términos del servicio ES (texto oficial del cliente)
├── assets/
│   ├── css/styles.css
│   ├── js/config.js            ← ÚNICO archivo de configuración
│   ├── js/util.js              helpers compartidos (rutas, idioma, tel:)
│   ├── js/main.js              idioma, datos de contacto, barra móvil, galería, bloques opcionales, animaciones
│   ├── js/attribution.js       captura de GCLID/GBRAID/WBRAID/UTM y persistencia (90 días)
│   ├── js/form.js              validación, antispam, envío al webhook, plan B
│   ├── js/tracking.js          GTM + dataLayer (solo si hay ID)
│   └── img/
│       ├── logo-csd.png        logo oficial del cliente (266×119, fondo transparente; no recrear)
│       ├── work/               fotos reales de trabajos
│       ├── favicon.png / favicon-32.png  monograma "CSD" del logo oficial sobre #0A0A0A
│       ├── apple-touch-icon.png          ídem, 180×180
│       └── og-image.jpg        1200×630 (logo oficial + H1 por defecto)
├── robots.txt
├── _config.yml                 excluye la documentación interna de GitHub Pages
├── .htaccess                   solo para Apache/Hostinger (GitHub Pages lo ignora)
├── DOCUMENTACION.md            documentación completa del trabajo
├── AGENTS.md / CLAUDE.md / GEMINI.md   guía para agentes
└── README.md
```

## Correr en local

```bash
# opción 1
npx serve .
# opción 2
python3 -m http.server 8080
```

Abre `http://localhost:8080/` (EN) y `http://localhost:8080/es/` (ES).
Para probar como en GitHub Pages bajo subruta, sirve la carpeta padre y entra por `/csd-landing-painting/`.

> En `localhost` y `127.0.0.1`, si `webhookUrl` está vacío, el formulario muestra el aviso discreto **"Webhook not configured"** y escribe el payload en la consola (`console.info`). No envía nada.

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. La URL queda como `https://usuario.github.io/csd-landing-painting/` (EN) y `.../es/` (ES).

**Dominio propio** (por ejemplo `paint.csdgoodservices.com`):
1. Crea un registro DNS `CNAME` que apunte a `usuario.github.io`.
2. En **Settings → Pages → Custom domain**, escribe el dominio (GitHub crea el archivo `CNAME`).
3. Activa **Enforce HTTPS**.
4. Los `hreflang`, `og:image`, `og:url` y `twitter:image` usan URLs absolutas con la base `https://jared166.github.io/csd-pintura-landing/`. Con un dominio propio, reemplaza esa base en las 8 páginas:

   ```bash
   grep -rl 'https://jared166.github.io/csd-pintura-landing/' --include=index.html . | xargs sed -i 's#https://jared166.github.io/csd-pintura-landing/#https://TU-DOMINIO/#g'
   ```

`_config.yml` evita que GitHub Pages publique la documentación interna (`*.md`) como páginas web.

## Publicar una nueva versión (caché)

Los `<link>` y `<script>` locales llevan `?v=AAAAMMDD` (hoy `?v=20261017`). **En cada publicación, súbela** en las 8 páginas para que nadie vea CSS/JS viejo:

```bash
grep -rl 'v=20261017' --include=index.html . | xargs sed -i 's/v=20261017/v=20261120/g'   # usa la fecha de hoy
```

## Qué se edita en `config.js`

| Campo | Para qué sirve | Si está vacío |
| --- | --- | --- |
| `legalName` | Nombre legal en el pie y en JSON-LD | Se ocultan esa línea y el ©; no se genera `LocalBusiness` |
| `phoneSecondary` / `phoneSecondaryE164` | Segundo teléfono, solo en el pie (`<a data-tel="secondary">`) | No se muestra |
| `phone` / `phoneE164` | Teléfono visible `(305) 555-0123` y link `tel:+13055550123` | No aparece ningún `tel:` (ni en el header, ni en la barra móvil, ni en el pie) |
| `email` | Pie y mensaje de error del formulario | Se oculta |
| `address` | Pie y JSON-LD | Se oculta |
| `hours_en` / `hours_es` | "Hours:" / "Horario:" en el pie | Se oculta la línea |
| `openingHoursSchema` | Horario en formato schema.org para JSON-LD (`["Mo-Fr 08:00-18:00"]`) | Se omite |
| `webhookUrl` | Inbound Webhook del workflow de GoHighLevel | Modo desarrollo: no envía, `console.info` del payload |
| `webhookMode` | `"cors-json"` (por defecto) o `"no-cors"` | — |
| `gtmId` | `GTM-XXXXXXX` | No se carga ningún script de Google |
| `crossSellUrl_en` / `_es` | Link a la landing de limpieza | Se ocultan el link "See commercial cleaning ↗" y el bloque cruzado de la página de gracias |
| `heroImage` + `heroImageAlt_en/_es` | Foto real del hero | Composición abstracta en CSS |
| `gallery` | `[{ src, width, height, alt_en, alt_es, caption_en, caption_es, srcset? }]` | No se muestra la sección "Our work" |
| `beforeAfter` | `[{ before, after, alt_en, alt_es }]` (pares reales) | No se muestra el slider |
| `siteVisit` | `true` si CSD visita antes de cotizar (hoy `true`, por los Términos §2) | "How it works" queda en 4 pasos |
| `optionalBlocks` | `{ reviews, guarantee, licenseInsurance }` | Apagados por defecto |
| `googleReviews` + `googleProfileUrl` | Reseñas reales copiadas del perfil | El bloque no se muestra |
| `guaranteeText_*`, `licenseText_*` | Texto aprobado por CSD | El bloque no se muestra |
| `noindex` | `true` por defecto | Ver "noindex" abajo |

**Rutas de imágenes:** relativas a la raíz del sitio (`"assets/img/work/lobby.webp"`). Funcionan igual bajo subruta.

**Foto del hero:** cuando cargues `heroImage`, descomenta en `index.html` y `es/index.html` la línea `<link rel="preload" as="image" ...>` y ajusta la ruta para mejorar el LCP.

**noindex:** cada página trae `<meta name="robots" content="noindex, follow">` escrito en el HTML (Google puede no ejecutar JS si ve `noindex` en el HTML inicial). Para indexar: pon `noindex: false` **y** borra esa línea en las 8 páginas:

```bash
grep -rl 'name="robots"' --include=index.html . | xargs sed -i '/name="robots"/d; /noindex: ad landing page/d'
```

## Webhook de GoHighLevel y CORS

El formulario hace `POST` al Inbound Webhook con un JSON que incluye todos los campos, `phone_e164`, `lead_type`, `service_line: "painting"`, `language`, `headline_variant`, la atribución (`gclid`, `gbraid`, `wbraid`, `utm_*`, `h_param`, `landing_page`, `referrer`, `first_seen_at`), `page_url`, `submitted_at` y `user_agent`.

Los valores de las opciones son **claves en inglés iguales en los dos idiomas** (`office`, `retail`, `warehouse`, `restaurant`, `other_commercial`, `residential`; `interior`, `exterior`, `mural`, `not_sure`; `asap`, `within_1_month`, `1_3_months`, `comparing_quotes`).

**Cómo probarlo de punta a punta**
1. Pega la URL del webhook en `config.webhookUrl` (modo `"cors-json"`).
2. Abre la landing, completa el formulario (espera al menos 3 s desde que carga la página: el antispam descarta envíos más rápidos) y envíalo.
3. En GoHighLevel, revisa el workflow: el contacto debe llegar con todos los campos y con el `gclid` si entraste con `?gclid=TEST123`.

**Cómo detectar el bloqueo de CORS**
- Abre DevTools → **Console**. Si ves algo como
  `Access to fetch at 'https://services.leadconnectorhq.com/hooks/...' from origin '...' has been blocked by CORS policy`,
  el webhook no devuelve la cabecera `Access-Control-Allow-Origin` (o no acepta el preflight `OPTIONS` que dispara `Content-Type: application/json`).
- En **Network**, la petición `OPTIONS` falla o el `POST` aparece como `(failed) CORS error`.
- La página muestra el mensaje de plan B con el teléfono y el email.

**Cuándo cambiar a `"no-cors"`**: si el webhook bloquea CORS, cambia `webhookMode` a `"no-cors"`. El cuerpo viaja como `text/plain` con el JSON (no hay preflight). La respuesta es opaca: si la petición no lanza error, se toma como enviada. **Verifica en GoHighLevel que el JSON se interpreta bien** (que los campos lleguen mapeados). Si no, la alternativa es un pequeño proxy (Cloudflare Worker, Make, Zapier) que reciba JSON con CORS y lo reenvíe.

**Timeout y plan B**: si en 10 s no hay respuesta, o la respuesta no es 2xx (en `cors-json`), se muestra:
- EN: "We couldn't send your request. Please call us at [phone] or email [email]."
- ES: "No pudimos enviar su solicitud. Llámenos al [phone] o escríbanos a [email]."

El lead nunca se pierde en silencio.

## Medición (dataLayer / GTM)

GTM se carga solo si `gtmId` tiene valor. `window.dataLayer` existe siempre. **La configuración de etiquetas (conversión de Google Ads, GA4, Consent Mode, conversiones mejoradas) se hace en GTM, no en este repositorio.**

| Evento | Cuándo | Parámetros |
| --- | --- | --- |
| `form_start` | Primer foco en un campo (una vez por página) | `form_id: "painting_quote"`, `language` |
| `generate_lead` | Envío correcto con `lead_type = "commercial"` | `form_id`, `language`, `service_line`, `service`, `property_type`, `timeline`, `headline_variant`, `user_data: { email, phone_number }` (E.164) |
| `lead_residential` | Envío correcto con `lead_type = "residential"` | Lo mismo, **sin** `user_data` |
| `click_to_call` | Clic en cualquier `tel:` | `location` (`header`, `sticky_bar`, `faq`, `footer`, `thank_you`, `form_error`), `language` |
| `language_switch` | Clic en el botón de idioma | `from`, `to` |

- **La conversión de Google Ads se configura solo sobre `generate_lead`.** `lead_residential` es aparte para que Google no aprenda a traer particulares.
- Antes de redirigir a la página de gracias se espera la confirmación de GTM (`eventCallback`, `eventTimeout` 2000 ms, más un temporizador propio por si GTM está bloqueado).
- La página de gracias **no** dispara la conversión (solo `page_view` a través de GTM).
- Email y teléfono solo viajan en `user_data` dentro del `dataLayer`. Nunca en URLs, query strings ni en `console.log` en producción.
- El `<noscript>` de GTM no está en el HTML: el ID vive en `config.js` y un `<noscript>` no puede leerlo. Sin JS el formulario no funciona, así que no se pierde ninguna conversión.

**En GTM (sugerido):** activador "Evento personalizado = generate_lead" → etiqueta de conversión de Google Ads con conversiones mejoradas usando la variable de capa de datos `user_data`. Variable de capa de datos para `gclid` no hace falta: el `gclid` viaja al CRM en el payload y vuelve como conversión offline.

## Titular según grupo de anuncios

Agrega `?h=` a la URL final de cada grupo de anuncios (las campañas pagas son en inglés):

| `?h=` | H1 (EN) |
| --- | --- |
| `office` | Professional Office Painting in Miami, Done by Our Own Crew |
| `retail` | Professional Retail Store Painting in Miami, Done by Our Own Crew |
| `warehouse` | Professional Warehouse Painting in Miami, Done by Our Own Crew |
| `restaurant` | Professional Restaurant Painting in Miami, Done by Our Own Crew |
| `residential` | Residential Painting in Miami? Talk Directly to Our Own Crew |

`es/index.html` tiene las mismas claves traducidas, por si el usuario cambia de idioma. El H1 cambia a la variante definida en el HTML (nunca se inserta texto de la URL). Cualquier otra clave, incluida la retirada `exterior`, deja el H1 por defecto. La clave viaja como `headline_variant` y `h_param`.

**Para agregar o cambiar una variante**, toca los tres lugares a la vez:
1. El atributo `data-h-<clave>` del `<h1>` en `index.html` y `es/index.html`.
2. La lista del script inline, en esos dos archivos.
3. `HEADLINE_KEYS` en `assets/js/attribution.js`.

## Checklist de lanzamiento (bloqueantes)

- [x] Datos legales y de contacto en `config.js`: CSD Good Services LLC, 8215 NW 64th Street, Medley, FL 33166, (786) 295-7057 (principal), (863) 488-6716, admin@csdgoodservices.com.
- [x] Textos legales oficiales en `privacy/`, `terms/`, `es/privacidad/`, `es/terminos/` (17-10-2026).
- [x] Consentimiento del formulario alineado con la cláusula de SMS (solo notificaciones, nunca marketing).
- [x] Logo oficial, favicon e ícono de iOS.
- [x] `siteVisit` confirmado (`true`).
- [x] `noindex` revisado (queda activo, lo correcto para una landing de anuncios).
- [x] `hreflang` y `og:image` absolutos.
- [ ] **`webhookUrl`** cargado y probado de punta a punta en GoHighLevel (modo `cors-json` o `no-cors`), con `gclid` llegando al contacto.
- [ ] **`gtmId`** cargado y conversión de Google Ads configurada en GTM sobre `generate_lead` (con conversiones mejoradas usando `user_data`).
- [ ] Workflow de GoHighLevel que envíe el email de confirmación que promete la página de gracias.
- [ ] Anuncios con las URL finales `?h=` vigentes (nada con `?h=exterior`).

Opcionales: horario (`hours_*`), URLs de la landing de limpieza (`crossSellUrl_*`), fotos reales (`gallery`, `heroImage`, `beforeAfter`), logo en mayor resolución.
