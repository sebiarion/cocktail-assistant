import { html, render } from "lit-html";
import { subscribe, add, remove, clear, getState } from "../../lib/store.js";
import { toastInfo } from "../../lib/toast.js";
import css from "./styles.css?inline";

const LS_KEY = "cocktail-assistant:shopping-list";

class ShoppingList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._unsub = null;
    this._onAddIngredients = this._onAddIngredients.bind(this);
    this._state = getState();
  }

  connectedCallback() {
    this._rehydrateFromLocalStorage();

    this._unsub = subscribe((s) => {
      this._state = s;
      this._render();
      this._persistToLocalStorage();
    });

    document.addEventListener("add-ingredients", this._onAddIngredients);
    this._render();
  }

  disconnectedCallback() {
    this._unsub && this._unsub();
    document.removeEventListener("add-ingredients", this._onAddIngredients);
  }

  _rehydrateFromLocalStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const items = parsed.flatMap((entry) => {
        const measures = Array.isArray(entry.measures) ? entry.measures : [];
        return measures.length
          ? measures.map((m) => ({ name: entry.name, measure: m }))
          : [{ name: entry.name, measure: "" }];
      });
      if (items.length) add(items);
    } catch {}
  }

  _persistToLocalStorage() {
    try {
      const map =
        this._state?.items instanceof Map ? this._state.items : new Map();
      const arr = Array.from(map.values()).map((v) => ({
        name: v.name,
        measures: v.measures || [],
      }));
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch {}
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

    const entries = Array.from(itemsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    const total = entries.length;

    render(
      html`
        <style>
          ${css}
        </style>

        <div class="sr-only" aria-live="polite">
          ${total
            ? `You have ${total} item(s) in the shopping list.`
            : "Shopping list is empty."}
        </div>

        <section class="wrap">
          <div class="header">
            <h3 class="title">
              Shopping list
              <span class="counter">(${total})</span>
            </h3>
            ${total
              ? html`
                  <button
                    class="btn-danger"
                    @click=${this._onClear}
                    aria-label="Clear all ingredients"
                  >
                    Clear all
                  </button>
                `
              : html``}
          </div>

          ${total === 0
            ? html`
                <div class="empty">
                  No items yet. Add ingredients from results.
                </div>
              `
            : html`
                <div class="list" role="list">
                  ${entries.map(
                    (it) => html`
                      <div class="item" role="listitem">
                        <div>
                          <div class="name">${it.name}</div>
                          ${it.measures && it.measures.length
                            ? html`
                                <div class="measures">
                                  ${it.measures.join(", ")}
                                </div>
                              `
                            : html``}
                        </div>
                        <button
                          class="btn"
                          @click=${() => this._onRemove(it.name)}
                          aria-label=${`Remove ${it.name}`}
                          title=${`Remove ${it.name}`}
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
