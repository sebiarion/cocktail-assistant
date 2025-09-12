import { html, render } from "lit-html";
import { toastInfo } from "../../lib/toast.js";

class CocktailSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._value = "";
  }

  connectedCallback() {
    this._render();
  }

  _onInput = (e) => {
    this._value = e.target.value;
  };

  _onSubmit = (e) => {
    e.preventDefault();
    const q = (this._value || "").trim();
    if (!q) {
      toastInfo("Please type something to search.");
      return;
    }
    toastInfo("Searching…");

    this.dispatchEvent(
      new CustomEvent("search-requested", {
        detail: { query: q },
        bubbles: true,
        composed: true,
      }),
    );
  };

  _render() {
    render(
      html`
        <style>
          .search {
            display: grid;
            gap: 8px;
          }
          .row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
          }
          label {
            font-weight: 600;
          }
          input[type="search"] {
            padding: 10px 12px;
            border: 1px solid #d0d7de;
            border-radius: 8px;
            font-size: 14px;
          }
          button[type="submit"] {
            padding: 10px 14px;
            border: 0;
            border-radius: 8px;
            background: #2c7be5;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }
          button[type="submit"]:hover {
            filter: brightness(0.95);
          }
        </style>

        <form class="search" @submit=${this._onSubmit}>
          <label for="q">Search cocktails</label>
          <div class="row">
            <input
              id="q"
              name="q"
              type="search"
              placeholder="e.g., margarita"
              .value=${this._value}
              @input=${this._onInput}
              autocomplete="off"
            />
            <button type="submit">Search</button>
          </div>
        </form>
      `,
      this.shadowRoot,
    );
  }
}

customElements.define("cocktail-search", CocktailSearch);
