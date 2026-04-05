import { normalizeBasePath } from "../navigation.ts";
import { bundledSsotManifest } from "./manifest.default.ts";
import type {
  SsotManifest,
  SsotManifestLoadResult,
  SsotSliceDefinition,
  SsotSliceId,
  SsotValidationMessage,
  SsotValidationResult,
} from "./types.ts";

const FORBIDDEN_STRING_PATTERNS: Array<{ pattern: RegExp; code: string; message: string }> = [
  {
    pattern: /https?:\/\/(?:www\.)?notion\.so\//i,
    code: "forbidden.notion_url",
    message: "Manifest contains a Notion URL, which is forbidden in the corridor-safe browser shell.",
  },
  {
    pattern: /[?&#](?:token|api[_-]?key|secret|password)=/i,
    code: "forbidden.secret_param",
    message: "Manifest contains a secret-bearing URL or parameter, which is forbidden in the browser shell.",
  },
];

function collectStrings(input: unknown, bucket: string[]) {
  if (typeof input === "string") {
    bucket.push(input);
    return;
  }
  if (Array.isArray(input)) {
    for (const value of input) {
      collectStrings(value, bucket);
    }
    return;
  }
  if (input && typeof input === "object") {
    for (const value of Object.values(input)) {
      collectStrings(value, bucket);
    }
  }
}

function buildOverrideUrl(basePath = "", overridePath = "/api/ssot/manifest.json"): string {
  const normalizedBasePath = normalizeBasePath(basePath);
  const normalizedOverridePath = overridePath.startsWith("/") ? overridePath : `/${overridePath}`;
  return normalizedBasePath
    ? `${normalizedBasePath}${normalizedOverridePath}`
    : normalizedOverridePath;
}

export function validateManifest(manifest: SsotManifest): SsotValidationResult {
  const messages: SsotValidationMessage[] = [];
  const strings: string[] = [];
  collectStrings(manifest, strings);

  for (const { pattern, code, message } of FORBIDDEN_STRING_PATTERNS) {
    if (strings.some((value) => pattern.test(value))) {
      messages.push({ level: "error", code, message });
    }
  }

  const slices = manifest.uiContract?.slices ?? [];
  const seenRoutes = new Set<string>();
  const seenIds = new Set<string>();

  for (const slice of slices) {
    if (seenIds.has(slice.id)) {
      messages.push({
        level: "error",
        code: "slice.duplicate_id",
        message: `Duplicate SSOT slice id found: ${slice.id}`,
      });
    }
    seenIds.add(slice.id);

    if (!slice.route.startsWith("/ssot")) {
      messages.push({
        level: "error",
        code: "slice.route_outside_ssot",
        message: `Slice route must stay inside /ssot: ${slice.route}`,
      });
    }

    if (seenRoutes.has(slice.route)) {
      messages.push({
        level: "error",
        code: "slice.duplicate_route",
        message: `Duplicate SSOT route found: ${slice.route}`,
      });
    }
    seenRoutes.add(slice.route);

    if (slice.writeCapable) {
      messages.push({
        level: "error",
        code: "slice.write_capable",
        message: `Write-capable slice detected in read-only shell: ${slice.id}`,
      });
    }
  }

  const overridePath = manifest.uiContract?.hybridRuntime?.gatewayOverridePath;
  if (!overridePath || !overridePath.startsWith("/api/ssot/")) {
    messages.push({
      level: "warning",
      code: "override.path_unexpected",
      message: "Gateway override path should stay inside /api/ssot/ for review discipline.",
    });
  }

  if (!manifest.uiContract?.hybridRuntime?.bundledDefault) {
    messages.push({
      level: "warning",
      code: "bundled.default_missing",
      message: "Hybrid runtime should keep a bundled default manifest for safe fallback behavior.",
    });
  }

  return {
    ok: messages.every((message) => message.level !== "error"),
    messages,
  };
}

export async function loadManifest(options?: {
  basePath?: string;
  fetchImpl?: typeof fetch;
}): Promise<SsotManifestLoadResult> {
  const bundledValidation = validateManifest(bundledSsotManifest);
  const fetchImpl = options?.fetchImpl ?? globalThis.fetch;
  const overrideUrl = buildOverrideUrl(
    options?.basePath,
    bundledSsotManifest.uiContract.hybridRuntime.gatewayOverridePath,
  );

  if (typeof fetchImpl !== "function") {
    return {
      manifest: bundledSsotManifest,
      source: "bundled-default",
      overrideUrl,
      validation: bundledValidation,
    };
  }

  try {
    const response = await fetchImpl(overrideUrl, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Override manifest request failed (${response.status})`);
    }

    const manifest = (await response.json()) as SsotManifest;
    const validation = validateManifest(manifest);
    if (!validation.ok) {
      return {
        manifest: bundledSsotManifest,
        source: "gateway-fallback",
        overrideUrl,
        validation: {
          ok: false,
          messages: [
            {
              level: "warning",
              code: "override.invalid_fallback",
              message:
                "Gateway override manifest failed validation. Falling back to the bundled default manifest.",
            },
            ...validation.messages,
            ...bundledValidation.messages,
          ],
        },
      };
    }

    return {
      manifest,
      source: "gateway-override",
      overrideUrl,
      validation,
    };
  } catch {
    return {
      manifest: bundledSsotManifest,
      source: "bundled-default",
      overrideUrl,
      validation: bundledValidation,
    };
  }
}

export function listSlices(manifest: SsotManifest): SsotSliceDefinition[] {
  return [...manifest.uiContract.slices];
}

export function getSlice(manifest: SsotManifest, id: SsotSliceId): SsotSliceDefinition | undefined {
  return manifest.uiContract.slices.find((slice) => slice.id === id);
}

export function getSliceByRoute(
  manifest: SsotManifest,
  logicalRoute: string,
): SsotSliceDefinition | undefined {
  return manifest.uiContract.slices.find((slice) => slice.route === logicalRoute);
}

export function resolveLogicalSsotRouteFromPathname(
  pathname: string,
  manifest: SsotManifest,
  basePath = "",
): string {
  const normalizedBasePath = normalizeBasePath(basePath);
  let currentPath = pathname || "/ssot";
  if (normalizedBasePath) {
    if (currentPath === normalizedBasePath) {
      currentPath = "/";
    } else if (currentPath.startsWith(`${normalizedBasePath}/`)) {
      currentPath = currentPath.slice(normalizedBasePath.length);
    }
  }

  const match = manifest.uiContract.slices.find(
    (slice) => currentPath === slice.route || currentPath.startsWith(`${slice.route}/`),
  );
  return match?.route ?? "/ssot";
}

export function resolveBrowserPathForLogicalRoute(logicalRoute: string, basePath = ""): string {
  const normalizedBasePath = normalizeBasePath(basePath);
  return normalizedBasePath ? `${normalizedBasePath}${logicalRoute}` : logicalRoute;
}
