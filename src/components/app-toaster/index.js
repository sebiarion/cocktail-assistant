// src/components/app-toaster/index.js
import { html, render } from "lit-html";
import { onToast } from "../../lib/toast.js";
import css from "./styles.css?inline";

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
          ${css}
        </style>
        <div class="toaster">
          ${this._items.map(
            (t) => html`
              <div class="toast ${t.type}" role="alert">
                <span>${t.message}</span>
              </div>
            `,
          )}
        </div>
      `,
      this.shadowRoot,
    );
  }
}

customElements.define("app-toaster", AppToaster);
