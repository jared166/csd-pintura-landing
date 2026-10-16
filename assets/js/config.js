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
  legalName: "",          // [PENDIENTE] nombre legal exacto: "CSD Good Services, LLC", "CSD Good Service LLC" o "CSD Good Services LLC"
  phone: "",              // [PENDIENTE] formato (305) 555-0123
  phoneE164: "",          // [PENDIENTE] formato +13055550123, para los links tel:
  email: "",              // [PENDIENTE]
  address: "",            // [PENDIENTE]
  hours_en: "",           // [PENDIENTE] horario real de atención, ej. "Mon–Fri 8 AM–6 PM · Sat 9 AM–3 PM"
  hours_es: "",           // [PENDIENTE]
  openingHoursSchema: [], // opcional, para JSON-LD, formato schema.org: ["Mo-Fr 08:00-18:00", "Sa 09:00-15:00"]

  // Integraciones
  webhookUrl: "",         // [PENDIENTE] Inbound Webhook del workflow de GoHighLevel
  webhookMode: "cors-json", // "cors-json" | "no-cors" (ver README)
  gtmId: "",              // [PENDIENTE] GTM-XXXXXXX

  // Venta cruzada
  crossSellUrl_en: "",    // [PENDIENTE] URL de la landing de limpieza en inglés
  crossSellUrl_es: "",    // [PENDIENTE] URL de la landing de limpieza en español

  // Contenido condicional
  heroImage: "",          // ruta a una foto real, ej. "assets/img/work/hero.webp"
  heroImageAlt_en: "", heroImageAlt_es: "", // texto alternativo de esa foto
  gallery: [],            // [{ src, width, height, alt_en, alt_es, caption_en, caption_es, srcset? }]: solo fotos reales
  beforeAfter: [],        // [{ before, after, alt_en, alt_es }]: solo pares reales
  siteVisit: false,       // [PENDIENTE] true si CSD visita el lugar antes de cotizar
  optionalBlocks: { reviews: false, guarantee: false, licenseInsurance: false },
  googleReviews: [],      // solo reseñas reales copiadas del perfil, con link: [{ text, author, date }]
  googleProfileUrl: "",
  guaranteeText_en: "", guaranteeText_es: "",
  licenseText_en: "",   licenseText_es: "",

  // SEO
  noindex: true
};
