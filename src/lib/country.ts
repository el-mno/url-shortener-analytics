const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

// Turn an ISO-3166 alpha-2 code into its flag emoji via regional indicator
// symbols (e.g. "US" -> 🇺🇸).
function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

// Human-friendly country label: "🇺🇸 United States". Falls back gracefully for
// the synthetic "Unknown" bucket or unrecognized codes.
export function countryLabel(code: string): string {
  if (!code || code === "Unknown" || !/^[A-Za-z]{2}$/.test(code)) {
    return "Unknown";
  }
  const name = regionNames?.of(code.toUpperCase()) ?? code.toUpperCase();
  return `${flagEmoji(code)} ${name}`;
}
