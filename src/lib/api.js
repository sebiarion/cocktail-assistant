// src/lib/api.js
const BASE = "https://www.thecocktaildb.com/api/json/v1/1";

function normalizeDrink(d) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const name = d[`strIngredient${i}`];
    const measure = d[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: measure?.trim() || "" });
    }
  }
  return {
    id: d.idDrink,
    name: d.strDrink,
    category: d.strCategory,
    alcoholic: d.strAlcoholic,
    glass: d.strGlass,
    instructions: d.strInstructions,
    thumb: d.strDrinkThumb,
    ingredients,
  };
}

export async function searchCocktails(query) {
  const q = (query || "").trim();
  if (!q) return [];
  const url = `${BASE}/search.php?s=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const drinks = data?.drinks || [];
  return drinks.map(normalizeDrink);
}

export async function getCocktailById(id) {
  const url = `${BASE}/lookup.php?i=${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const d = data?.drinks?.[0];
  return d ? normalizeDrink(d) : null;
}
