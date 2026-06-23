interface Props {
  phase: string;
  error: string | null;
}

export default function StatusMessage({ phase, error }: Props) {
  if (error) {
    const isOverloaded =
      error.includes("503") || error.includes("high demand") || error.includes("UNAVAILABLE");

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {isOverloaded ? (
          <>
            <strong>Gemini is overloaded right now.</strong> The backend retried
            3 times and still failed. Please wait 10–15 seconds and try again.
          </>
        ) : (
          error
        )}
      </div>
    );
  }

  if (phase === "uploading") {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Scanning your fridge… (may take a few seconds)
      </div>
    );
  }

  if (phase === "generating") {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Generating recipes…
      </div>
    );
  }

  return null;
}
