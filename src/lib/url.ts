// Validate and canonicalize a destination URL. Returns the normalized string,
// or null when the input is unparseable or not an http(s) URL.
export function normalizeHttpUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  return url.toString();
}
