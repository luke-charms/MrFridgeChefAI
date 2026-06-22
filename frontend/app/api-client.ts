import { Recipe } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function analyseImage(file: File): Promise<string[]> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/analyse`, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.ingredients as string[];
}

export async function fetchRecipes(
  ingredients: string[],
  count = 3
): Promise<Recipe[]> {
  const res = await fetch(`${BASE}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, count }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.recipes as Recipe[];
}