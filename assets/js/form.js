/**
 * Quote form (#quote): validation, anti-spam, payload, delivery to the
 * GoHighLevel Inbound Webhook, dataLayer events and plan B on failure.
 *
 * Delivery modes (CONFIG.webhookMode, see README):
 *   "cors-json" → fetch JSON; success = 2xx response.
 *   "no-cors"   → fetch text/plain body; success = request didn't throw (opaque response).
 * Empty CONFIG.webhookUrl = development mode: nothing is sent, payload goes to console.info.
 */
import { CONFIG } from "./config.js";
import { getAttribution } from "./attribution.js";
import { track, trackAndWait } from "./tracking.js";
import { LANG, SITE_ROOT, IS_LOCAL, has, telHref, configEmail } from "./util.js";

const FORM_ID = "painting_quote";
const TIMEOUT_MS = 10000;
const MIN_FILL_MS = 3000;

const MSG = {
  en: {
    full_name: "Please enter your full name.",
    company: "Please enter your company name.",
    phone: "Please enter a valid 10-digit US phone number.",
    email: "Please enter a valid email address.",
    property_type: "Please select a property type.",
    service: "Please select a service.",
    location: "Please enter a city or ZIP code.",
    size_sqft: "Please enter a valid number.",
    timeline: "Please select an option.",
    sending: "Sending…",
    failStart: "We couldn't send your request.",
    failCallEmail: (phone, email) => ["Please call us at ", phone, " or email ", email, "."],
    failCall: (phone) => ["Please call us at ", phone, "."],
    failEmail: (email) => ["Please email ", email, "."],
    failNone: "Please try again.",
  },
  es: {
    full_name: "Ingrese su nombre completo.",
    company: "Ingrese el nombre de su empresa.",
    phone: "Ingrese un teléfono válido de EE. UU. de 10 dígitos.",
    email: "Ingrese un email válido.",
    property_type: "Seleccione el tipo de propiedad.",
    service: "Seleccione un servicio.",
    location: "Ingrese su ciudad o código postal.",
    size_sqft: "Ingrese un número válido.",
    timeline: "Seleccione una opción.",
    sending: "Enviando…",
    failStart: "No pudimos enviar su solicitud.",
    failCallEmail: (phone, email) => ["Llámenos al ", phone, " o escríbanos a ", email, "."],
    failCall: (phone) => ["Llámenos al ", phone, "."],
    failEmail: (email) => ["Escríbanos a ", email, "."],
    failNone: "Vuelva a intentarlo.",
  },
}[LANG];

/* Phone helpers: 10-digit US (NANP) numbers */
function phoneDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits;
}
const isValidPhone = (value) => /^[2-9]\d{2}[2-9]\d{6}$/.test(phoneDigits(value));
const formatPhone = (digits) => `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());

function init() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.textContent;
  const status = form.querySelector("[data-form-status]");
  const el = (name) => form.elements.namedItem(name);

  // Development notice (localhost only, when no webhook is configured)
  if (!has(CONFIG.webhookUrl) && IS_LOCAL) {
    const notice = form.querySelector("[data-dev-notice]");
    if (notice) notice.hidden = false;
  }

  // form_start: first focus on any field, once per page
  let started = false;
  form.addEventListener("focusin", (event) => {
    if (started || !event.target.name || event.target.name === "website") return;
    started = true;
    track("form_start", { form_id: FORM_ID, language: LANG });
  });

  // Phone: show it as (305) 555-0123 once valid
  el("phone").addEventListener("blur", (event) => {
    if (isValidPhone(event.target.value)) event.target.value = formatPhone(phoneDigits(event.target.value));
  });

  // Clear a field's error as soon as the user fixes it
  form.addEventListener("input", (event) => clearError(event.target.name));
  form.addEventListener("change", (event) => clearError(event.target.name));

  function fieldBox(name) {
    return form.querySelector(`[data-field="${name}"]`);
  }
  function setError(name, message) {
    const box = fieldBox(name);
    if (!box) return;
    box.classList.add("is-invalid");
    const error = box.querySelector(".field__error");
    if (error) error.textContent = message;
    box.querySelectorAll("input, select, textarea").forEach((input) => input.setAttribute("aria-invalid", "true"));
  }
  function clearError(name) {
    const box = name && fieldBox(name);
    if (!box || !box.classList.contains("is-invalid")) return;
    box.classList.remove("is-invalid");
    const error = box.querySelector(".field__error");
    if (error) error.textContent = "";
    box.querySelectorAll("[aria-invalid]").forEach((input) => input.removeAttribute("aria-invalid"));
  }

  function validate() {
    const values = Object.fromEntries(new FormData(form).entries());
    const errors = [];
    const required = ["full_name", "company", "phone", "email", "property_type", "service", "location", "timeline"];
    for (const name of required) if (!String(values[name] || "").trim()) errors.push(name);
    if (values.phone && !isValidPhone(values.phone)) errors.push("phone");
    if (values.email && !isValidEmail(values.email)) errors.push("email");
    if (values.size_sqft && !(Number(values.size_sqft) > 0)) errors.push("size_sqft");

    const unique = [...new Set(errors)];
    ["full_name", "company", "phone", "email", "property_type", "service", "location", "size_sqft", "timeline"].forEach(clearError);
    unique.forEach((name) => setError(name, MSG[name]));
    return { values, errors: unique };
  }

  function focusFirstError() {
    const box = form.querySelector(".is-invalid");
    const target = box && (box.querySelector("input:checked") || box.querySelector("input, select, textarea"));
    if (target) target.focus();
  }

  function buildPayload(values) {
    const digits = phoneDigits(values.phone);
    const propertyType = values.property_type;
    const headline = document.getElementById("hero-title");
    return {
      full_name: values.full_name.trim(),
      company: values.company.trim(),
      phone: formatPhone(digits),
      phone_e164: `+1${digits}`,
      email: values.email.trim(),
      property_type: propertyType,
      service: values.service,
      location: values.location.trim(),
      size_sqft: values.size_sqft ? Number(values.size_sqft) : "",
      timeline: values.timeline,
      message: (values.message || "").trim(),
      lead_type: propertyType === "residential" ? "residential" : "commercial",
      service_line: "painting",
      language: LANG,
      headline_variant: (headline && headline.dataset.variant) || "default",
      ...getAttribution(),
      page_url: location.href,
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
    };
  }

  async function deliver(payload) {
    if (!has(CONFIG.webhookUrl)) {
      // Development mode: nothing leaves the browser.
      console.info("[CSD] Webhook not configured. Payload (not sent):", payload);
      return true;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      if (CONFIG.webhookMode === "no-cors") {
        await fetch(CONFIG.webhookUrl.trim(), {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        return true; // opaque response: no error = sent
      }
      const response = await fetch(CONFIG.webhookUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: "omit",
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  function showFailure() {
    const tel = telHref();
    const email = configEmail();
    const phoneLink = () => {
      const a = document.createElement("a");
      a.href = tel;
      a.dataset.callLocation = "form_error";
      a.textContent = CONFIG.phone.trim();
      return a;
    };
    const emailLink = () => {
      const a = document.createElement("a");
      a.href = `mailto:${email}`;
      a.textContent = email;
      return a;
    };
    let parts;
    if (tel && email) parts = MSG.failCallEmail(phoneLink(), emailLink());
    else if (tel) parts = MSG.failCall(phoneLink());
    else if (email) parts = MSG.failEmail(emailLink());
    else parts = [MSG.failNone];
    status.replaceChildren(`${MSG.failStart} `, ...parts);
    status.hidden = false;
    status.focus();
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.setAttribute("aria-busy", String(busy));
    submit.textContent = busy ? MSG.sending : submitLabel;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    // Anti-spam: honeypot filled or sent too fast → silently discard.
    if (String(el("website").value || "").trim() !== "") return;
    if (performance.now() < MIN_FILL_MS) return;

    status.hidden = true;
    const { values, errors } = validate();
    if (errors.length) return focusFirstError();

    const payload = buildPayload(values);
    setBusy(true);
    const ok = await deliver(payload);
    if (!ok) {
      setBusy(false);
      return showFailure();
    }

    const params = {
      form_id: FORM_ID,
      language: LANG,
      service_line: "painting",
      service: payload.service,
      property_type: payload.property_type,
      timeline: payload.timeline,
      headline_variant: payload.headline_variant,
    };
    if (payload.lead_type === "commercial") {
      // Email/phone only travel inside user_data (enhanced conversions), never in URLs or logs.
      await trackAndWait("generate_lead", { ...params, user_data: { email: payload.email, phone_number: payload.phone_e164 } });
    } else {
      await trackAndWait("lead_residential", params);
    }

    const next = new URL(LANG === "es" ? "es/gracias/" : "thank-you/", SITE_ROOT);
    next.search = location.search;
    location.assign(next.href);
  });
}

init();
