// A single shimmer card that mirrors the shape of a real RecipeCard.
// Using a fixed structure (not mapping over data) means the skeleton
// layout is stable and won't shift when real content arrives.
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      {/* Cuisine label + title */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-2/3 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
      </div>

      {/* Meta row */}
      <div className="flex gap-4">
        <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Ingredient chips */}
      <div className="flex gap-2 flex-wrap">
        {[60, 80, 50, 70].map((w, i) => (
          <div
            key={i}
            style={{ width: `${w}px` }}
            className="h-5 bg-gray-200 rounded-md animate-pulse"
          />
        ))}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2">
        {[100, 90, 95, 85, 80].map((pct, i) => (
          <div
            key={i}
            style={{ width: `${pct}%` }}
            className="h-3 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// Renders 3 skeleton cards — matching the default recipe count
export default function RecipeSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="h-7 w-36 bg-gray-200 rounded-full animate-pulse" />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </section>
  );
}
