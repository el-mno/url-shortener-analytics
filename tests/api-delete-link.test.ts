import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/links/[slug]/route";
import { slugCacheKey } from "@/lib/redis";

// Spies shared between the module mocks and the assertions. `vi.hoisted` makes
// them available to the (hoisted) `vi.mock` factories below.
const { deleteMock, whereMock, returningMock, delMock } = vi.hoisted(() => {
  const returningMock = vi.fn();
  const whereMock = vi.fn(() => ({ returning: returningMock }));
  const deleteMock = vi.fn(() => ({ where: whereMock }));
  const delMock = vi.fn(() => Promise.resolve(1));
  return { deleteMock, whereMock, returningMock, delMock };
});

// Stub the database so no real Postgres connection is needed.
vi.mock("@/lib/db", () => ({ db: { delete: deleteMock } }));

// Keep the real cache-key helper, but replace the Redis client with a spy.
vi.mock("@/lib/redis", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/redis")>();
  return { ...actual, redis: { del: delMock } };
});

function callDelete(slug: string) {
  return DELETE(new Request(`http://localhost/api/links/${slug}`, { method: "DELETE" }), {
    params: Promise.resolve({ slug }),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/links/[slug]", () => {
  it("deletes an existing link and evicts its cache entry", async () => {
    returningMock.mockResolvedValueOnce([{ slug: "abc123" }]);

    const response = await callDelete("abc123");

    expect(response.status).toBe(204);
    expect(deleteMock).toHaveBeenCalledOnce();
    expect(whereMock).toHaveBeenCalledOnce();
    expect(delMock).toHaveBeenCalledWith(slugCacheKey("abc123"));
  });

  it("returns 404 and leaves the cache untouched for an unknown slug", async () => {
    returningMock.mockResolvedValueOnce([]);

    const response = await callDelete("missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Link not found" });
    expect(delMock).not.toHaveBeenCalled();
  });
});
