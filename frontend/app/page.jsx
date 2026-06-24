"use client";

import { useState, useCallback } from "react";
import { analyseImage, fetchRecipes } from "./api-client";
import UploadZone from "./components/UploadZone";
import IngredientList from "./components/IngredientList";
import RecipeCard from "./components/RecipeCard";
import StatusMessage from "./components/StatusMessage";

export default function Home() {
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  // Step 1 — user drops a photo → call /analyse
  const handleFile = useCallback(async (file) => {
    setError(null);
    setPhase("uploading");
    setPreview(URL.createObjectURL(file));
    setIngredients([]);
    setRecipes([]);

    try {
      const detected = await analyseImage(file);
      setIngredients(detected);
      setPhase("ingredients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }, []);

  // Step 2 — user clicks "Generate" → call /recipes
  const handleGenerate = useCallback(async () => {
    setError(null);
    setPhase("generating");

    try {
      const result = await fetchRecipes(ingredients);
      setRecipes(result);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }, [ingredients]);

  const handleReset = () => {
    setPhase("idle");
    setPreview(null);
    setIngredients([]);
    setRecipes([]);
    setError(null);
  };

  const isIdle = phase === "idle";
  const showIngredients = phase === "ingredients" || phase === "generating" || phase === "results";
  const showRecipes = phase === "results";
  const isBusy = phase === "uploading" || phase === "generating";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🍳 FridgeChef</h1>
            <p className="text-gray-500 text-sm mt-1">
              Photo your fridge. Get recipes instantly.
            </p>
          </div>
          {!isIdle && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-700 underline transition-colors"
            >
              Start over
            </button>
          )}
        </header>

        {/* Upload zone */}
        {(isIdle || phase === "uploading" || phase === "error") && (
          <UploadZone onFile={handleFile} disabled={isBusy} />
        )}

        {/* Fridge photo thumbnail */}
        {preview && !isIdle && (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded fridge photo"
              className="w-24 h-24 object-cover rounded-xl border border-gray-200"
            />
            <p className="text-sm text-gray-500">Your fridge</p>
          </div>
        )}

        {/* Status banners */}
        <StatusMessage phase={phase} error={error} />

        {/* Ingredient list + generate button */}
        {showIngredients && (
          <IngredientList
            ingredients={ingredients}
            onGenerate={handleGenerate}
            loading={phase === "generating"}
          />
        )}

        {/* Recipe results */}
        {showRecipes && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-800">Recipes for you</h2>
            {recipes.map((recipe, i) => (
              <RecipeCard key={recipe.title} recipe={recipe} index={i} />
            ))}
          </section>
        )}

      </div>
    </main>
  );
}
