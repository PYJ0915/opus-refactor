const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const resolveImage = (url) => {
  if (!url) return "/no-thumbnail.png";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${BASE}${url}`;
};