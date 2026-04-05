export type SsotNamedObjectKey =
  | "corridor"
  | "connectorRecord"
  | "patternStack"
  | "governanceStandard"
  | "srepoBinding"
  | "validation";

export type SsotSliceId =
  | "overview"
  | "control-tower"
  | "connectors"
  | "pattern-stack"
  | "governance"
  | "srepo"
  | "validation";

export type SsotValidationLevel = "error" | "warning" | "info";

export type SsotValidationMessage = {
  level: SsotValidationLevel;
  code: string;
  message: string;
};

export type SsotValidationResult = {
  ok: boolean;
  messages: SsotValidationMessage[];
};

export type SsotSliceDefinition = {
  id: SsotSliceId;
  title: string;
  route: string;
  description: string;
  namedObjects: SsotNamedObjectKey[];
  writeCapable?: boolean;
};

export type SsotManifest = {
  meta: {
    project: string;
    fork: string;
    status: string;
    version: string;
    classification: string;
    notes: string[];
  };
  corridor: {
    name: string;
    role: string;
    authoritative: boolean;
    status: string;
  };
  connectorRecord: {
    registry: string;
    record: string;
    authoritative: boolean;
    provider: string;
    runtimeSurface: string;
    status: string;
    fields: Record<string, unknown>;
  };
  patternStack: {
    registry: string;
    authoritative: boolean;
    status: string;
    fields: Record<string, unknown>;
  };
  governanceStandard: {
    name: string;
    authoritative: boolean;
    status: string;
    fields: {
      standardVersion: string | null;
      mandatoryRules: string[];
      promotionRequired: boolean;
    };
  };
  srepoBinding: {
    name: string;
    authoritative: boolean;
    status: string;
    fields: Record<string, unknown>;
  };
  uiContract: {
    surface: string;
    implementation: {
      framework: string;
      build: string;
      entrypoint: string;
    };
    hybridRuntime: {
      bundledDefault: boolean;
      gatewayOverridePath: string;
      overrideMode: "optional";
    };
    slices: SsotSliceDefinition[];
  };
  validation: {
    status: string;
    gates: Array<{
      id: string;
      name: string;
      result: string;
    }>;
  };
};

export type SsotManifestSource = "bundled-default" | "gateway-override" | "gateway-fallback";

export type SsotManifestLoadResult = {
  manifest: SsotManifest;
  source: SsotManifestSource;
  overrideUrl: string | null;
  validation: SsotValidationResult;
};
