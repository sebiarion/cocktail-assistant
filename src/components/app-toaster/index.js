// src/components/app-toaster/index.js
import { html, render } from "lit-html";
import { onToast } from "../../lib/toast.js";

class AppToaster extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._items = [];
    this._off = null;
  }

  connectedCallback() {
    this._off = onToast(({ type, message }) => {
      const id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        String(Date.now() + Math.random());

      this._items = [...this._items, { id, type, message }];
      this._render();

      setTimeout(() => {
        this._items = this._items.filter((t) => t.id !== id);
        this._render();
      }, 3000);
    });

    this._render();
  }

  disconnectedCallback() {
    this._off && this._off();
  }

  _render() {
    render(
      html`
        <style>
          .toaster {
            position: fixed;
            right: 16px;
            bottom: 16px;
            display: grid;
            gap: 8px;
            z-index: 9999;
          }
          .toast {
            min-width: 220px;
            max-width: 360px;
            padding: 10px 12px;
            border-radius: 8px;
            background: #222;
            color: #fff;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
            opacity: 0.95;
          }
          .toast.info {
            background: #2c7be5;
          }
          .toast.error {
            background: #e55353;
          }
        </style>
        <div class="toaster">
          ${this._items.map(
            (t) =>
              html` <div class="toast ${t.type}">
                <span>${t.message}</span>
              </div>`,
          )}
        </div>
      `,
      this.shadowRoot,
    );
  }
}

customElements.define("app-toaster", AppToaster);
