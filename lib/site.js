/** Canonical public site origin — always www (apex 301s here). */
export const SITE_URL = "https://www.solopad.io";

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
