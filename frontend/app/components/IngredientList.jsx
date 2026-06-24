"use client";

import { useState } from "react";

export default function IngredientList({ ingredients, onGenerate, loading }) {
  // Local copy of the ingredient list so edits don't mutate the parent's
  // state — the edited list is passed up only when the user clicks Generate.
  const [items, setItems] = useState(ingredients);
  const [inputValue, setInputValue] = useState("");

  function removeItem(indexToRemove) {
    setItems((prev) => prev.filter((_, i) => i !== indexToRemove));
  }

  function addItem() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    // Avoid exact duplicates (case-insensitive)
    const alreadyExists = items.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (!alreadyExists) {
      setItems((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  }

  function handleKeyDown(e) {
    // Allow pressing Enter to add an item without reaching for the mouse
    if (e.key === "Enter") addItem();
  }

  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Detected ingredients
          </h2>
          <span className="text-xs text-gray-400">
            Remove wrong items or add missing ones
          </span>
        </div>

        {/* Ingredient chips — each has an × button to remove it */}
        <ul className="flex flex-wrap gap-2 mb-4">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
            >
              {item}
              <button
                onClick={() => removeItem(i)}
                disabled={loading}
                aria-label={`Remove ${item}`}
                className="text-emerald-500 hover:text-emerald-800 transition-colors disabled:pointer-events-none leading-none"
              >
                ×
              </button>
            </li>
          ))}
          {isEmpty && (
            <p className="text-sm text-gray-400 italic">
              No ingredients — add some below.
            </p>
          )}
        </ul>

        {/* Add ingredient input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Add an ingredient…"
            className="
              flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-emerald-400
              disabled:opacity-50 bg-white
            "
          />
          <button
            onClick={addItem}
            disabled={loading || !inputValue.trim()}
            className="
              px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200
              text-gray-700 text-sm font-medium transition-colors
              disabled:opacity-50 disabled:pointer-events-none
            "
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={() => onGenerate(items)}
        disabled={loading || isEmpty}
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
