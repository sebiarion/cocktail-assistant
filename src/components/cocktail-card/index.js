import { html, render } from "lit-html";

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
          .card {
            display: grid;
            gap: 8px;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #fff;
          }
          .row {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 12px;
            align-items: start;
          }
          .thumb {
            width: 100%;
            max-width: 120px;
            height: auto;
            border-radius: 8px;
            object-fit: cover;
          }
          .title {
            font-weight: 700;
          }
          .instr {
            color: #374151;
            font-size: 14px;
            line-height: 1.35;
          }
          .actions {
            display: flex;
            gap: 8px;
          }
          .btn {
            padding: 8px 12px;
            border: 0;
            border-radius: 8px;
            background: #10b981;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }
          .btn:hover {
            filter: brightness(0.95);
          }
        </style>

        <article class="card">
          <div class="row">
            ${d?.thumb
              ? html`<img
                  class="thumb"
                  src=${d.thumb}
                  alt=${d?.name || ""}
                  loading="lazy"
                />`
              : ""}
            <div>
              <div class="title">${d?.name ?? ""}</div>
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

customElements.define("cocktail-card", CocktailCard);
