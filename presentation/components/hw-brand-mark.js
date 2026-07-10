/**
 * <hw-brand-mark> — an owned component (presentation/components/).
 *
 * Demonstrates the assets/ layer boundary: the DAM holds the *media* and the
 * inert `asset-pack.json` binding key → path. This component is the *code*
 * that renders it. The asset pack never says how to render; this file never
 * hardcodes a media path.
 *
 * Owned (this domain authors it) — distinct from presentation/vendor/
 * (consumed, pre-built) and node_modules/runsnative (consumed design system).
 */

const PACK_URL = "/assets/asset-pack.json";

export class HwBrandMark extends HTMLElement {
  static observedAttributes = ["asset-key", "size"];

  async connectedCallback() {
    const key = this.getAttribute("asset-key") ?? "brand.mark";
    const size = this.getAttribute("size") ?? "48";

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>:host{display:inline-block;line-height:0}img{display:block}</style>`;

    let src;
    try {
      const pack = await fetch(PACK_URL).then((r) => r.json());
      src = pack.assets?.[key];
    } catch {
      src = undefined;
    }

    if (!src) {
      // Absent binding is not an error — the layer is optional material.
      root.innerHTML += `<span hidden data-missing-asset="${key}"></span>`;
      return;
    }

    const img = document.createElement("img");
    img.src = new URL(src, `${location.origin}/assets/`).pathname;
    img.width = Number(size);
    img.height = Number(size);
    img.alt = "";
    root.append(img);
  }
}

customElements.define("hw-brand-mark", HwBrandMark);
export default HwBrandMark;
