import type { SsotManifest } from "./types.ts";

export const bundledSsotManifest: SsotManifest = {
  meta: {
    project: "openclaw-ui-ssot",
    fork: "6hp92zwqd6-del/openclaw",
    status: "starter",
    version: "0.1.0",
    classification: "working",
    notes: [
      "Testing Corridor is a working/index surface and not the SSOT.",
      "Private SSOT objects remain authoritative for connector, pattern, governance, and SRepo state.",
      "The browser shell must stay corridor-safe: no private URLs, no direct Notion calls, and no secret-bearing fetches.",
    ],
  },
  corridor: {
    name: "TESTING CORRIDOR — OpenClaw + MoltShit",
    role: "working-index",
    authoritative: false,
    status: "active",
  },
  connectorRecord: {
    registry: "Connector Registry — SSOT (Rebuild + Reconnect)",
    record: "ChatGPT (OpenAI)",
    authoritative: true,
    provider: "OpenAI",
    runtimeSurface: "ChatGPT connector",
    status: "to-bind",
    fields: {
      connectorId: null,
      authMode: null,
      transportMode: null,
      reconnectState: null,
      trustBoundary: null,
      testReadiness: null,
    },
  },
  patternStack: {
    registry: "Ecosystem Capability Pattern Stack Registry",
    authoritative: true,
    status: "to-bind",
    fields: {
      patternStackId: null,
      patternName: "OpenClaw UI SSOT",
      family: "Sovereign Capability Pattern Stack",
      requiredPrimitives: [],
      requiredReceipts: [],
      inheritedControls: [],
    },
  },
  governanceStandard: {
    name: "Enterprise Standard — Pattern Stack Governance",
    authoritative: true,
    status: "required",
    fields: {
      standardVersion: null,
      mandatoryRules: [
        "Where is not the SSOT.",
        "Governance, connector, pattern, and SRepo authority remain separated.",
        "Testing and promotion must remain distinct from working state.",
      ],
      promotionRequired: true,
    },
  },
  srepoBinding: {
    name: "Sovereign Repository — Capability Pattern Stacks",
    authoritative: true,
    status: "to-bind",
    fields: {
      bindingId: null,
      sourceStack: null,
      localImplementationTarget: "OpenClaw Control UI",
      derivativeArtifacts: [],
      promotionTargets: [],
    },
  },
  uiContract: {
    surface: "OpenClaw Control UI",
    implementation: {
      framework: "Lit",
      build: "pnpm ui:build",
      entrypoint: "ui/src/ui/app.ts",
    },
    hybridRuntime: {
      bundledDefault: true,
      gatewayOverridePath: "/api/ssot/manifest.json",
      overrideMode: "optional",
    },
    slices: [
      {
        id: "overview",
        title: "Overview",
        route: "/ssot",
        description:
          "Authority split, corridor posture, and the current SSOT wiring state for this fork.",
        namedObjects: [
          "corridor",
          "connectorRecord",
          "patternStack",
          "governanceStandard",
          "srepoBinding",
          "validation",
        ],
      },
      {
        id: "control-tower",
        title: "Control Tower",
        route: "/ssot/control-tower",
        description: "One-screen operator summary: build status, authority, and current gate posture.",
        namedObjects: ["corridor", "governanceStandard", "validation"],
      },
      {
        id: "connectors",
        title: "Connectors",
        route: "/ssot/connectors",
        description:
          "Read-only view of the governing connector record and reconnect or rebuild posture.",
        namedObjects: ["connectorRecord", "validation"],
      },
      {
        id: "pattern-stack",
        title: "Pattern Stack",
        route: "/ssot/pattern-stack",
        description: "Inherited controls, required primitives, and reusable capability pattern context.",
        namedObjects: ["patternStack", "governanceStandard", "validation"],
      },
      {
        id: "governance",
        title: "Governance",
        route: "/ssot/governance",
        description: "Apply-everywhere rules that constrain build, test, and promotion behavior.",
        namedObjects: ["governanceStandard", "validation"],
      },
      {
        id: "srepo",
        title: "SRepo Wiring",
        route: "/ssot/srepo",
        description:
          "Derivation path from source stack to local implementation target and promotion surfaces.",
        namedObjects: ["srepoBinding", "patternStack", "validation"],
      },
      {
        id: "validation",
        title: "Validation",
        route: "/ssot/validation",
        description: "Validation gates and the explicit separation of working versus verified state.",
        namedObjects: ["validation", "governanceStandard"],
      },
    ],
  },
  validation: {
    status: "not-started",
    gates: [
      { id: "G1", name: "Corridor is index only", result: "pending" },
      { id: "G2", name: "Connector record explicitly bound", result: "pending" },
      { id: "G3", name: "Pattern stack explicitly bound", result: "pending" },
      { id: "G4", name: "Governance standard visible across slices", result: "pending" },
      { id: "G5", name: "SRepo derivation traceable", result: "pending" },
      { id: "G6", name: "Testing separated from working state", result: "pending" },
    ],
  },
};
