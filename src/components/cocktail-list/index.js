import { html, render } from "lit-html";
import { searchCocktails } from "../../lib/api.js";
import { toastInfo, toastError } from "../../lib/toast.js";

class CocktailList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._status = "idle";
    this._drinks = [];
    this._query = "";
    this._onSearch = this._onSearch.bind(this);
  }

  connectedCallback() {
    document.addEventListener("search-requested", this._onSearch);
    this._render();
  }

  disconnectedCallback() {
    document.removeEventListener("search-requested", this._onSearch);
  }

  async _onSearch(e) {
    const q = (e.detail?.query || "").trim();
    this._query = q;
    if (!q) {
      this._status = "idle";
      this._drinks = [];
      this._render();
      return;
    }

    try {
      this._status = "loading";
      this._drinks = [];
      this._render();

      toastInfo("Searching…");
      const drinks = await searchCocktails(q);

      if (!drinks.length) {
        this._status = "empty";
        this._drinks = [];
        this._render();
        toastInfo("No results found.");
        return;
      }

      this._status = "done";
      this._drinks = drinks;
      this._render();
      toastInfo("Here are the results.");
    } catch (err) {
      console.error("[cocktail-list] search error:", err);
      this._status = "error";
      this._drinks = [];
      this._render();
      toastError("Something went wrong. Please try again.");
    }
  }

  _render() {
    const status = this._status;
    const drinks = this._drinks;

    render(
      html`
        <style>
          .list {
            display: grid;
            gap: 12px;
          }
          .card {
            display: grid;
            gap: 6px;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #fff;
          }
          .title {
            font-weight: 700;
          }
          .loading,
          .empty,
          .error,
          .idle {
            color: #6b7280;
            padding: 8px 0;
          }
          .thumb {
            width: 100%;
            max-width: 120px;
            height: auto;
            border-radius: 8px;
            object-fit: cover;
          }
          .row {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 12px;
            align-items: start;
          }
          .instr {
            color: #374151;
            font-size: 14px;
            line-height: 1.35;
          }
        </style>

        ${status === "idle"
          ? html`
              <div class="idle">Type a cocktail name and press Search.</div>
            `
          : ""}
        ${status === "loading"
          ? html` <div class="loading">Loading…</div> `
          : ""}
        ${status === "empty"
          ? html`
              <div class="empty">
                No results for "<strong>${this._query}</strong>".
              </div>
            `
          : ""}
        ${status === "error"
          ? html` <div class="error">Could not load results. Try again.</div> `
          : ""}
        ${status === "done"
          ? html`
              <div class="list">
                ${drinks.map(
                  (d) => html` <cocktail-card .drink=${d}></cocktail-card> `,
                )}
              </div>
            `
          : ""}
      `,
      this.shadowRoot,
    );
  }
}

customElements.define("cocktail-list", CocktailList);
