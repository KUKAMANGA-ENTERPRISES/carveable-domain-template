var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@runsnative/components/shared/run-element.js
var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
var cqSupported = typeof CSS !== "undefined" && CSS.supports && CSS.supports("container-type", "inline-size");
var viewTransitionCounter = 0;
var initializedClasses = /* @__PURE__ */ new WeakSet();
function toAttributeName(propName, config) {
  if (config.attribute) return config.attribute;
  return propName.replace(/([A-Z])/g, "-$1").toLowerCase();
}
function setupProperties(ElementClass) {
  if (initializedClasses.has(ElementClass)) return;
  const props = ElementClass.properties || {};
  const attrToProperty = /* @__PURE__ */ new Map();
  for (const [name, config] of Object.entries(props)) {
    const existing = Object.getOwnPropertyDescriptor(ElementClass.prototype, name);
    if (existing && (existing.get || existing.set)) continue;
    const attrName = toAttributeName(name, config);
    attrToProperty.set(attrName, { name, config });
    Object.defineProperty(ElementClass.prototype, name, {
      get() {
        return this._properties[name];
      },
      set(value) {
        const oldValue = this._properties[name];
        if (config.type === Boolean) {
          value = Boolean(value);
        } else if (config.type === Number) {
          value = Number(value);
        } else if (config.type === String) {
          value = value == null ? "" : String(value);
        }
        if (oldValue === value) return;
        this._properties[name] = value;
        this._changedProperties.set(name, oldValue);
        if (config.reflect && this._initialized) {
          this._reflectingProperty = true;
          if (config.type === Boolean) {
            if (value) {
              this.setAttribute(attrName, "");
            } else {
              this.removeAttribute(attrName);
            }
          } else if (value != null) {
            this.setAttribute(attrName, String(value));
          }
          this._reflectingProperty = false;
        }
        if (this._initialized) {
          this.requestUpdate();
        }
      },
      enumerable: true,
      configurable: true
    });
  }
  ElementClass._attrToProperty = attrToProperty;
  initializedClasses.add(ElementClass);
}
var RunElement = class extends HTMLElement {
  // Expose for test mocking
  static _reducedMotionQuery = reducedMotionQuery;
  static get observedAttributes() {
    setupProperties(this);
    const props = this.properties || {};
    const attrs = [];
    for (const [name, config] of Object.entries(props)) {
      if (config.reflect !== false) {
        attrs.push(toAttributeName(name, config));
      }
    }
    return attrs;
  }
  static get properties() {
    return {};
  }
  // Bound handler for reduced motion changes (per-instance for cleanup)
  #reducedMotionHandler = null;
  // Managed event listeners for cleanup
  #managedListeners = [];
  constructor() {
    super();
    setupProperties(this.constructor);
    this._initialized = false;
    this._properties = {};
    this._changedProperties = /* @__PURE__ */ new Map();
    this._reflectingProperty = false;
    this._updatePending = false;
    this._firstUpdate = true;
    this._updatePromise = null;
    this._updateResolve = null;
    const props = this.constructor.properties || {};
    for (const [name, config] of Object.entries(props)) {
      const defaultValue = typeof config.default === "function" ? config.default() : config.default;
      this._properties[name] = defaultValue !== void 0 ? defaultValue : this._getTypeDefault(config.type);
    }
    this.#reducedMotionHandler = (e) => this.#onReducedMotionChange(e);
  }
  _getTypeDefault(type) {
    if (type === Boolean) return false;
    if (type === Number) return 0;
    if (type === String) return "";
    if (type === Array) return [];
    if (type === Object) return {};
    return void 0;
  }
  /**
   * Read-only property reflecting user's reduced motion preference.
   * @returns {boolean} true if user prefers reduced motion
   */
  get reducedMotion() {
    return this.constructor._reducedMotionQuery.matches;
  }
  set reducedMotion(_value) {
    throw new Error("reducedMotion is read-only");
  }
  #onReducedMotionChange(e) {
    this.#syncReducedMotionAttribute(e.matches);
  }
  #syncReducedMotionAttribute(matches) {
    if (matches) {
      this.setAttribute("data-reduced-motion", "");
    } else {
      this.removeAttribute("data-reduced-motion");
    }
  }
  connectedCallback() {
    if (!this._initialized) {
      this._initializeShadowDOM();
      this._initialized = true;
      const props = this.constructor.properties || {};
      for (const name of Object.keys(props)) {
        this._changedProperties.set(name, void 0);
      }
    }
    this.#syncReducedMotionAttribute(this.constructor._reducedMotionQuery.matches);
    this.constructor._reducedMotionQuery.addEventListener("change", this.#reducedMotionHandler);
    if (cqSupported) {
      this.setAttribute("cq-supported", "");
    }
    if (!this.style.viewTransitionName) {
      this.style.viewTransitionName = `${this.localName}-${++viewTransitionCounter}`;
    }
    if (!this.style.getPropertyValue("--_instance-seed")) {
      this.style.setProperty("--_instance-seed", String(Math.random()));
    }
    this.requestUpdate();
  }
  disconnectedCallback() {
    if (this._activeCplusSkin) {
      try {
        this._activeCplusSkin.module.deactivate?.(this);
      } catch (err) {
        console.error(`[${this.localName}] error during skin deactivate:`, err);
      }
      this._activeCplusSkin = null;
    }
    this.constructor._reducedMotionQuery.removeEventListener("change", this.#reducedMotionHandler);
    for (const { target, type, handler, options } of this.#managedListeners) {
      target.removeEventListener(type, handler, options);
    }
    this.#managedListeners = [];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._reflectingProperty) return;
    const attrMap = this.constructor._attrToProperty;
    if (!attrMap) return;
    const propInfo = attrMap.get(name);
    if (!propInfo) return;
    const { name: propName, config } = propInfo;
    let value;
    if (config.type === Boolean) {
      value = newValue !== null;
    } else if (config.type === Number) {
      value = newValue === null ? config.default : Number(newValue);
    } else {
      value = newValue === null ? config.default : newValue;
    }
    this._properties[propName] = value;
    this._changedProperties.set(propName, oldValue);
    if (this._initialized) {
      this.requestUpdate();
    }
  }
  _initializeShadowDOM() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }
  /**
   * Request an update. Updates are batched and processed asynchronously.
   */
  requestUpdate() {
    if (this._updatePending) return this.updateComplete;
    this._updatePending = true;
    this._updatePromise = new Promise((resolve) => {
      this._updateResolve = resolve;
    });
    queueMicrotask(() => this._performUpdate());
    return this._updatePromise;
  }
  _performUpdate() {
    if (!this._updatePending) return;
    const changedProperties = new Map(this._changedProperties);
    this._changedProperties.clear();
    this._updatePending = false;
    const resolve = this._updateResolve;
    try {
      this.willUpdate(changedProperties);
      this._render();
      this.updated(changedProperties);
      if (this._firstUpdate) {
        this._firstUpdate = false;
        this.firstUpdated(changedProperties);
      }
    } catch (err) {
      console.error(`[${this.localName}] error during update lifecycle:`, err);
    } finally {
      if (resolve) {
        resolve(true);
      }
    }
  }
  _render() {
    if (!this.shadowRoot) return;
    const content = this.render();
    if (typeof content === "string") {
      const styles2 = this.constructor.styles;
      const styleTag = styles2 ? `<style data-run-styles>${styles2}</style>` : "";
      this.shadowRoot.innerHTML = styleTag + content;
    }
  }
  /**
   * Override to return component template
   */
  render() {
    return "";
  }
  /**
   * Called before render when properties change.
   * @param {Map<string, any>} _changedProperties - Map of property names to old values
   */
  willUpdate(_changedProperties) {
  }
  /**
   * Called after render when properties change.
   * @param {Map<string, any>} _changedProperties - Map of property names to old values
   */
  updated(_changedProperties) {
  }
  /**
   * Called once after first render.
   * @param {Map<string, any>} _changedProperties - Map of property names to old values
   */
  firstUpdated(_changedProperties) {
  }
  // ==========================================================================
  // C+ RENDERING TIER DISPATCH (cplus-rendering-tier-contract-addendum-v1 §3)
  // ==========================================================================
  /**
   * Apply a resolved skin by its rendering tier. Shared mechanism only — the
   * component still owns skin resolution and passes the resolved module here.
   *
   * `css` tier (or any skin without `meta`) invokes `cssApply` verbatim, so the
   * existing CSS path is behaviourally unchanged. `canvas-2d`/`webgl` tier runs
   * the skin's `render`→`activate` once (the rAF loop owns subsequent visuals)
   * and is an idempotent no-op on later update cycles.
   *
   * @param {object}   opts
   * @param {object}   opts.skinModule  resolved skin module ({styles, render, activate?, deactivate?, meta?})
   * @param {CSSStyleSheet} [opts.styleSheet]  sheet to adopt for the C+ first-apply
   * @param {() => void} [opts.cssApply]  the component's original CSS apply lines
   */
  _applySkinTier({ skinModule, styleSheet, cssApply }) {
    const tier = skinModule?.meta?.renderingTier ?? "css";
    if (tier === "css") {
      if (this._activeCplusSkin) {
        try {
          this._activeCplusSkin.module.deactivate?.(this);
        } catch (err) {
          console.error(`[${this.localName}] error during skin deactivate:`, err);
        }
        this._activeCplusSkin = null;
      }
      cssApply?.();
      return;
    }
    if (this._activeCplusSkin?.module === skinModule) return;
    if (styleSheet) this.shadowRoot.adoptedStyleSheets = [styleSheet];
    skinModule.render(this);
    const canvas = this.shadowRoot.querySelector("canvas");
    if (!canvas) {
      throw new Error(
        `[${this.localName}] ${tier} skin render() produced no <canvas>`
      );
    }
    skinModule.activate?.(this, canvas);
    this._activeCplusSkin = { module: skinModule };
    const tokens = skinModule.meta?.tokens ?? [];
    if (tokens.length && typeof skinModule.tokenDidChange === "function") {
      throw new Error(
        `[${this.localName}] token-consuming C+ skins require the style-observer mechanism (RUN-298, addendum \xA78) \u2014 not implemented by the RUN-380 substrate`
      );
    }
  }
  /**
   * Promise that resolves after the next render completes.
   */
  get updateComplete() {
    return this._updatePromise || Promise.resolve(true);
  }
  /**
   * Alias for requestUpdate(). Engine-built components call requestRender();
   * this ensures compatibility without patching in showcase HTML files.
   */
  requestRender() {
    return this.requestUpdate();
  }
  // ==========================================================================
  // INSPECTOR / X-RAY
  // ==========================================================================
  /**
   * Build a property manifest from the component's declared properties.
   * Supports two patterns:
   *   1. Declarative: static get properties() { return { name: { type, default, reflect } } }
   *   2. Manual: static get observedAttributes() + public getters (rebuilt components)
   * @returns {Array<{name: string, type: string, value: any, reflect: boolean}>}
   */
  _buildPropertyManifest() {
    const props = this.constructor.properties || {};
    const entries = Object.entries(props);
    if (entries.length > 0) {
      return entries.map(([name, config]) => ({
        name,
        type: config.type?.name ?? "String",
        default: config.default,
        value: this[name],
        reflect: config.reflect !== false
      }));
    }
    const attrs = this.constructor.observedAttributes;
    if (!attrs || attrs.length === 0) return [];
    return attrs.map((attr) => {
      const prop = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = this[prop];
      const type = value === void 0 ? "String" : typeof value === "boolean" ? "Boolean" : typeof value === "number" ? "Number" : "String";
      return { name: prop, type, value, reflect: true };
    });
  }
  /**
   * Return a full inspection manifest for this component instance.
   * Consumed by X-Ray mode and the showcase playground.
   * @returns {object}
   */
  getInspectorManifest() {
    return {
      tagName: this.localName,
      componentName: this.constructor.componentName ?? this.localName,
      version: this.constructor.version ?? "0.0.0",
      category: this.constructor.category ?? "unknown",
      layer: this.constructor.layer ?? "atomic",
      properties: this._buildPropertyManifest(),
      parts: this.constructor.parts ?? [],
      slots: this.constructor.slots ?? [],
      skin: this._resolvedSkinName ?? "default",
      events: this.constructor.events ?? []
    };
  }
  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================
  /**
   * Escape HTML entities to prevent XSS.
   * @param {any} str - String to escape (non-strings are converted)
   * @returns {string} Escaped string safe for innerHTML
   */
  safeHTML(str) {
    const text = String(str);
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // ==========================================================================
  // EVENT HELPERS
  // ==========================================================================
  /**
   * Emit a custom event from this element.
   * @param {string} name - Event name
   * @param {any} detail - Event detail payload
   * @param {CustomEventInit} options - Additional event options
   * @returns {boolean} - Whether the event was not cancelled
   */
  emit(name, detail, options = {}) {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: false,
      ...options,
      detail
    });
    return this.dispatchEvent(event);
  }
  /**
   * Add an event listener that will be automatically cleaned up on disconnect.
   * @param {EventTarget} target - Target to listen on
   * @param {string} type - Event type
   * @param {EventListener} handler - Event handler
   * @param {AddEventListenerOptions} options - Listener options
   */
  listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.#managedListeners.push({ target, type, handler, options });
  }
};

// node_modules/@runsnative/components/shared/skin-resolution-mixin.js
var SKIN_BRAND = /* @__PURE__ */ Symbol("runSkinResolved");
var _classState = /* @__PURE__ */ new WeakMap();
function stateFor(cls) {
  let s = _classState.get(cls);
  if (!s) {
    s = {
      mods: /* @__PURE__ */ new Map(),
      // skinName -> normalized module | null (negative)
      skinSheets: /* @__PURE__ */ new Map(),
      // skinName -> CSSStyleSheet
      baseSheet: void 0
      // CSSStyleSheet | null (resolved lazily)
    };
    _classState.set(cls, s);
  }
  return s;
}
function normalizeSkinModule(mod) {
  if (!mod) return null;
  const candidate = typeof mod.render === "function" ? mod : mod.default ? mod.default : mod;
  if (!candidate) return null;
  if (typeof candidate.styles !== "string") return null;
  if (typeof candidate.render !== "function") return null;
  return candidate;
}
function baseSheetFor(cls) {
  const s = stateFor(cls);
  if (s.baseSheet !== void 0) return s.baseSheet;
  const css = cls.styles;
  if (typeof css === "string" && css.length > 0) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    s.baseSheet = sheet;
  } else {
    s.baseSheet = null;
  }
  return s.baseSheet;
}
function skinSheetFor(cls, skinName, skinModule) {
  const s = stateFor(cls);
  let sheet = s.skinSheets.get(skinName);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(skinModule.styles || "");
    s.skinSheets.set(skinName, sheet);
  }
  return sheet;
}
function skinResolutionMixin(BaseClass) {
  class SkinResolved extends BaseClass {
    /**
     * Default skin module — set by the component. Always statically imported
     * so it is bundled and resolvable with zero async (no blank flash).
     * @type {object}
     */
    static defaultSkin = null;
    /**
     * Lazy registry: `{ [skinName]: () => Promise<module> }`. The default skin
     * is NOT listed here (it is `static defaultSkin`). Asset-heavy skins must
     * route through `loadSkinModule()` from skin-loader.js to preserve the
     * Vite pre-bundling workaround.
     * @type {Object.<string, () => Promise<any>>}
     */
    static skinLoaders = {};
    get [SKIN_BRAND]() {
      return true;
    }
    /**
     * Resolve the active skin name via the four-level cascade. First match
     * wins. Crosses shadow-DOM boundaries via getRootNode().host so a
     * component nested inside another component's shadow tree still sees skin
     * context set outside that boundary.
     *
     * 1 (highest) instance `skin` property/attribute
     * 2           nearest ancestor `data-run-skin` (composed tree)
     * 3           document.documentElement `data-run-skin`
     * 4 (lowest)  "default"
     */
    _resolveSkinName() {
      const own = typeof this.skin === "string" && this.skin || this.getAttribute("skin");
      if (own) return own;
      let node = this;
      while (node) {
        let parent = node.parentElement;
        if (!parent) {
          const root2 = node.getRootNode && node.getRootNode();
          if (root2 && root2.host) {
            node = root2.host;
            continue;
          }
          break;
        }
        while (parent) {
          const ctx = parent.getAttribute && parent.getAttribute("data-run-skin");
          if (ctx) return ctx;
          parent = parent.parentElement;
        }
        const root = node.getRootNode && node.getRootNode();
        node = root && root.host ? root.host : null;
      }
      const docCtx = typeof document !== "undefined" && document.documentElement && document.documentElement.getAttribute("data-run-skin");
      if (docCtx) return docCtx;
      return "default";
    }
    /**
     * Load (and cache, per class) a skin module. Returns the normalized
     * module, or null for unknown / failed / malformed skins. Failures are
     * negatively cached so the render fallback never re-imports or loops.
     */
    static async loadSkin(skinName) {
      if (!skinName || skinName === "default") {
        return normalizeSkinModule(this.defaultSkin);
      }
      const s = stateFor(this);
      if (s.mods.has(skinName)) return s.mods.get(skinName);
      const loader = this.skinLoaders && this.skinLoaders[skinName];
      if (typeof loader !== "function") {
        console.warn(
          `[skin-resolution] no loader registered for skin "${skinName}" on <${this.componentTag || (this.name || "component")}>; using default`
        );
        s.mods.set(skinName, null);
        return null;
      }
      try {
        const normalized = normalizeSkinModule(await loader());
        if (!normalized) {
          console.error(
            `[skin-resolution] skin module "${skinName}" is malformed (missing string \`styles\` or function \`render\`); using default`
          );
          s.mods.set(skinName, null);
          return null;
        }
        s.mods.set(skinName, normalized);
        return normalized;
      } catch (err) {
        console.error(
          `[skin-resolution] failed to load skin "${skinName}"; using default`,
          err
        );
        s.mods.set(skinName, null);
        return null;
      }
    }
    /** Per-component preload convenience (eliminates the default→skin flash). */
    static preloadSkin(skinName) {
      return this.loadSkin(skinName);
    }
    /** Force this instance to re-resolve and re-render its skin. */
    refreshSkin() {
      return this.requestUpdate();
    }
    /**
     * Mixin _render override (Skin Resolution Contract §"Mixin's _render
     * Override"): skip the headless `<style>` injection, resolve the skin,
     * manage adoptedStyleSheets, delegate DOM to the skin module. Runs once
     * per update cycle (before `updated()`), so a component's post-skin DOM
     * work in `updated()` still observes the freshly rendered skin DOM.
     */
    _render() {
      if (!this.shadowRoot) return;
      const cls = this.constructor;
      const resolved = this._resolveSkinName();
      let skinModule;
      let appliedName;
      if (resolved === "default") {
        skinModule = normalizeSkinModule(cls.defaultSkin);
        appliedName = "default";
      } else {
        const state = stateFor(cls);
        if (state.mods.has(resolved)) {
          const cached = state.mods.get(resolved);
          if (cached) {
            skinModule = cached;
            appliedName = resolved;
          } else {
            skinModule = normalizeSkinModule(cls.defaultSkin);
            appliedName = "default";
          }
        } else {
          cls.loadSkin(resolved).then((mod) => {
            if (mod && this.isConnected) this.requestUpdate();
          });
          skinModule = normalizeSkinModule(cls.defaultSkin);
          appliedName = "default";
        }
      }
      if (!skinModule) {
        console.error(
          `[skin-resolution] <${this.localName}> has no valid default skin; nothing rendered. Set \`static defaultSkin\`.`
        );
        this._resolvedSkinName = "default";
        return;
      }
      const baseSheet = baseSheetFor(cls);
      const skinSheet = skinSheetFor(cls, appliedName, skinModule);
      this.shadowRoot.adoptedStyleSheets = baseSheet ? [baseSheet, skinSheet] : [skinSheet];
      this._resolvedSkinName = appliedName;
      this._resolvedSkinModule = skinModule;
      skinModule.render(this);
    }
    /** The resolved skin module (incl. optional `manifest`/`transforms`). */
    getResolvedSkinModule() {
      return this._resolvedSkinModule || null;
    }
  }
  return SkinResolved;
}

// node_modules/@runsnative/components/components/button/skins/button.default.js
var button_default_exports = {};
__export(button_default_exports, {
  render: () => render,
  styles: () => styles
});

// node_modules/@runsnative/components/shared/skin-module.js
var RENDERING_TIERS = ["css", "canvas-2d", "webgl"];
function defineSkin({
  styles: styles2,
  render: render2,
  activate,
  deactivate,
  tokenDidChange,
  meta
} = {}) {
  if (typeof styles2 !== "string") {
    throw new TypeError(
      'defineSkin: "styles" must be a CSS string'
    );
  }
  if (typeof render2 !== "function") {
    throw new TypeError(
      'defineSkin: "render" must be a function(host)'
    );
  }
  for (const [name, fn] of [
    ["activate", activate],
    ["deactivate", deactivate],
    ["tokenDidChange", tokenDidChange]
  ]) {
    if (fn !== void 0 && typeof fn !== "function") {
      throw new TypeError(
        `defineSkin: "${name}" must be a function when provided`
      );
    }
  }
  if (meta !== void 0) {
    if (typeof meta !== "object" || meta === null) {
      throw new TypeError('defineSkin: "meta" must be an object when provided');
    }
    if (!RENDERING_TIERS.includes(meta.renderingTier)) {
      throw new TypeError(
        `defineSkin: "meta.renderingTier" must be one of ${RENDERING_TIERS.join(", ")}`
      );
    }
    if (meta.tokens !== void 0 && !Array.isArray(meta.tokens)) {
      throw new TypeError('defineSkin: "meta.tokens" must be an array when provided');
    }
  }
  const skin2 = { styles: styles2, render: render2 };
  if (activate !== void 0) skin2.activate = activate;
  if (deactivate !== void 0) skin2.deactivate = deactivate;
  if (tokenDidChange !== void 0) skin2.tokenDidChange = tokenDidChange;
  if (meta !== void 0) {
    skin2.meta = Object.freeze({
      renderingTier: meta.renderingTier,
      tokens: Object.freeze([...meta.tokens ?? []])
    });
  }
  return Object.freeze(skin2);
}

// node_modules/@runsnative/components/components/button/skins/button.default.js
var _styles = `
  *, *::before, *::after { box-sizing: border-box; }

  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  [part="base"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--run-button-gap, var(--run-space-gap-sm, 6px));
    height: var(--run-button-height, var(--run-size-interactive-height-md, 38px));
    min-width: var(--run-button-min-width, var(--run-size-interactive-min-width, 0));
    padding: var(--run-button-padding-y, var(--run-space-inset-sm, 6px))
             var(--run-button-padding-x, var(--run-space-inset-md, 14px));
    font-family: inherit;
    font-size: var(--run-button-font-size, var(--run-font-size-body-md, 14px));
    font-weight: var(--run-button-font-weight, var(--run-font-weight-medium, 500));
    line-height: 1;
    white-space: nowrap;
    border-radius: var(--run-button-border-radius, var(--run-radius-interactive-md, 6px));
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
    outline: none;
    text-decoration: none;
    position: relative;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    width: 100%;
  }

  /* \u2500\u2500 Focus ring \u2500\u2500 */
  [part="base"]:focus-visible {
    box-shadow:
      0 0 0 2px var(--run-color-surface-default, #fff),
      0 0 0 4px var(--run-button-focus-ring-color, var(--run-color-border-focus, #2563eb));
  }

  /* \u2500\u2500 Variants \u2500\u2500 */
  [part="base"][data-variant="primary"] {
    background: var(--run-button-background, var(--run-color-surface-action-primary, #2563eb));
    color: var(--run-button-color, var(--run-color-text-on-action-primary, #fff));
    border-color: var(--run-button-border-color, var(--run-color-border-action-primary, transparent));
  }
  [part="base"][data-variant="primary"]:hover:not([data-disabled]):not([data-loading]) {
    background: var(--run-button-background-hover, var(--run-color-surface-action-primary-hover, #1d4ed8));
  }
  [part="base"][data-variant="primary"]:active:not([data-disabled]):not([data-loading]) {
    background: var(--run-button-background-active, var(--run-color-surface-action-primary-active, #1e40af));
  }

  [part="base"][data-variant="secondary"] {
    background: var(--run-color-surface-action-secondary, #e2e8f0);
    color: var(--run-color-text-action-secondary, #334155);
    border-color: transparent;
  }
  [part="base"][data-variant="secondary"]:hover:not([data-disabled]):not([data-loading]) {
    background: var(--run-color-surface-action-secondary-hover, #cbd5e1);
  }
  [part="base"][data-variant="secondary"]:active:not([data-disabled]):not([data-loading]) {
    background: var(--run-color-surface-action-secondary-active, #94a3b8);
  }

  [part="base"][data-variant="ghost"] {
    background: transparent;
    color: var(--run-color-text-action-ghost, #334155);
    border-color: transparent;
  }
  [part="base"][data-variant="ghost"]:hover:not([data-disabled]):not([data-loading]) {
    background: var(--run-color-surface-action-ghost-hover, rgba(0,0,0,0.06));
  }
  [part="base"][data-variant="ghost"]:active:not([data-disabled]):not([data-loading]) {
    background: var(--run-color-surface-action-ghost-active, rgba(0,0,0,0.10));
  }

  [part="base"][data-variant="danger"] {
    background: var(--run-color-surface-action-danger, #dc2626);
    color: var(--run-color-text-on-action-danger, #fff);
    border-color: transparent;
  }
  [part="base"][data-variant="danger"]:hover:not([data-disabled]):not([data-loading]) {
    background: var(--run-color-surface-action-danger-hover, #b91c1c);
  }
  [part="base"][data-variant="danger"]:active:not([data-disabled]):not([data-loading]) {
    background: var(--run-color-surface-action-danger-active, #991b1b);
  }

  /* \u2500\u2500 Sizes \u2500\u2500 */
  [part="base"][data-size="sm"] {
    height: var(--run-size-interactive-height-sm, 32px);
    font-size: var(--run-font-size-body-sm, 13px);
    padding-inline: 10px;
  }
  [part="base"][data-size="lg"] {
    height: var(--run-size-interactive-height-lg, 46px);
    font-size: var(--run-font-size-body-lg, 16px);
    padding-inline: 20px;
  }

  /* \u2500\u2500 Disabled \u2500\u2500 */
  [part="base"][data-disabled] {
    opacity: var(--run-button-disabled-opacity, var(--run-color-state-disabled-opacity, 0.4));
    cursor: not-allowed;
    pointer-events: none;
  }

  /* \u2500\u2500 Loading \u2500\u2500 */
  [part="base"][data-loading] {
    cursor: wait;
  }
  [part="base"][data-loading] [part="label"] {
    visibility: hidden;
  }
  [part="base"][data-loading] [part="icon-start"],
  [part="base"][data-loading] [part="icon-end"] {
    visibility: hidden;
  }

  /* \u2500\u2500 Loader spinner \u2500\u2500 */
  [part="loader"] {
    display: none;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
  }
  [part="base"][data-loading] [part="loader"] {
    display: flex;
  }
  [part="loader"]::after {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: run-button-spin 0.6s linear infinite;
  }
  @keyframes run-button-spin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    [part="base"] { transition: none; }
    [part="loader"]::after { animation: none; border-top-color: currentColor; opacity: 0.5; }
  }

  /* \u2500\u2500 Position-aware boundary (compound composition) \u2500\u2500 */
  :host([data-position="end"]) [part="base"] {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  /* \u2500\u2500 Composed mode: surrender all boundary to parent (Boundary Ownership Contract v1.0) \u2500\u2500 */
  /* Parent sets data-ys-composed on claimed children. Child stops consuming boundary tokens. */
  /* Focus ring (box-shadow on :focus-visible) is NOT boundary \u2014 it stays. */
  :host([data-ys-composed]) [part="base"] {
    border-radius: 0;
    border-color: transparent;
  }

  /* \u2500\u2500 Slots \u2500\u2500 */
  [part="icon-start"],
  [part="icon-end"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1em;
    height: 1em;
    font-size: 1.1em;
  }
  [part="label"] {
    flex: 1 1 auto;
  }
`;
function _render(host) {
  const variant = host.variant || "primary";
  const size = host.size || "medium";
  const disabled = host.disabled ? "data-disabled" : "";
  const loading = host.loading ? "data-loading" : "";
  host.shadowRoot.innerHTML = `
    <button
      part="base"
      data-variant="${variant}"
      data-size="${size}"
      ${disabled}
      ${loading}
      type="${host.type || "button"}"
    >
      <span part="icon-start"><slot name="icon-start"></slot></span>
      <span part="label"><slot></slot></span>
      <span part="icon-end"><slot name="icon-end"></slot></span>
      <span part="loader" aria-hidden="true"></span>
    </button>
  `;
}
var skin = defineSkin({ styles: _styles, render: _render });
var { styles, render } = skin;

// node_modules/@runsnative/components/components/button/run-button.js
var RunButton = class extends skinResolutionMixin(RunElement) {
  static defaultSkin = button_default_exports;
  static skinLoaders = {};
  // 1. Private field declarations
  #disabled = false;
  #loading = false;
  #formDisabled = false;
  #type = "button";
  #name = null;
  #value = "";
  #variant = "primary";
  #size = "md";
  #skin = null;
  _internals = null;
  #handleClick = (event) => {
    if (this.#disabled || this.#loading || this.#formDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.#activate(event);
  };
  #handleKeydown = (event) => {
    if (this.#disabled || this.#loading || this.#formDisabled) return;
    if (event.key === "Enter") {
      event.preventDefault();
      this.#activate(event);
    } else if (event.key === " ") {
      event.preventDefault();
    }
  };
  #handleKeyup = (event) => {
    if (this.#disabled || this.#loading || this.#formDisabled) return;
    if (event.key === " ") {
      this.#activate(event);
    }
  };
  // 2. Static class fields
  static formAssociated = true;
  static componentName = "Button";
  static version = "1.0.0";
  static category = "form";
  static layer = "atomic";
  static parts = ["base", "label", "loader", "icon-start", "icon-end"];
  static slots = [
    { name: "", description: "Button label text" },
    { name: "icon-start", description: "Leading icon" },
    { name: "icon-end", description: "Trailing icon" }
  ];
  static events = [
    { name: "run-click", description: "Fired when button is activated via pointer or keyboard" }
  ];
  // 3. observedAttributes
  static get observedAttributes() {
    return ["disabled", "loading", "type", "name", "value", "variant", "size", "skin", "aria-label", "aria-labelledby"];
  }
  // 4. constructor
  constructor() {
    super();
    this._internals = this.attachInternals();
  }
  // 5. Override shadow DOM creation to enable delegatesFocus
  _initializeShadowDOM() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open", delegatesFocus: true });
    }
  }
  // 6. connectedCallback
  connectedCallback() {
    super.connectedCallback?.();
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
    this.addEventListener("keyup", this.#handleKeyup);
  }
  // 7. disconnectedCallback
  disconnectedCallback() {
    super.disconnectedCallback?.();
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
    this.removeEventListener("keyup", this.#handleKeyup);
  }
  // 8. attributeChangedCallback
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case "disabled":
        this.disabled = newValue !== null;
        break;
      case "loading":
        this.loading = newValue !== null;
        break;
      case "type":
        this.type = newValue;
        break;
      case "name":
        this.name = newValue;
        break;
      case "value":
        this.value = newValue;
        break;
      case "variant":
        this.variant = newValue;
        break;
      case "size":
        this.size = newValue;
        break;
      case "skin":
        this.skin = newValue;
        break;
      case "aria-label":
      case "aria-labelledby":
        this.requestUpdate();
        break;
    }
  }
  // 9. Form lifecycle callbacks
  formResetCallback() {
    this.disabled = false;
    this.loading = false;
    this.value = "";
  }
  formDisabledCallback(disabled) {
    this.#formDisabled = Boolean(disabled);
    this.requestUpdate();
  }
  // 10. firstUpdated — called once after first render
  firstUpdated(changedProperties) {
    super.firstUpdated?.(changedProperties);
    this._internals.setValidity({});
  }
  // 11. Public property accessors
  get disabled() {
    return this.#disabled;
  }
  set disabled(value) {
    const coerced = Boolean(value);
    if (this.#disabled === coerced) return;
    this.#disabled = coerced;
    this.toggleAttribute("disabled", coerced);
    this.requestUpdate();
  }
  get loading() {
    return this.#loading;
  }
  set loading(value) {
    const coerced = Boolean(value);
    if (this.#loading === coerced) return;
    this.#loading = coerced;
    this.toggleAttribute("loading", coerced);
    this.requestUpdate();
  }
  get type() {
    return this.#type;
  }
  set type(value) {
    const allowed = ["button", "submit", "reset"];
    const str = value == null ? "" : String(value).trim();
    const coerced = allowed.includes(str) ? str : "button";
    if (this.#type === coerced) return;
    this.#type = coerced;
    this.setAttribute("type", coerced);
    this.requestUpdate();
  }
  get name() {
    return this.#name;
  }
  set name(value) {
    const trimmed = value == null ? "" : String(value).trim();
    const coerced = trimmed || null;
    if (this.#name === coerced) return;
    this.#name = coerced;
    if (coerced) {
      this.setAttribute("name", coerced);
    } else {
      this.removeAttribute("name");
    }
    this.#syncFormValue();
    this.requestUpdate();
  }
  get value() {
    return this.#value;
  }
  set value(value) {
    const coerced = value == null ? "" : String(value);
    if (this.#value === coerced) return;
    this.#value = coerced;
    if (coerced) {
      this.setAttribute("value", coerced);
    } else {
      this.removeAttribute("value");
    }
    this.#syncFormValue();
    this.requestUpdate();
  }
  get variant() {
    return this.#variant;
  }
  set variant(value) {
    const allowed = ["primary", "secondary", "ghost", "danger"];
    const str = value == null ? "" : String(value).trim();
    const coerced = allowed.includes(str) ? str : "primary";
    if (this.#variant === coerced) return;
    this.#variant = coerced;
    this.setAttribute("variant", coerced);
    this.requestUpdate();
  }
  get size() {
    return this.#size;
  }
  set size(value) {
    const allowed = ["sm", "md", "lg"];
    const str = value == null ? "" : String(value).trim();
    const coerced = allowed.includes(str) ? str : "md";
    if (this.#size === coerced) return;
    this.#size = coerced;
    this.setAttribute("size", coerced);
    this.requestUpdate();
  }
  get skin() {
    return this.#skin;
  }
  set skin(value) {
    const trimmed = value == null ? "" : String(value).trim();
    const coerced = trimmed || null;
    if (this.#skin === coerced) return;
    this.#skin = coerced;
    if (coerced) {
      this.setAttribute("skin", coerced);
    } else {
      this.removeAttribute("skin");
    }
    this.requestUpdate();
  }
  get ariaLabel() {
    return this.getAttribute("aria-label");
  }
  get ariaLabelledby() {
    return this.getAttribute("aria-labelledby");
  }
  // 12. Skin rendering
  updated(changedProperties) {
    super.updated?.(changedProperties);
    const base = this.shadowRoot.querySelector('[part="base"]');
    if (base) {
      const effectivelyDisabled = this.#disabled || this.#formDisabled;
      if (effectivelyDisabled) {
        base.setAttribute("aria-disabled", "true");
      } else {
        base.removeAttribute("aria-disabled");
      }
      if (this.#loading) {
        base.setAttribute("aria-busy", "true");
      } else {
        base.removeAttribute("aria-busy");
      }
      const hostAriaLabel = this.getAttribute("aria-label");
      const hostAriaLabelledby = this.getAttribute("aria-labelledby");
      if (hostAriaLabel) {
        base.setAttribute("aria-label", hostAriaLabel);
        base.removeAttribute("aria-labelledby");
      } else if (hostAriaLabelledby) {
        base.setAttribute("aria-labelledby", hostAriaLabelledby);
        base.removeAttribute("aria-label");
      } else {
        const labelText = this.textContent?.trim();
        if (labelText) base.setAttribute("aria-label", labelText);
        else base.removeAttribute("aria-label");
        base.removeAttribute("aria-labelledby");
      }
    }
    const states = this._internals?.states;
    if (states) {
      const effectivelyDisabled = this.#disabled || this.#formDisabled;
      if (effectivelyDisabled) states.add("--disabled");
      else states.delete("--disabled");
      if (this.#loading) states.add("--loading");
      else states.delete("--loading");
    }
    this.renderBoundary();
  }
  // 12b. Extension API (Component Extension API Contract v1.0)
  /**
   * Returns the boundary element for this component.
   * Called by updated() after the skin renders. Override in subclasses to
   * apply full-skin composed-mode boundary rendering that CSS alone cannot express.
   *
   * Composition context available inside an override:
   *   this.hasAttribute('data-ys-composed') — true when parent claims this boundary
   *   this.getAttribute('data-position')    — 'start' | 'end' | null
   *
   * Note: for run-button the boundary element is the <button> itself ([part="base"]),
   * not a separate wrapper. CSS handles composed-mode suppression via data-ys-composed.
   *
   * @returns {HTMLElement | null}
   */
  renderBoundary() {
    return this.shadowRoot?.querySelector('[part="base"]') ?? null;
  }
  // 13. Private methods
  #syncFormValue() {
    if (this.#name) {
      this._internals.setFormValue(this.#value);
    } else {
      this._internals.setFormValue(null);
    }
  }
  #emitClick(originalEvent) {
    return this.dispatchEvent(new CustomEvent("run-click", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { originalEvent }
    }));
  }
  #activate(originalEvent) {
    const notCancelled = this.#emitClick(originalEvent);
    if (!notCancelled) return;
    if (this.#type === "submit" && this._internals.form) {
      this._internals.form.requestSubmit();
    } else if (this.#type === "reset" && this._internals.form) {
      this._internals.form.reset();
    }
  }
};
customElements.define("run-button", RunButton);
var BUTTON_TYPES = Object.freeze(["button", "submit", "reset"]);
var BUTTON_VARIANTS = Object.freeze(["primary", "secondary", "ghost", "danger"]);
var BUTTON_SIZES = Object.freeze(["sm", "md", "lg"]);
export {
  BUTTON_SIZES,
  BUTTON_TYPES,
  BUTTON_VARIANTS
};
