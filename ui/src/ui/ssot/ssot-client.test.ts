import { describe, expect, it } from "vitest";
import { bundledSsotManifest } from "./manifest.default.ts";
import { loadManifest, validateManifest } from "./ssot-client.ts";
import type { SsotManifest } from "./types.ts";

describe("SSOT manifest validation", () => {
  it("accepts the bundled default manifest", () => {
    const result = validateManifest(bundledSsotManifest);
    expect(result.ok).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  it("rejects Notion URLs in manifest strings", () => {
    const manifest: SsotManifest = {
      ...bundledSsotManifest,
      meta: {
        ...bundledSsotManifest.meta,
        notes: ["https://www.notion.so/private-page"],
      },
    };
    const result = validateManifest(manifest);
    expect(result.ok).toBe(false);
    expect(result.messages.some((message) => message.code === "forbidden.notion_url")).toBe(true);
  });

  it("rejects write-capable slices", () => {
    const manifest: SsotManifest = {
      ...bundledSsotManifest,
      uiContract: {
        ...bundledSsotManifest.uiContract,
        slices: bundledSsotManifest.uiContract.slices.map((slice, index) =>
          index === 0 ? { ...slice, writeCapable: true } : slice,
        ),
      },
    };
    const result = validateManifest(manifest);
    expect(result.ok).toBe(false);
    expect(result.messages.some((message) => message.code === "slice.write_capable")).toBe(true);
  });
});

describe("SSOT manifest loading", () => {
  it("falls back to the bundled default when fetch is unavailable", async () => {
    const result = await loadManifest({ fetchImpl: undefined });
    expect(result.source).toBe("bundled-default");
    expect(result.manifest.meta.project).toBe("openclaw-ui-ssot");
  });

  it("uses a validated override manifest when the gateway returns one", async () => {
    const result = await loadManifest({
      fetchImpl: async () =>
        new Response(JSON.stringify(bundledSsotManifest), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });
    expect(result.source).toBe("gateway-override");
    expect(result.validation.ok).toBe(true);
  });

  it("falls back when the override manifest is invalid", async () => {
    const invalidManifest: SsotManifest = {
      ...bundledSsotManifest,
      meta: {
        ...bundledSsotManifest.meta,
        notes: ["https://www.notion.so/private-page"],
      },
    };

    const result = await loadManifest({
      fetchImpl: async () =>
        new Response(JSON.stringify(invalidManifest), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });

    expect(result.source).toBe("gateway-fallback");
    expect(result.manifest.meta.project).toBe("openclaw-ui-ssot");
    expect(result.validation.messages.some((message) => message.code === "override.invalid_fallback")).toBe(true);
  });
});
