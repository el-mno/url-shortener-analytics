import UAParser from "ua-parser-js";

export interface ParsedUserAgent {
  deviceType: string;
  browser: string | null;
  os: string | null;
}

// Classify a User-Agent string into a coarse device type plus browser/OS names.
// The parser leaves device.type undefined for desktops, so we normalize that.
export function parseUserAgent(uaString: string | null): ParsedUserAgent {
  if (!uaString) {
    return { deviceType: "unknown", browser: null, os: null };
  }

  const result = new UAParser(uaString).getResult();
  return {
    deviceType: result.device.type ?? "desktop",
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
  };
}
