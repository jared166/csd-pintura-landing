/**
 * Attribution capture (GCLID / GBRAID / WBRAID / UTM / headline key).
 *
 * - First touch is stored with a timestamp and expires after 90 days.
 * - A NEW ad click id (gclid, gbraid or wbraid) replaces the stored record,
 *   so offline conversions are always tied to the latest paid click.
 * - Missing keys on a later visit are filled in; existing ones are kept.
 * - Storage fallback: localStorage → sessionStorage → in-memory variable.
 *   Every storage access is wrapped in try/catch (blocked storage never throws).
 */
const KEY = "csd_attribution_v1";
const TTL_MS = 90 * 24 * 60 * 60 * 1000;
const PARAMS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "h"];
const CLICK_IDS = ["gclid", "gbraid", "wbraid"];
const HEADLINE_KEYS = ["office", "exterior", "warehouse"];

let memory = null;

function pickStore() {
  for (const name of ["localStorage", "sessionStorage"]) {
    try {
      const store = window[name];
      const probe = `${KEY}__probe`;
      store.setItem(probe, "1");
      store.removeItem(probe);
      return store;
    } catch {
      /* blocked: try the next one */
    }
  }
  return null;
}

const store = pickStore();

function read() {
  let record = null;
  try {
    record = store ? JSON.parse(store.getItem(KEY) || "null") : memory;
  } catch {
    record = memory;
  }
  if (!record || typeof record !== "object") return null;
  if (!record.ts || Date.now() - record.ts > TTL_MS) {
    write(null);
    return null;
  }
  return record;
}

function write(record) {
  memory = record;
  try {
    if (!store) return;
    if (record) store.setItem(KEY, JSON.stringify(record));
    else store.removeItem(KEY);
  } catch {
    /* storage full or blocked: the in-memory copy is enough for this page */
  }
}

function fromUrl() {
  const out = {};
  let search;
  try {
    search = new URLSearchParams(location.search);
  } catch {
    return out;
  }
  for (const key of PARAMS) {
    const value = (search.get(key) || "").trim().slice(0, 300);
    if (!value) continue;
    if (key === "h" && !HEADLINE_KEYS.includes(value)) continue;
    out[key] = value;
  }
  return out;
}

function capture() {
  const incoming = fromUrl();
  let record = read();
  const hasIncoming = Object.keys(incoming).length > 0;
  const storedHasParams = record && PARAMS.some((key) => record[key]);
  const newClick = CLICK_IDS.some((key) => incoming[key] && (!record || record[key] !== incoming[key]));

  if (!record || newClick || (hasIncoming && !storedHasParams)) {
    record = {
      ...incoming,
      landing_page: location.href,
      referrer: document.referrer || "",
      ts: Date.now(),
    };
    write(record);
  } else if (hasIncoming) {
    let changed = false;
    for (const [key, value] of Object.entries(incoming)) {
      if (!record[key]) {
        record[key] = value;
        changed = true;
      }
    }
    if (changed) write(record);
  }
  return record;
}

const captured = capture();

/** Attribution fields for the form payload (every key present, empty string when unknown). */
export function getAttribution() {
  const record = read() || captured || {};
  const out = {};
  for (const key of PARAMS) out[key === "h" ? "h_param" : key] = record[key] || "";
  out.landing_page = record.landing_page || location.href;
  out.referrer = record.referrer || "";
  out.first_seen_at = record.ts ? new Date(record.ts).toISOString() : "";
  return out;
}
