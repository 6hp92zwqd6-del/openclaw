import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  loadManifest,
  resolveBrowserPathForLogicalRoute,
  resolveLogicalSsotRouteFromPathname,
} from "./ssot-client.ts";
import type {
  SsotManifest,
  SsotManifestLoadResult,
  SsotNamedObjectKey,
  SsotSliceDefinition,
  SsotValidationMessage,
} from "./types.ts";

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

@customElement("openclaw-ssot-shell")
export class OpenClawSsotShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: inherit;
    }

    .ssot {
      display: grid;
      gap: 16px;
    }

    .ssot__hero,
    .ssot__panel,
    .ssot__nav {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.02);
      padding: 16px;
    }

    .ssot__hero {
      display: grid;
      gap: 12px;
    }

    .ssot__title {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .ssot__subtitle {
      opacity: 0.82;
      line-height: 1.5;
    }

    .ssot__meta,
    .ssot__pills,
    .ssot__notes,
    .ssot__messages {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ssot__layout {
      display: grid;
      grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .ssot__nav {
      position: sticky;
      top: 0;
      display: grid;
      gap: 10px;
    }

    .ssot__nav-title,
    .ssot__panel-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0 0 6px 0;
    }

    .ssot__nav-button {
      width: 100%;
      text-align: left;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      color: inherit;
      padding: 10px 12px;
      cursor: pointer;
      display: grid;
      gap: 4px;
    }

    .ssot__nav-button--active {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.06);
    }

    .ssot__nav-button-title {
      font-weight: 600;
    }

    .ssot__nav-button-copy {
      font-size: 0.84rem;
      opacity: 0.78;
      line-height: 1.4;
    }

    .ssot__content {
      display: grid;
      gap: 16px;
    }

    .ssot__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .ssot__card {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.015);
      display: grid;
      gap: 8px;
    }

    .ssot__card-title {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      opacity: 0.75;
    }

    .ssot__card-body {
      font-size: 0.94rem;
      line-height: 1.45;
      word-break: break-word;
    }

    .ssot__pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
    }

    .ssot__pill--error {
      border-color: rgba(255, 80, 80, 0.35);
    }

    .ssot__pill--warning {
      border-color: rgba(255, 193, 7, 0.35);
    }

    .ssot__pill--info {
      border-color: rgba(0, 188, 212, 0.35);
    }

    .ssot__code {
      margin: 0;
      border-radius: 14px;
      padding: 12px;
      overflow: auto;
      white-space: pre-wrap;
      font-size: 0.84rem;
      line-height: 1.45;
      background: rgba(0, 0, 0, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .ssot__toolbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .ssot__button {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.03);
      color: inherit;
      border-radius: 999px;
      padding: 8px 12px;
      cursor: pointer;
      font: inherit;
    }

    .ssot__loading,
    .ssot__empty {
      opacity: 0.82;
      line-height: 1.5;
    }

    @media (max-width: 980px) {
      .ssot__layout {
        grid-template-columns: 1fr;
      }

      .ssot__nav {
        position: static;
      }
    }
  `;

  @property({ type: String, attribute: "base-path" }) basePath = "";

  @state() private loading = true;
  @state() private manifest: SsotManifest | null = null;
  @state() private activeRoute = "/ssot";
  @state() private source: SsotManifestLoadResult["source"] = "bundled-default";
  @state() private overrideUrl: string | null = null;
  @state() private validationMessages: SsotValidationMessage[] = [];

  private readonly onPopState = () => {
    if (!this.manifest || typeof window === "undefined") {
      return;
    }
    this.activeRoute = resolveLogicalSsotRouteFromPathname(
      window.location.pathname,
      this.manifest,
      this.basePath,
    );
  };

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.onPopState);
    }
    void this.refresh();
  }

  disconnectedCallback(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", this.onPopState);
    }
    super.disconnectedCallback();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    const result = await loadManifest({ basePath: this.basePath });
    this.manifest = result.manifest;
    this.source = result.source;
    this.overrideUrl = result.overrideUrl;
    this.validationMessages = result.validation.messages;
    this.activeRoute =
      typeof window === "undefined"
        ? "/ssot"
        : resolveLogicalSsotRouteFromPathname(window.location.pathname, result.manifest, this.basePath);
    this.loading = false;
  }

  private navigate(slice: SsotSliceDefinition): void {
    if (typeof window === "undefined") {
      return;
    }
    const nextPath = resolveBrowserPathForLogicalRoute(slice.route, this.basePath);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    this.activeRoute = slice.route;
  }

  private get activeSlice(): SsotSliceDefinition | undefined {
    return this.manifest?.uiContract.slices.find((slice) => slice.route === this.activeRoute);
  }

  private renderNamedObject(key: SsotNamedObjectKey) {
    if (!this.manifest) {
      return nothing;
    }
    const value = this.manifest[key];
    return html`
      <article class="ssot__card">
        <div class="ssot__card-title">${key}</div>
        <div class="ssot__card-body"><pre class="ssot__code">${prettyJson(value)}</pre></div>
      </article>
    `;
  }

  private renderOverview() {
    if (!this.manifest) {
      return nothing;
    }
    return html`
      <section class="ssot__panel">
        <h3 class="ssot__panel-title">Authority model</h3>
        <div class="ssot__grid">
          <article class="ssot__card">
            <div class="ssot__card-title">Corridor</div>
            <div class="ssot__card-body">
              ${this.manifest.corridor.name}<br />Role: ${this.manifest.corridor.role}<br />
              Authoritative: ${String(this.manifest.corridor.authoritative)}
            </div>
          </article>
          <article class="ssot__card">
            <div class="ssot__card-title">Connector SSOT</div>
            <div class="ssot__card-body">
              ${this.manifest.connectorRecord.registry}<br />Record:
              ${this.manifest.connectorRecord.record}
            </div>
          </article>
          <article class="ssot__card">
            <div class="ssot__card-title">Pattern SSOT</div>
            <div class="ssot__card-body">${this.manifest.patternStack.registry}</div>
          </article>
          <article class="ssot__card">
            <div class="ssot__card-title">Governance</div>
            <div class="ssot__card-body">${this.manifest.governanceStandard.name}</div>
          </article>
          <article class="ssot__card">
            <div class="ssot__card-title">SRepo</div>
            <div class="ssot__card-body">${this.manifest.srepoBinding.name}</div>
          </article>
          <article class="ssot__card">
            <div class="ssot__card-title">Hybrid runtime</div>
            <div class="ssot__card-body">
              Bundled default: ${String(this.manifest.uiContract.hybridRuntime.bundledDefault)}<br />
              Override: ${this.manifest.uiContract.hybridRuntime.gatewayOverridePath}
            </div>
          </article>
        </div>
      </section>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div class="ssot__loading">Loading SSOT manifest…</div>`;
    }

    if (!this.manifest) {
      return html`<div class="ssot__empty">No SSOT manifest is available.</div>`;
    }

    const activeSlice = this.activeSlice ?? this.manifest.uiContract.slices[0];

    return html`
      <section class="ssot">
        <header class="ssot__hero">
          <div class="ssot__title">SSOT (read-only)</div>
          <div class="ssot__subtitle">
            Hybrid mode is active: the browser starts from a bundled corridor-safe manifest and may
            read a same-origin Gateway override if one is exposed.
          </div>
          <div class="ssot__toolbar">
            <button class="ssot__button" type="button" @click=${() => void this.refresh()}>
              Refresh manifest
            </button>
          </div>
          <ul class="ssot__pills">
            <li class="ssot__pill">Source: ${this.source}</li>
            <li class="ssot__pill">Version: ${this.manifest.meta.version}</li>
            <li class="ssot__pill">Status: ${this.manifest.meta.status}</li>
            ${this.overrideUrl ? html`<li class="ssot__pill">Override URL: ${this.overrideUrl}</li>` : nothing}
          </ul>
          <ul class="ssot__notes">
            ${this.manifest.meta.notes.map((note) => html`<li class="ssot__pill">${note}</li>`)}
          </ul>
        </header>

        <div class="ssot__layout">
          <nav class="ssot__nav" aria-label="SSOT slices">
            <h3 class="ssot__nav-title">Slices</h3>
            ${this.manifest.uiContract.slices.map(
              (slice) => html`
                <button
                  type="button"
                  class="ssot__nav-button ${slice.route === activeSlice.route ? "ssot__nav-button--active" : ""}"
                  @click=${() => this.navigate(slice)}
                >
                  <span class="ssot__nav-button-title">${slice.title}</span>
                  <span class="ssot__nav-button-copy">${slice.description}</span>
                </button>
              `,
            )}
          </nav>

          <div class="ssot__content">
            <section class="ssot__panel">
              <h3 class="ssot__panel-title">${activeSlice.title}</h3>
              <div class="ssot__subtitle">${activeSlice.description}</div>
            </section>

            ${activeSlice.id === "overview" ? this.renderOverview() : nothing}

            <section class="ssot__panel">
              <h3 class="ssot__panel-title">Relevant manifest nodes</h3>
              <div class="ssot__grid">
                ${activeSlice.namedObjects.map((key) => this.renderNamedObject(key))}
              </div>
            </section>

            <section class="ssot__panel">
              <h3 class="ssot__panel-title">Validation status</h3>
              ${this.validationMessages.length === 0
                ? html`<div class="ssot__subtitle">No validation warnings or errors.</div>`
                : html`
                    <ul class="ssot__messages">
                      ${this.validationMessages.map(
                        (entry) => html`
                          <li class="ssot__pill ssot__pill--${entry.level}">
                            ${entry.level}: ${entry.message}
                          </li>
                        `,
                      )}
                    </ul>
                  `}
              <div class="ssot__grid">
                ${this.manifest.validation.gates.map(
                  (gate) => html`
                    <article class="ssot__card">
                      <div class="ssot__card-title">${gate.id}</div>
                      <div class="ssot__card-body">${gate.name}<br />Result: ${gate.result}</div>
                    </article>
                  `,
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "openclaw-ssot-shell": OpenClawSsotShell;
  }
}
