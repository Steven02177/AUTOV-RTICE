import { useEffect } from "react";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function setMeta({
  title,
  description,
  image,
  path,
}: {
  title: string;
  description: string;
  image?: string;
  path?: string;
}) {
  document.title = title;
  upsertMeta('meta[name="description"]', "name", "description", description);
  upsertMeta('meta[property="og:title"]', "property", "og:title", title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", description);
  upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
  if (image) upsertMeta('meta[property="og:image"]', "property", "og:image", image);
  if (path) upsertMeta('meta[property="og:url"]', "property", "og:url", path);
}

/** Hook simple para metadatos por página (SPA). */
export function useDocumentMeta(title: string, description: string, image?: string, path?: string) {
  useEffect(() => {
    setMeta({ title, description, image, path });
  }, [title, description, image, path]);
}
