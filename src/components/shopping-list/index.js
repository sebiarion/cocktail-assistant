import { html, render } from "lit-html";
import { subscribe, add, remove, clear, getState } from "../../lib/store.js";
import { toastInfo } from "../../lib/toast.js";

class ShoppingList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._unsub = null;
    this._onAddIngredients = this._onAddIngredients.bind(this);
    this._state = getState();
  }

  connectedCallback() {
    this._unsub = subscribe((s) => {
      this._state = s;
      this._render();
    });

    document.addEventListener("add-ingredients", this._onAddIngredients);

    this._render();
  }

  disconnectedCallback() {
    this._unsub && this._unsub();
    document.removeEventListener("add-ingredients", this._onAddIngredients);
  }

  _onAddIngredients(e) {
    const items = e.detail?.items || [];
    if (!Array.isArray(items) || !items.length) return;
    add(items);
    toastInfo("Ingredients added.");
  }

  _onRemove = (name) => {
    remove(name);
    toastInfo("Ingredient removed.");
  };

  _onClear = () => {
    clear();
    toastInfo("Shopping list cleared.");
  };

  _render() {
    const itemsMap =
      this._state?.items instanceof Map ? this._state.items : new Map();
    const entries = Array.from(itemsMap.values());

    render(
      html`
        <style>
          .wrap {
            display: grid;
            gap: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-weight: 800;
            font-size: 16px;
          }
          .btn,
          .btn-danger {
            padding: 8px 10px;
            border: 0;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          .btn {
            background: #e5e7eb;
            color: #111827;
          }
          .btn:hover {
            filter: brightness(0.97);
          }
          .btn-danger {
            background: #ef4444;
            color: #fff;
          }
          .btn-danger:hover {
            filter: brightness(0.95);
          }

          .list {
            display: grid;
            gap: 8px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fff;
          }
          .name {
            font-weight: 700;
          }
          .measures {
            color: #374151;
            font-size: 13px;
          }
          .empty {
            color: #6b7280;
            font-size: 14px;
          }
        </style>

        <section class="wrap">
          <div class="header">
            <div class="title">Shopping list</div>
            ${entries.length
              ? html`<button class="btn-danger" @click=${this._onClear}>
                  Clear all
                </button>`
              : html``}
          </div>

          ${entries.length === 0
            ? html`<div class="empty">
                No items yet. Add ingredients from results.
              </div>`
            : html`
                <div class="list">
                  ${entries.map(
                    (it) => html`
                      <div class="item">
                        <div>
                          <div class="name">${it.name}</div>
                          ${it.measures.length
                            ? html`<div class="measures">
                                ${it.measures.join(", ")}
                              </div>`
                            : html``}
                        </div>
                        <button
                          class="btn"
                          @click=${() => this._onRemove(it.name)}
                          aria-label="Remove ${it.name}"
                        >
                          Remove
                        </button>
                      </div>
                    `,
                  )}
                </div>
              `}
        </section>
      `,
      this.shadowRoot,
    );
  }
}

if (!customElements.get("shopping-list")) {
  customElements.define("shopping-list", ShoppingList);
}
