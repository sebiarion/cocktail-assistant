import { html, render } from "lit-html";
import { toastInfo } from "../../lib/toast.js";
import { subscribe, getState } from "../../lib/store.js";

class PrintButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._unsub = null;
    this._disabled = true;
  }

  connectedCallback() {
    this._unsub = subscribe((s) => {
      const hasItems = s?.items instanceof Map && s.items.size > 0;
      this._disabled = !hasItems;
      this._render();
    });

    const s = getState();
    this._disabled = !(s?.items instanceof Map && s.items.size > 0);
    this._render();
  }

  disconnectedCallback() {
    this._unsub && this._unsub();
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
          .wrap {
            display: flex;
            justify-content: flex-end;
          }
          button {
            padding: 10px 14px;
            border: 0;
            border-radius: 8px;
            background: #111827;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
          }
          button[disabled] {
            opacity: 0.5;
            cursor: not-allowed;
          }
        </style>
        <div class="wrap">
          <button
            ?disabled=${this._disabled}
            @click=${this._onClick}
            aria-disabled=${this._disabled}
          >
            Print shopping list
          </button>
        </div>
      `,
      this.shadowRoot,
    );
  }
}

if (!customElements.get("print-button")) {
  customElements.define("print-button", PrintButton);
}
