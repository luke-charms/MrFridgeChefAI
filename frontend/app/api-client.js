// API client for the frontend to communicate with the backend server
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function analyseImage(file) {
  // Create a FormData object to send the file in a multipart/form-data request
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/analyse`, { method: "POST", body: form });

  // If the response is not OK, try to parse the error message from the response body
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.ingredients;
}

export async function fetchRecipes(ingredients, count = 3) {
  const res = await fetch(`${BASE}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Send the ingredients and count as a JSON payload in the request body
    body: JSON.stringify({ ingredients, count }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.recipes;
}
