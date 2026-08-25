"use strict";

/*
  Privacy-first site analytics for BoRam and Binna pages.
  - No cookies, localStorage, fingerprinting, account IDs, email, or precise location.
  - Sends only: allowed event name, allowed page path, and coarse source category.
  - The Supabase publishable key is intended for browser use; the database exposes
    only the validated record_site_event RPC to anonymous visitors.
*/

(function () {
 const SUPABASE_URL = "https://kacvynoegfpvgdpqtjdi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6";
  const ALLOWED_PATHS = new Set(["/", "/binna/"]);

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

    fetch(SUPABASE_URL + "/rest/v1/rpc/record_site_event", {
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
      }),
    }).catch(() => {
      // Analytics must never interrupt the page or the game link.
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
