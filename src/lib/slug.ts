import { customAlphabet } from "nanoid";

// Unambiguous URL-safe alphabet: drops look-alike characters (0/O, 1/l/I) so
// slugs are easy to read aloud and retype.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const SLUG_LENGTH = 7;

const nanoid = customAlphabet(ALPHABET, SLUG_LENGTH);

export function generateSlug(): string {
  return nanoid();
}

// Custom aliases: letters, numbers, hyphen and underscore, 3–32 characters.
const CUSTOM_SLUG_RE = /^[A-Za-z0-9_-]{3,32}$/;

// Reserved words that would shadow real application routes.
const RESERVED = new Set(["api", "dashboard", "_next", "favicon.ico", "robots.txt"]);

export function isValidCustomSlug(slug: string): boolean {
  return CUSTOM_SLUG_RE.test(slug) && !RESERVED.has(slug.toLowerCase());
}
