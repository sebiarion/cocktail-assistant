// src/lib/store.js

/** @typedef {{ name: string, measure: string }} Ingredient */

const listeners = new Set();

const state = {
  items: new Map(),
};

function notify() {
  const snapshot = getState();
  for (const cb of listeners) cb(snapshot);
}

export function getState() {
  return {
    items: new Map(state.items),
  };
}

export function subscribe(cb) {
  listeners.add(cb);
  cb(getState());
  return () => listeners.delete(cb);
}

export function add(items) {
  for (const it of items) {
    if (!it || !it.name) continue;
    const key = it.name.toLowerCase();
    const measure = (it.measure || "").trim();

    if (state.items.has(key)) {
      const entry = state.items.get(key);
      if (measure && !entry.measures.includes(measure)) {
        entry.measures.push(measure);
      }
    } else {
      state.items.set(key, {
        name: it.name,
        measures: measure ? [measure] : [],
      });
    }
  }
  notify();
}

export function remove(name) {
  if (!name) return;
  state.items.delete(name.toLowerCase());
  notify();
}

export function clear() {
  state.items.clear();
  notify();
}
