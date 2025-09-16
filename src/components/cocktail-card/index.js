import { html, render } from "lit-html";
import css from "./styles.css?inline";

class CocktailCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._drink = null;
  }

  connectedCallback() {
    this._render();
  }

  set drink(v) {
    this._drink = v;
    this._render();
  }
  get drink() {
    return this._drink;
  }

  _add = () => {
    if (!this._drink) return;
    this.dispatchEvent(
      new CustomEvent("add-ingredients", {
        detail: {
          items: this._drink.ingredients,
          from: { id: this._drink.id, name: this._drink.name },
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  _render() {
    const d = this._drink;
    render(
      html`
        <style>
          ${css}
        </style>
        <article class="card">
          <div class="row">
            ${d?.thumb
              ? html`
                  <img
                    class="thumb"
                    src=${d.thumb}
                    alt=${d?.name || ""}
                    loading="lazy"
                  />
                `
              : ""}
            <div>
              <h3 class="title">${d?.name ?? ""}</h3>
              ${d?.instructions
                ? html`<p class="instr">${d.instructions}</p>`
                : ""}
            </div>
          </div>
          <div class="actions">
            <button
              class="btn"
              @click=${this._add}
              aria-label="Add ingredients"
            >
              + Add ingredients
            </button>
          </div>
        </article>
      `,
      this.shadowRoot,
    );
  }
}

if (!customElements.get("cocktail-card")) {
  customElements.define("cocktail-card", CocktailCard);
}
