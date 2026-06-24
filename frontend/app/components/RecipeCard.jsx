export default function RecipeCard({ recipe, index }) {
  const totalMinutes = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
            {recipe.cuisine}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-0.5">
            {recipe.title}
          </h3>
        </div>
        <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
          {index + 1}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>⏱ {totalMinutes} min total</span>
        <span>🍽 Serves {recipe.servings}</span>
      </div>

      {/* Ingredients used */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          From your fridge
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients_used.map((ing) => (
            <span
              key={ing}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Method</h4>
        <ol className="flex flex-col gap-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-600">
              <span className="shrink-0 font-semibold text-emerald-600 w-5">
                {i + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Tip */}
      {recipe.tip && (
        <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          💡 {recipe.tip}
        </p>
      )}
    </article>
  );
}
