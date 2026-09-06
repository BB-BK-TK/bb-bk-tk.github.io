"use strict";

/*
  Privacy-conscious site analytics for BoRam and Binna pages.
  - Uses one random browser ID stored in localStorage to estimate unique browsers.
  - No cookies, fingerprinting, account IDs, email, user agent, IP, or precise location are stored.
  - Sends only: allowed event name, allowed page path, coarse source category, and random visitor ID.
  - The Supabase publishable key is intended for browser use; the database exposes
    only the validated record_site_event_v2 RPC to anonymous visitors.
*/

(function () {
  const SUPABASE_URL = "https://kacvynoegfpvgdpqtjdi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6";
  const ALLOWED_PATHS = new Set(["/", "/binna/"]);
  const VISITOR_KEY = "boram_analytics_visitor_id_v1";
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let inMemoryVisitorId = null;

  function createVisitorId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }

  function visitorId() {
    if (inMemoryVisitorId) return inMemoryVisitorId;

    try {
      const existing = localStorage.getItem(VISITOR_KEY);
      if (existing && UUID_RE.test(existing)) {
        inMemoryVisitorId = existing;
        return existing;
      }
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }

    const id = createVisitorId();
    inMemoryVisitorId = id;
    try {
      localStorage.setItem(VISITOR_KEY, id);
    } catch {
      // Keep the ID only for this page session when storage is unavailable.
    }
    return id;
  }

  function pagePath() {
    const path = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";
    if (path === "//") return "/";
    return ALLOWED_PATHS.has(path) ? path : null;
  }

  function sourceCategory() {
    const tagged = new URLSearchParams(location.search).get("utm_source");
    const value = (tagged || "").toLowerCase();
    if (value === "instagram") return "instagram";
    if (value === "linkedin") return "linkedin";

    if (!document.referrer) return "direct";
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host.includes("instagram.com") || host.includes("l.instagram.com")) return "instagram";
      if (host.includes("linkedin.com")) return "linkedin";
      if (host === location.hostname) return "internal";
      return "other";
    } catch {
      return "other";
    }
  }

  function record(eventName) {
    const path = pagePath();
    if (!path || !["page_view", "pixel_obby_click"].includes(eventName)) return;

    fetch(SUPABASE_URL + "/rest/v1/rpc/record_site_event_v2", {
      method: "POST",
      keepalive: true,
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_event_name: eventName,
        p_page_path: path,
        p_source: sourceCategory(),
        p_visitor_id: visitorId(),
      }),
    }).catch(() => {
      // Analytics must never interrupt the page or outbound links.
    });
  }

  function bindPixelObbyClicks() {
    document.querySelectorAll('a[href*="pixel-obby"]').forEach((link) => {
      link.addEventListener("click", () => record("pixel_obby_click"), { passive: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      record("page_view");
      bindPixelObbyClicks();
    }, { once: true });
  } else {
    record("page_view");
    bindPixelObbyClicks();
  }
})();
