import "./components/app-toaster/index.js";
import "./components/cocktail-search/index.js";
import "./components/cocktail-list/index.js";
import "./components/cocktail-card/index.js";
import "./components/shopping-list/index.js";
import "./components/print-button/index.js";

import { toastInfo } from "./lib/toast.js";
import "./lib/api.js";
import "./lib/store.js";

document.body.innerHTML = `
  <main class="app">
    <section class="search-area">
      <cocktail-search></cocktail-search>
      <cocktail-list></cocktail-list>
    </section>
    <aside class="shopping-area">
      <shopping-list></shopping-list>
      <print-button></print-button>
    </aside>
    <app-toaster></app-toaster>
  </main>
`;

customElements.whenDefined("app-toaster").then(() => {
  requestAnimationFrame(() => {
    toastInfo("App ready");
    window.toastInfo = toastInfo;
  });
});
