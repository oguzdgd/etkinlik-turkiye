import { useEffect } from "react";

const SITE_NAME = "Etkinlik Türkiye";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

function upsertMeta(attr, attrValue, content) {
  if (!content) {
    const existing = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (existing) existing.remove();
    return;
  }
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, image, type = "website" } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    const url = window.location.href;

    document.title = fullTitle;

    upsertMeta("name", "description", description || null);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description || null);
    upsertMeta("property", "og:image", image || null);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);

    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description || null);
    upsertMeta("name", "twitter:image", image || null);

    return () => {
      // Reset to site defaults on unmount
      document.title = SITE_NAME;
    };
  }, [title, description, image, type]);
}
