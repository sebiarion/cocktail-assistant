import { html, render } from "lit-html";
import css from "./styles.css?inline";
import { toastInfo } from "../../lib/toast.js";

class CocktailSearch extends HTMLElement {
  static get observedAttributes() {
    return ["debounce", "minlen"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._value = "";
    this._debounceMs = 300;
    this._minLen = 2;
    this._timer = null;
    this._lastEmitted = "";
  }

  attributeChangedCallback(name, _old, val) {
    if (name === "debounce") {
      const n = Number(val);
      if (!Number.isNaN(n) && n >= 0) this._debounceMs = n;
    }
    if (name === "minlen") {
      const n = Number(val);
      if (!Number.isNaN(n) && n >= 0) this._minLen = n;
    }
  }

  connectedCallback() {
    if (this.hasAttribute("debounce"))
      this.attributeChangedCallback(
        "debounce",
        null,
        this.getAttribute("debounce"),
      );
    if (this.hasAttribute("minlen"))
      this.attributeChangedCallback(
        "minlen",
        null,
        this.getAttribute("minlen"),
      );
    this._render();
  }

  _emitSearch(q) {
    if (q === this._lastEmitted) return;
    this._lastEmitted = q;

    this.dispatchEvent(
      new CustomEvent("search-requested", {
        detail: { query: q },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onInput = (e) => {
    this._value = e.target.value;
    const q = (this._value || "").trim();

    if (q.length >= this._minLen) {
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._emitSearch(q);
      }, this._debounceMs);
    } else {
      if (this._lastEmitted !== "") {
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => this._emitSearch(""), this._debounceMs);
      }
    }
  };

  _onSubmit = (e) => {
    e.preventDefault();
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    const q = (this._value || "").trim();
    if (!q) {
      toastInfo("Please type something to search.");
      this._emitSearch("");
      return;
    }
    toastInfo("Searching…");
    this._emitSearch(q);

    requestAnimationFrame(() => {
      const list = document.querySelector("cocktail-list");
      list?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  _onClear = () => {
    this._value = "";
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this._emitSearch("");
    this._render();
    this.shadowRoot?.getElementById("q")?.focus();
  };

  _render() {
    render(
      html`
        <style>
          ${css}
        </style>

        <div class="sr-only" aria-live="polite"></div>

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
              aria-label="Search cocktails by name"
            />
            <button type="submit" aria-label="Submit search">Search</button>
          </div>
        </form>
      `,
      this.shadowRoot,
    );
  }
}

if (!customElements.get("cocktail-search")) {
  customElements.define("cocktail-search", CocktailSearch);
}
