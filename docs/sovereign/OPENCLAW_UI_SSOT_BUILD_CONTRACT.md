# OpenClaw UI SSOT Build Contract

Status: v0.1 starter
Scope: OpenClaw fork build aligned to the Testing Corridor and the private SSOT objects that govern connector, pattern, governance, and SRepo decisions.

## 1) Intent

This document defines the first governed build contract for adding an SSOT-backed operator surface to the OpenClaw Control UI.

The goal is **not** to replace OpenClaw's current control plane.
The goal is to add a **governed overlay** that makes the following explicit:

- what is authoritative
- what is working/index only
- what is implementation only
- what is review/export only
- what must be tested before promotion

## 2) Authority model

### Private workspace authority

The private Notion workspace remains authoritative for the following objects:

- **Testing Corridor — OpenClaw + MoltShit**
  - Role: working corridor / landing page / index
  - Constraint: this is **not** the SSOT

- **Connector Registry — SSOT (Rebuild + Reconnect)**
  - Role: connector system of record
  - Required record: the ChatGPT / OpenAI connector used by this build

- **Ecosystem Capability Pattern Stack Registry**
  - Role: first-class pattern registry for reusable capability stacks

- **Enterprise Standard — Pattern Stack Governance**
  - Role: apply-everywhere governing standard

- **Sovereign Repository — Capability Pattern Stacks**
  - Role: hub that wires the registries and governs downstream derivation

### Build-system authority

For this fork, authority is split by surface:

- **Notion** = business / governance / connector / pattern / corridor authority
- **GitHub** = implementation authority for code, docs, typed contracts, and local test scaffolds
- **Figma** = UI authority for route map, operator flow, and component/state layout
- **Canva** = review/explainer surface for working narrative and stakeholder walkthroughs

## 3) Core rule

**Where is not the SSOT.**

A page, route, dashboard, or corridor can expose and summarize state, but the source of truth must remain in the named authoritative object.

## 4) OpenClaw alignment

This fork already has an existing browser Control UI, served by the Gateway, built as a Vite + Lit app, and built with `pnpm ui:build`.

That means this effort should use an **overlay strategy**:

1. keep the existing OpenClaw Control UI intact
2. add an SSOT-backed route model
3. add typed manifests for governed objects
4. bind UI screens to governed records instead of ad hoc local state alone
5. keep testing and promotion separate from working state

## 5) Initial governed UI slices

The first UI SSOT should expose six slices:

### S1. Control Tower

Purpose:

- show current build state
- show corridor vs SSOT distinction
- show promotion gates
- show current validation status

Primary data:

- current fork metadata
- current corridor binding
- current governance standard version
- current validation state

### S2. Connector Registry

Purpose:

- show the connector record that governs the build
- show reconnect / rebuild status
- show auth mode, transport mode, trust posture, and testing readiness

Primary data:

- connector key
- provider name
- runtime surface
- auth / token posture
- status
- reconnect requirements

### S3. Pattern Stack Registry

Purpose:

- show which capability pattern stack this build is instantiating
- show required primitives and inherited controls

Primary data:

- pattern stack id
- governing pattern family
- inherited controls
- required receipts
- lane / vertical applicability

### S4. Governance Standard

Purpose:

- make the apply-everywhere standard visible in the operator flow
- prevent drift between build, testing, and promotion

Primary data:

- standard version
- mandatory rules
- non-negotiable gates
- promotion requirements

### S5. SRepo Wiring

Purpose:

- show how the fork binds to the sovereign pattern stack and downstream artifacts
- keep derivation traceable

Primary data:

- source stack
- local implementation target
- derivative artifacts
- promotion target(s)

### S6. Test + Validation

Purpose:

- make testing explicit before promotion
- separate working state from verified state

Primary data:

- build version under test
- test suites
- validation receipts
- gate results
- promotion recommendation

## 6) Minimal data contract

The first implementation should assume the following top-level SSOT object groups:

- `corridor`
- `connectorRecord`
- `patternStack`
- `governanceStandard`
- `srepoBinding`
- `uiContract`
- `validation`

These are scaffolded in the JSON manifest that accompanies this document.

## 7) Repo-safe first step

The first repo-safe step is documentation + manifest only.
No runtime behavior changes are required to adopt the contract.

Immediate outputs:

- this build contract
- a starter manifest scaffold
- a Figma wiring map
- a Canva working doc

## 8) Suggested implementation sequence

### Phase 0 — contract

- define authority model
- define slices
- define data groups
- define promotion boundary

### Phase 1 — manifest

- create local scaffold for governed object shape
- map fields to private SSOT objects
- mark unresolved fields explicitly

### Phase 2 — UI route shell

- add SSOT route group to the existing Control UI
- create read-only views first
- do not write back to runtime config yet

### Phase 3 — typed adapters

- add typed adapters that transform private SSOT snapshots into UI-ready view models
- keep write paths disabled until validation gates exist

### Phase 4 — test loop

- bind each UI slice to a validation checklist
- require gate pass before promotion beyond working corridor use

## 9) Acceptance gates

The starter SSOT/UI slice is ready for testing when all of the following are true:

- corridor page is treated as index only, not authority
- connector record is explicitly identified as the runtime source of truth
- pattern stack record is explicitly identified as inherited control source
- governance standard is visible and bound to every slice
- SRepo binding is traceable
- test status is visible and separate from working state

## 10) Non-goals for v0.1

Do not do these yet:

- do not replace the existing OpenClaw dashboard
- do not write directly to private SSOT objects from the public UI
- do not expose private workspace URLs in public repo docs
- do not collapse corridor, registry, and governance objects into one page

## 11) Next build targets

The next concrete repo targets after this contract are:

1. a route map for the SSOT operator surfaces
2. typed view-model adapters for the six slices
3. a read-only UI shell inside the existing `ui` app
4. a test harness that separates working, validated, and promoted states
