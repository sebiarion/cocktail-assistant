import { html, render } from "lit-html";
import css from "./styles.css?inline";
import { toastInfo } from "../../lib/toast.js";
import { subscribe, getState } from "../../lib/store.js";

class PrintButton extends HTMLElement {
  static get observedAttributes() {
    return ["label", "target", "hotkey"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._unsub = null;
    this._disabled = true;
    this._label = "Print shopping list";
    this._target = null;
    this._useHotkey = false;
    this._onKeydown = this._onKeydown.bind(this);
  }

  attributeChangedCallback(name, _old, val) {
    if (name === "label" && typeof val === "string")
      this._label = val || this._label;
    if (name === "target" && typeof val === "string")
      this._target = val || null;
    if (name === "hotkey") this._useHotkey = val !== null && val !== "false";
    this._render();
  }

  connectedCallback() {
    if (this.hasAttribute("label"))
      this._label = this.getAttribute("label") || this._label;
    if (this.hasAttribute("target"))
      this._target = this.getAttribute("target") || null;
    if (this.hasAttribute("hotkey"))
      this._useHotkey = this.getAttribute("hotkey") !== "false";

    this._unsub = subscribe((s) => {
      const hasItems = s?.items instanceof Map && s.items.size > 0;
      this._disabled = !hasItems;
      this._render();
    });

    const s = getState();
    this._disabled = !(s?.items instanceof Map && s.items.size > 0);

    if (this._useHotkey) document.addEventListener("keydown", this._onKeydown);

    this._render();
  }

  disconnectedCallback() {
    this._unsub && this._unsub();
    document.removeEventListener("keydown", this._onKeydown);
  }

  _onKeydown(e) {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const combo =
      (isMac && e.metaKey && e.key.toLowerCase() === "p") ||
      (!isMac && e.ctrlKey && e.key.toLowerCase() === "p");
    if (!combo) return;

    if (!this._disabled) {
      e.preventDefault();
      this._onClick();
    }
  }

  _onClick = () => {
    if (this._disabled) {
      toastInfo("Nothing to print yet.");
      return;
    }
    toastInfo("Opening print dialog…");

    requestAnimationFrame(() => window.print());
  };

  _render() {
    render(
      html`
        <style>
          ${css}
        </style>
        <div class="wrap">
          <button
            ?disabled=${this._disabled}
            @click=${this._onClick}
            aria-disabled=${this._disabled}
            title=${this._useHotkey
              ? `${this._label} (Ctrl/Cmd+P)`
              : this._label}
          >
            ${this._label}
          </button>
          <div class="sr-only" aria-live="polite">
            ${this._disabled ? "Shopping list is empty." : "Ready to print."}
          </div>
        </div>
      `,
      this.shadowRoot,
    );
  }
}

if (!customElements.get("print-button")) {
  customElements.define("print-button", PrintButton);
}
