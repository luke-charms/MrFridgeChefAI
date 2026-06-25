"use client";

import { useState, useCallback } from "react";
import { analyseImage, fetchRecipes } from "./api-client";
import ErrorBoundary from "./components/ErrorBoundary";
import UploadZone from "./components/UploadZone";
import IngredientList from "./components/IngredientList";
import RecipeCard from "./components/RecipeCard";
import RecipeSkeleton from "./components/RecipeSkeleton";
import StatusMessage from "./components/StatusMessage";

function FridgeChefApp() {
  // App state
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  // Step 1 — user uploads a photo -> Send to backend /analyse endpoint
  const handleFile = useCallback(async (file) => {
    setError(null);
    setPhase("uploading");

    // Show a preview of the uploaded image while we wait for the backend
    setPreview(URL.createObjectURL(file));
    setIngredients([]);
    setRecipes([]);

    try {
      const detected = await analyseImage(file);
      setIngredients(detected);
      setPhase("ingredients");  // Show the editable list of ingredients
    } catch (err) {
      // If the backend fails, show an error message and let the user try again
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }, []);

  // Step 2 — user edits the list of ingredients and clicks "Generate" -> Send to backend /recipes endpoint
  const handleGenerate = useCallback(async (editedItems) => {
    setError(null);
    setPhase("generating");

    try {
      // Send the edited list of ingredients to the backend and get recipes
      const result = await fetchRecipes(editedItems);
      setRecipes(result);
      setPhase("results"); // Show the list of recipes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }, []);

  // Reset the app to its initial state
  const handleReset = () => {
    setPhase("idle");
    setPreview(null);
    setIngredients([]);
    setRecipes([]);
    setError(null);
  };

  // Helper variable to determine what to show in the UI based on the current phase
  const isIdle = phase === "idle";
  const showIngredients = phase === "ingredients" || phase === "generating" || phase === "results";
  const isBusy = phase === "uploading" || phase === "generating";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10">

        {/* App Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FridgeChef</h1>
            <p className="text-gray-500 text-sm mt-1">
              Photo your fridge. Get recipes instantly.
            </p>
          </div>
          {/* Only show the 'Start over' button if the user has actually started doing something */}
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

        {/* Status banners and spinners */}
        <StatusMessage phase={phase} error={error} />

        {/* Editable ingredient list */}
        {showIngredients && (
          <IngredientList
            ingredients={ingredients}
            onGenerate={handleGenerate}
            loading={phase === "generating"}
          />
        )}

        {/* Skeleton while generating, real cards when done */}
        {phase === "generating" && <RecipeSkeleton />}

        {/* Final output */}
        {phase === "results" && (
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

// The main page component wraps the app in an error boundary to catch any unexpected errors
export default function Home() {
  return (
    <ErrorBoundary>
      <FridgeChefApp />
    </ErrorBoundary>
  );
}
