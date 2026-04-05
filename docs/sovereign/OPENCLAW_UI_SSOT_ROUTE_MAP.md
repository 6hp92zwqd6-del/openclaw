# OpenClaw UI SSOT Route Map

Status: v0.1 starter
Mode: read-only UI shell first

## 1) Route group

Recommended top-level route group:

- `/ssot`

This should be added as a governed route group inside the existing OpenClaw Control UI rather than replacing the current dashboard structure.

## 2) Landing route

### `/ssot`

Purpose:

- explain the authority split
- show current fork status
- show corridor vs SSOT distinction
- provide entry links to all governed slices

Required cards:

- current fork
- corridor binding
- connector binding
- pattern stack binding
- governance standard binding
- validation status

## 3) Slice routes

### `/ssot/control-tower`

Primary job:

- one-screen operating summary

Panels:

- build summary
- authority summary
- current gates
- ready / blocked state

### `/ssot/connectors`

Primary job:

- expose the governing connector record for this build

Panels:

- active connector record
- provider / runtime posture
- reconnect state
- auth posture
- test readiness

### `/ssot/pattern-stack`

Primary job:

- expose the pattern stack that governs the build

Panels:

- pattern identity
- inherited controls
- required primitives
- required receipts

### `/ssot/governance`

Primary job:

- make the governing standard visible to operators during build and test

Panels:

- standard identity
- mandatory rules
- promotion rules
- non-goals / forbidden actions

### `/ssot/srepo`

Primary job:

- show derivation and downstream wiring

Panels:

- source stack
- local implementation target
- derivative artifacts
- promotion targets

### `/ssot/validation`

Primary job:

- separate working state from verified state

Panels:

- test run state
- gate matrix
- receipt status
- promotion recommendation

## 4) Common page chrome

Every SSOT page should include:

- page title
- authority badge
- source type badge
- environment badge
- status badge
- last validated state

## 5) Common state badges

Recommended normalized badges:

- `working`
- `bound`
- `unbound`
- `planned`
- `in-review`
- `validated`
- `blocked`
- `promoted`

## 6) Read/write policy for v0.1

All routes should be read-only in the first pass.

Allowed in v0.1:

- view state
- compare state
- inspect gates
- inspect route metadata

Not allowed in v0.1:

- write back to private SSOT records
- mutate runtime config from SSOT pages
- promote directly from the UI

## 7) Suggested navigation label

Sidebar group label:

- `SSOT`

Suggested ordered entries:

1. Overview
2. Control Tower
3. Connectors
4. Pattern Stack
5. Governance
6. SRepo Wiring
7. Validation

## 8) Done condition for UI shell

The route shell is ready for testing when:

- all seven routes render
- each route displays authority and status metadata
- corridor is visually marked as non-authoritative
- validation route is visually separate from working state
- no write actions are exposed
