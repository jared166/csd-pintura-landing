/**
 * Page behaviour shared by every page:
 * config-driven contact data, language switch, headline variant, mobile
 * sticky bar, click-to-call tracking, conditional sections (site visit,
 * cross-sell, gallery, before/after, optional blocks), JSON-LD and reveal.
 *
 * Everything degrades gracefully: an empty config value removes its element.
 */
import { CONFIG } from "./config.js";
import { track, trackAndWait, GTM_ENABLED } from "./tracking.js"; // also loads GTM (first import)
import "./attribution.js";
import { LANG, has, pick, assetUrl, safeUrl, telHref, configEmail } from "./util.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const T = {
  en: { call: "Call", before: "Before", after: "After", close: "Close", open: "Open photo", reviews: "Google reviews", seeGoogle: "See on Google ↗", compare: "Before and after comparison" },
  es: { call: "Llamar al", before: "Antes", after: "Después", close: "Cerrar", open: "Abrir foto", reviews: "Reseñas de Google", seeGoogle: "Ver en Google ↗", compare: "Comparación de antes y después" },
}[LANG];

/** Removes the closest [data-cfg-wrap] (or the element itself). */
function drop(el) {
  (el.closest("[data-cfg-wrap]") || el).remove();
}
function reveal(el) {
  el.hidden = false;
  const wrap = el.closest("[data-cfg-wrap]");
  if (wrap) wrap.hidden = false;
}

/* 1. Contact & legal data ------------------------------------------------ */
function fillConfigData() {
  $$("[data-cfg]").forEach((el) => {
    const key = el.dataset.cfg;
    const value = key === "hours" ? pick("hours") : String(CONFIG[key] || "").trim();
    if (!value) return drop(el);
    el.textContent = value;
    reveal(el);
  });

  const tel = telHref();
  $$("[data-tel]").forEach((a) => {
    if (!tel) return drop(a);
    a.href = tel;
    $$("[data-phone-text]", a).forEach((span) => (span.textContent = CONFIG.phone.trim()));
    if (a.hasAttribute("data-tel-label")) a.setAttribute("aria-label", `${T.call} ${CONFIG.phone.trim()}`);
    reveal(a);
  });

  // Inline phrases ("give us a call") become tel: links only when there is a phone.
  $$("[data-tel-inline]").forEach((span) => {
    if (!tel) return;
    const a = document.createElement("a");
    a.href = tel;
    a.dataset.callLocation = span.dataset.callLocation || "faq";
    a.textContent = span.textContent;
    span.replaceWith(a);
  });

  const email = configEmail();
  $$("[data-email]").forEach((a) => {
    if (!email) return drop(a);
    a.href = `mailto:${email}`;
    a.textContent = email;
    reveal(a);
  });

  // Inline lists: hide the list if every item was removed.
  $$("[data-cfg-list]").forEach((list) => {
    if (!list.children.length) list.remove();
    else list.hidden = false;
  });

  const year = String(new Date().getFullYear());
  $$("[data-year]").forEach((el) => (el.textContent = year));
}

/* 2. Language switch (keeps query string + hash) ------------------------- */
function initLanguageSwitch() {
  $$("[data-lang-switch]").forEach((a) => {
    const base = new URL(a.getAttribute("href"), location.href);
    const target = () => {
      const url = new URL(base.href);
      url.search = location.search;
      url.hash = location.hash;
      return url.href;
    };
    const sync = () => (a.href = target());
    sync();
    window.addEventListener("hashchange", sync);
    a.addEventListener("click", (event) => {
      sync();
      const params = { from: LANG, to: LANG === "en" ? "es" : "en" };
      const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
      if (!GTM_ENABLED || modified) return track("language_switch", params);
      event.preventDefault();
      trackAndWait("language_switch", params, 800).then(() => location.assign(target()));
    });
  });
}

/* 3. Click-to-call tracking (any tel: link, including ones added later) --- */
function initCallTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest('a[href^="tel:"]');
    if (!link) return;
    track("click_to_call", { location: link.dataset.callLocation || "unknown", language: LANG });
  });
}

/* 4. Mobile sticky bar: visible after the hero, hidden while #quote is on screen */
function initStickyBar() {
  const bar = $("[data-sticky-bar]");
  const hero = $("#hero");
  const quote = $("#quote");
  if (!bar || !hero || !quote || !("IntersectionObserver" in window)) return;
  if (!$("[data-tel]", bar)) bar.classList.add("sticky-cta--single");
  document.body.classList.add("has-sticky-bar");

  let pastHero = false;
  let quoteVisible = false;
  const update = () => {
    const show = pastHero && !quoteVisible;
    bar.classList.toggle("is-visible", show);
    bar.toggleAttribute("inert", !show);
    bar.setAttribute("aria-hidden", String(!show));
  };
  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(hero);
  new IntersectionObserver(([entry]) => {
    quoteVisible = entry.isIntersecting;
    update();
  }, { rootMargin: "0px 0px -20% 0px" }).observe($("#quote-form") || quote);
  update();
}

/* 5. Conditional content ------------------------------------------------- */
function initSiteVisit() {
  if (CONFIG.siteVisit === true) $$("[data-site-visit]").forEach((el) => (el.hidden = false));
  else $$("[data-site-visit]").forEach((el) => el.remove());
}

function initCrossSell() {
  const url = safeUrl(CONFIG[`crossSellUrl_${LANG}`]);
  $$("[data-cross-sell]").forEach((a) => {
    if (!url) return drop(a);
    a.href = url;
    reveal(a);
  });
}

function initHeroImage() {
  const media = $("[data-hero-media]");
  if (!media || !has(CONFIG.heroImage)) return;
  const img = new Image();
  img.src = assetUrl(CONFIG.heroImage);
  img.alt = pick("heroImageAlt");
  img.decoding = "async";
  img.setAttribute("fetchpriority", "high");
  img.className = "hero__photo";
  media.replaceChildren(img);
  media.classList.add("hero__media--photo");
  if (img.alt) media.removeAttribute("aria-hidden");
}

function buildImg({ src, srcset, sizes, width, height }, alt, lazy = true) {
  const img = new Image();
  img.src = assetUrl(src);
  if (srcset) img.srcset = String(srcset).split(",").map((part) => {
    const [path, descriptor] = part.trim().split(/\s+/);
    return `${assetUrl(path)} ${descriptor || ""}`.trim();
  }).join(", ");
  if (sizes) img.sizes = sizes;
  if (width) img.width = Number(width);
  if (height) img.height = Number(height);
  img.alt = alt || "";
  img.decoding = "async";
  if (lazy) img.loading = "lazy";
  return img;
}

let lightbox;
function openLightbox(item, opener) {
  if (!lightbox) {
    lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";
    lightbox.innerHTML = '<button type="button" class="lightbox__close"></button><figure class="lightbox__figure"><div class="lightbox__media"></div><figcaption class="lightbox__caption"></figcaption></figure>';
    const close = $(".lightbox__close", lightbox);
    close.setAttribute("aria-label", T.close);
    close.textContent = "×";
    close.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
    lightbox.addEventListener("close", () => { document.documentElement.classList.remove("is-locked"); lightbox._opener?.focus(); });
    document.body.append(lightbox);
  }
  lightbox._opener = opener;
  $(".lightbox__media", lightbox).replaceChildren(buildImg(item, item[`alt_${LANG}`], false));
  const caption = $(".lightbox__caption", lightbox);
  caption.textContent = item[`caption_${LANG}`] || "";
  caption.hidden = !caption.textContent;
  document.documentElement.classList.add("is-locked");
  lightbox.showModal();
}

function initGallery() {
  const section = $("#work");
  if (!section) return;
  const items = (Array.isArray(CONFIG.gallery) ? CONFIG.gallery : []).filter((item) => item && has(item.src));
  const pairs = (Array.isArray(CONFIG.beforeAfter) ? CONFIG.beforeAfter : []).filter((pair) => pair && has(pair.before) && has(pair.after));
  if (!items.length && !pairs.length) return section.remove();

  const grid = $("[data-gallery]", section);
  if (items.length) {
    items.forEach((item) => {
      const figure = document.createElement("figure");
      figure.className = "gallery__item reveal";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__button";
      const alt = item[`alt_${LANG}`] || "";
      button.setAttribute("aria-label", alt ? `${T.open}: ${alt}` : T.open);
      button.append(buildImg({ sizes: "(min-width: 1024px) 33vw, 50vw", ...item }, alt));
      button.addEventListener("click", () => openLightbox(item, button));
      figure.append(button);
      const captionText = item[`caption_${LANG}`];
      if (captionText) {
        const caption = document.createElement("figcaption");
        caption.textContent = captionText;
        figure.append(caption);
      }
      grid.append(figure);
    });
    grid.hidden = false;
  } else grid.remove();

  const compareWrap = $("[data-before-after]", section);
  if (pairs.length) {
    pairs.forEach((pair, index) => compareWrap.append(buildCompare(pair, index)));
    compareWrap.hidden = false;
  } else compareWrap.remove();

  section.hidden = false;
}

/* Before/after slider: keyboard accessible range with aria-valuenow */
function buildCompare(pair, index) {
  const alt = pair[`alt_${LANG}`] || "";
  const figure = document.createElement("figure");
  figure.className = "compare reveal";
  figure.style.setProperty("--pos", "50%");
  const after = buildImg({ src: pair.after, width: pair.width, height: pair.height }, `${T.after}: ${alt}`);
  after.className = "compare__img";
  const before = buildImg({ src: pair.before, width: pair.width, height: pair.height }, `${T.before}: ${alt}`);
  before.className = "compare__img compare__img--before";
  const range = document.createElement("input");
  range.type = "range";
  range.min = "0";
  range.max = "100";
  range.value = "50";
  range.className = "compare__range";
  range.id = `compare-${index}`;
  range.setAttribute("aria-label", alt ? `${T.compare}: ${alt}` : T.compare);
  range.setAttribute("aria-valuenow", "50");
  range.setAttribute("aria-valuetext", `${T.before} 50% · ${T.after} 50%`);
  range.addEventListener("input", () => {
    figure.style.setProperty("--pos", `${range.value}%`);
    range.setAttribute("aria-valuenow", range.value);
    range.setAttribute("aria-valuetext", `${T.before} ${range.value}% · ${T.after} ${100 - range.value}%`);
  });
  const labels = document.createElement("div");
  labels.className = "compare__labels";
  labels.setAttribute("aria-hidden", "true");
  labels.innerHTML = "<span></span><span></span>";
  labels.children[0].textContent = T.before;
  labels.children[1].textContent = T.after;
  const handle = document.createElement("span");
  handle.className = "compare__handle";
  handle.setAttribute("aria-hidden", "true");
  figure.append(after, before, handle, labels, range);
  return figure;
}

/* Optional blocks: rendered only when enabled AND with real content */
function initOptionalBlocks() {
  const flags = CONFIG.optionalBlocks || {};

  const reviewsSection = $('[data-optional="reviews"]');
  const reviews = (Array.isArray(CONFIG.googleReviews) ? CONFIG.googleReviews : []).filter((r) => r && has(r.text) && has(r.author));
  const profile = safeUrl(CONFIG.googleProfileUrl);
  if (reviewsSection) {
    if (flags.reviews === true && reviews.length && profile) {
      const inner = document.createElement("div");
      inner.className = "container";
      const h2 = document.createElement("h2");
      h2.className = "section__title";
      h2.textContent = T.reviews;
      const list = document.createElement("div");
      list.className = "reviews";
      reviews.forEach((review) => {
        const card = document.createElement("blockquote");
        card.className = "card review reveal";
        const p = document.createElement("p");
        p.textContent = review.text;
        const footer = document.createElement("footer");
        footer.textContent = [review.author, review.date].filter(Boolean).join(" · ");
        card.append(p, footer);
        list.append(card);
      });
      const link = document.createElement("a");
      link.className = "link-arrow";
      link.href = profile;
      link.rel = "noopener";
      link.target = "_blank";
      link.textContent = T.seeGoogle;
      inner.append(h2, list, link);
      reviewsSection.append(inner);
      reviewsSection.hidden = false;
    } else reviewsSection.remove();
  }

  const trustSection = $('[data-optional="trust"]');
  if (trustSection) {
    const texts = [];
    if (flags.guarantee === true && pick("guaranteeText")) texts.push(pick("guaranteeText"));
    if (flags.licenseInsurance === true && pick("licenseText")) texts.push(pick("licenseText"));
    if (texts.length) {
      const inner = document.createElement("div");
      inner.className = "container trust";
      texts.forEach((text) => {
        const p = document.createElement("p");
        p.className = "card trust__item reveal";
        p.textContent = text;
        inner.append(p);
      });
      trustSection.append(inner);
      trustSection.hidden = false;
    } else trustSection.remove();
  }
}

/* 6. LocalBusiness JSON-LD: only fields with a value; no name → no block */
function initLocalBusinessSchema() {
  if (!has(CONFIG.legalName)) return;
  const data = { "@context": "https://schema.org", "@type": "LocalBusiness", name: CONFIG.legalName.trim(), url: location.origin + location.pathname };
  const tel = telHref();
  if (tel) data.telephone = tel.replace("tel:", "");
  if (configEmail()) data.email = configEmail();
  if (has(CONFIG.address)) data.address = CONFIG.address.trim();
  if (Array.isArray(CONFIG.openingHoursSchema) && CONFIG.openingHoursSchema.length) data.openingHours = CONFIG.openingHoursSchema;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

/* 7. noindex (static meta in every page; removed only if config says so) */
function syncRobots() {
  const meta = $('meta[name="robots"]');
  if (CONFIG.noindex === false) meta?.remove();
  else if (!meta) {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, follow";
    document.head.append(tag);
  }
}

/* 8. Reveal on scroll (fade + 8px; fade only with prefers-reduced-motion, via CSS).
   Low threshold + 6 s safety net: content is never left hidden. */
function initReveal() {
  const items = $$(".reveal");
  // Light stagger for siblings inside the same grid/list
  items.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((n) => n.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--d", `${Math.min(index, 5) * 70}ms`);
  });
  const showAll = () => items.forEach((el) => el.classList.add("is-in"));
  if (!("IntersectionObserver" in window)) return showAll();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
  items.forEach((el) => io.observe(el));
  setTimeout(() => items.forEach((el) => {
    if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
  }), 6000);
}

/* Card halo: cyan glow follows the pointer inside cards (mouse only, no custom cursor) */
function initCardHalo() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest && event.target.closest(".card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, { passive: true });
}

/* 9. Header state on scroll (thin border once the page moves) */
function initHeader() {
  const header = $("[data-header]");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* Each init is isolated: one failure never breaks the rest of the page. */
function safe(fn) {
  try {
    fn();
  } catch (error) {
    console.warn(`[CSD] ${fn.name} failed`, error);
  }
}

[
  syncRobots,
  fillConfigData,
  initLanguageSwitch,
  initCallTracking,
  initSiteVisit,
  initCrossSell,
  initHeroImage,
  initGallery,
  initOptionalBlocks,
  initLocalBusinessSchema,
  initStickyBar,
  initHeader,
  initReveal,
  initCardHalo,
].forEach(safe);
