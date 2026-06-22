interface Props {
  phase: string;
  error: string | null;
}

export default function StatusMessage({ phase, error }: Props) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (phase === "uploading") {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Scanning your fridge…
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
