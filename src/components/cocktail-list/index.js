import { html, render } from "lit-html";
import { searchCocktails } from "../../lib/api.js";
import { toastInfo, toastError } from "../../lib/toast.js";
import css from "./styles.css?inline";

class CocktailList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._status = "idle";
    this._drinks = [];
    this._query = "";
    this._abort = null;
    this._reqToken = 0;
    this._max = 50;
    this._onSearch = this._onSearch.bind(this);
  }

  static get observedAttributes() {
    return ["max"];
  }
  attributeChangedCallback(name, _old, val) {
    if (name === "max") {
      const n = Number(val);
      if (!Number.isNaN(n) && n > 0) this._max = n;
    }
  }

  connectedCallback() {
    document.addEventListener("search-requested", this._onSearch);
    const maybeMax = Number(this.getAttribute("max"));
    if (!Number.isNaN(maybeMax) && maybeMax > 0) this._max = maybeMax;

    this._render();
  }

  disconnectedCallback() {
    document.removeEventListener("search-requested", this._onSearch);
    if (this._abort) this._abort.abort();
  }

  async _onSearch(e) {
    const q = (e.detail?.query || "").trim();
    this._query = q;

    if (this._abort) this._abort.abort();
    this._abort = new AbortController();
    const myToken = ++this._reqToken;

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
      const drinks = await searchCocktails(q, {
        signal: this._abort.signal,
      }).catch((err) => {
        if (err?.name === "AbortError") throw err;
        throw err;
      });

      if (myToken !== this._reqToken) return;

      const list = Array.isArray(drinks) ? drinks.slice(0, this._max) : [];

      if (list.length === 0) {
        this._status = "empty";
        this._drinks = [];
        this._render();
        toastInfo("No results found.");
        return;
      }

      this._status = "done";
      this._drinks = list;
      this._render();

      requestAnimationFrame(() => {
        const first = this.shadowRoot?.querySelector("cocktail-card");
        first?.focus?.();
      });

      toastInfo("Here are the results.");
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }
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
          ${css}
        </style>

        <div class="sr-only" aria-live="polite">
          ${status === "loading" ? "Loading results…" : ""}
          ${status === "empty" ? "No results." : ""}
          ${status === "error" ? "Error." : ""}
          ${status === "done" ? "Results ready." : ""}
        </div>

        ${status === "idle"
          ? html`
              <div class="status">Type a cocktail name and press Search.</div>
            `
          : ""}
        ${status === "loading"
          ? html`
              <div class="status">Loading…</div>
              <div class="list" role="list" aria-busy="true">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
              </div>
            `
          : ""}
        ${status === "empty"
          ? html`
              <div class="status">
                No results for "<strong>${this._query}</strong>".
              </div>
            `
          : ""}
        ${status === "error"
          ? html` <div class="status">Could not load results. Try again.</div> `
          : ""}
        ${status === "done"
          ? html`
              <div class="list" role="list">
                ${drinks.map(
                  (d) => html`
                    <div role="listitem">
                      <cocktail-card .drink=${d} tabindex="0"></cocktail-card>
                    </div>
                  `,
                )}
              </div>
            `
          : ""}
      `,
      this.shadowRoot,
    );
  }
}

if (!customElements.get("cocktail-list")) {
  customElements.define("cocktail-list", CocktailList);
}
