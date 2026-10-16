/**
 * Google Tag Manager + dataLayer.
 *
 * Tag configuration (Google Ads conversion, GA4, Consent Mode, enhanced
 * conversions) is done INSIDE GTM, not in this repository. This file only:
 *   1. Guarantees window.dataLayer exists (pushes never fail).
 *   2. Loads GTM with the official snippet, only when CONFIG.gtmId is a valid
 *      GTM-XXXXXXX id. Without an id, no Google script is loaded.
 *   3. Exposes helpers to push events.
 *
 * Google Ads conversion = `generate_lead` only. `lead_residential` is a
 * separate event on purpose, so Google doesn't learn to bring homeowners.
 */
import { CONFIG } from "./config.js";

window.dataLayer = window.dataLayer || [];

const GTM_ID = String(CONFIG.gtmId || "").trim();
export const GTM_ENABLED = /^GTM-[A-Z0-9]{4,12}$/.test(GTM_ID);

if (GTM_ENABLED && !window.__csdGtmLoaded) {
  window.__csdGtmLoaded = true;
  /* Official GTM snippet (head) */
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", GTM_ID);
}

/** Fire-and-forget event. */
export function track(event, params = {}) {
  window.dataLayer.push({ event, ...params });
}

/**
 * Push an event and resolve once GTM confirms it (eventCallback) or after
 * `timeout` ms. Without GTM it resolves immediately. Our own timer covers
 * the case where GTM is configured but blocked (eventTimeout is GTM-side).
 */
export function trackAndWait(event, params = {}, timeout = 2000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    window.dataLayer.push({ event, ...params, eventCallback: finish, eventTimeout: timeout });
    if (!GTM_ENABLED) finish();
    else setTimeout(finish, timeout + 100);
  });
}
