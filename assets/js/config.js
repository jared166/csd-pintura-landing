/**
 * CSD Good Services · Commercial painting landing
 * -----------------------------------------------
 * The ONLY file you need to edit to change contact data, links, IDs or
 * conditional content. Every empty value hides its element on the page:
 * nothing shows "[PENDIENTE]", "undefined" or an empty tel: link.
 *
 * Image paths are relative to the site root (e.g. "assets/img/work/lobby.webp"),
 * so they work on GitHub Pages under a sub-path too.
 */
export const CONFIG = {
  // Contacto y datos legales (obligatorios antes de lanzar)
  // Fuente: textos legales oficiales entregados por el cliente (17-10-2026)
  legalName: "CSD Good Services LLC",
  phone: "(786) 295-7057",          // principal: botones de llamada (header, barra móvil, FAQ, gracias, error del formulario) y pie
  phoneE164: "+17862957057",        // para los links tel:
  phoneSecondary: "(863) 488-6716", // secundario: solo en el pie
  phoneSecondaryE164: "+18634886716",
  email: "admin@csdgoodservices.com",
  address: "8215 NW 64th Street, Medley, FL 33166",
  hours_en: "",           // opcional: horario de atención, ej. "Mon–Fri 8 AM–6 PM · Sat 9 AM–3 PM" (vacío = no se muestra)
  hours_es: "",           // opcional
  openingHoursSchema: [], // opcional, para JSON-LD, formato schema.org: ["Mo-Fr 08:00-18:00", "Sa 09:00-15:00"]

  // Integraciones
  webhookUrl: "",         // [PENDIENTE] Inbound Webhook del workflow de GoHighLevel
  webhookMode: "cors-json", // "cors-json" | "no-cors" (ver README)
  gtmId: "",              // [PENDIENTE] GTM-XXXXXXX

  // Venta cruzada
  crossSellUrl_en: "",    // opcional: URL de la landing de limpieza en inglés (vacío = el link no se muestra)
  crossSellUrl_es: "",    // opcional: URL de la landing de limpieza en español

  // Contenido condicional
  heroImage: "",          // ruta a una foto real, ej. "assets/img/work/hero.webp"
  heroImageAlt_en: "", heroImageAlt_es: "", // texto alternativo de esa foto
  gallery: [],            // [{ src, width, height, alt_en, alt_es, caption_en, caption_es, srcset? }]: solo fotos reales
  beforeAfter: [],        // [{ before, after, alt_en, alt_es }]: solo pares reales
  siteVisit: true,        // los Términos (§2) establecen que toda cotización está sujeta a una inspección en el sitio
  optionalBlocks: { reviews: false, guarantee: false, licenseInsurance: false },
  googleReviews: [],      // solo reseñas reales copiadas del perfil, con link: [{ text, author, date }]
  googleProfileUrl: "",
  guaranteeText_en: "", guaranteeText_es: "",
  licenseText_en: "",   licenseText_es: "",

  // SEO
  noindex: true
};
