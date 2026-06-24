"use client";

export default function IngredientList({ ingredients, onGenerate, loading }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Detected ingredients
        </h2>
        <ul className="flex flex-wrap gap-2">
          {ingredients.map((item) => (
            <li
              key={item}
              className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="
          self-start px-6 py-3 rounded-xl
          bg-emerald-600 hover:bg-emerald-700 active:scale-95
          text-white font-semibold text-sm transition-all
          disabled:opacity-50 disabled:pointer-events-none
        "
      >
        {loading ? "Generating recipes…" : "Generate recipes →"}
      </button>
    </div>
  );
}
