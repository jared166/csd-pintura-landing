/**
 * Small shared helpers. No business logic here.
 */
import { CONFIG } from "./config.js";

/** Site root, resolved from this file's URL, so the site works under any sub-path. */
export const SITE_ROOT = new URL("../../", import.meta.url);

/** Page language: "en" | "es" (from <html lang>). */
export const LANG = (document.documentElement.lang || "en").toLowerCase().startsWith("es") ? "es" : "en";

/** Local development host (used only for the discreet "Webhook not configured" notice). */
export const IS_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);

/** True for a non-empty string, non-empty array or truthy value. */
export function has(value) {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

/** Language-specific config value: pick("hours") → CONFIG.hours_en / CONFIG.hours_es. */
export function pick(key, obj = CONFIG) {
  const value = obj[`${key}_${LANG}`];
  return typeof value === "string" ? value.trim() : "";
}

/** Resolves an asset path from config against the site root. */
export function assetUrl(path) {
  return new URL(String(path).replace(/^\/+/, ""), SITE_ROOT).href;
}

/** Only http(s) links are allowed from config (never javascript:, data:, etc.). */
export function safeUrl(value) {
  if (!has(value)) return "";
  try {
    const url = new URL(value.trim(), location.href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

/**
 * Phone from config: "primary" (CONFIG.phone, used by every call button) or
 * "secondary" (CONFIG.phoneSecondary, footer only). Returns { text, href };
 * both empty unless the visible number has a value, so the page never shows
 * an empty or orphan tel: link.
 */
export function phoneFor(which = "primary") {
  const text = String((which === "secondary" ? CONFIG.phoneSecondary : CONFIG.phone) || "").trim();
  if (!text) return { text: "", href: "" };
  const e164 = String((which === "secondary" ? CONFIG.phoneSecondaryE164 : CONFIG.phoneE164) || "").replace(/[^\d+]/g, "");
  if (/^\+1\d{10}$/.test(e164)) return { text, href: `tel:${e164}` };
  let digits = text.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return { text, href: digits.length === 10 ? `tel:+1${digits}` : "" };
}

/** tel: href of the primary phone ("" if not configured). */
export function telHref() {
  return phoneFor("primary").href;
}

/** Valid email from config, or "". */
export function configEmail() {
  const email = (CONFIG.email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}
