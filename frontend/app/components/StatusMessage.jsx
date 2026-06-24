import { useEffect, useState } from "react";

function parseRetryDelay(errorStr) {
  // Gemini embeds a retryDelay like '54s' in the 429 body.
  // Extract it so we can show an accurate countdown rather than
  // a vague "please wait" message.
  const match = errorStr?.match(/retryDelay['"]\s*:\s*['"](\d+)s/);
  return match ? parseInt(match[1], 10) : null;
}

function RetryCountdown({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    // Reset if a new delay comes in (e.g. user retried and got another 429)
    setRemaining(seconds);
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <strong>Gemini is busy.</strong>{" "}
      {remaining > 0 ? (
        <>Retrying in <strong>{remaining}s</strong>…</>
      ) : (
        <>Retrying now…</>
      )}
    </div>
  );
}

export default function StatusMessage({ phase, error }) {
  if (error) {
    const retryDelay = parseRetryDelay(error);
    const isRateLimit =
      error.includes("429") ||
      error.includes("RESOURCE_EXHAUSTED") ||
      error.includes("high demand") ||
      error.includes("UNAVAILABLE");

    // If the backend exhausted all retries and is giving up, show a countdown
    // only if Gemini told us how long to wait — otherwise show a static message
    if (isRateLimit && retryDelay) {
      return <RetryCountdown seconds={retryDelay} />;
    }

    if (isRateLimit) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Gemini is overloaded.</strong> The backend retried several
          times and still failed. Please wait 30–60 seconds and try again.
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (phase === "uploading") {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Spinner />
        Scanning your fridge…
      </div>
    );
  }

  if (phase === "generating") {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Spinner />
        Generating recipes…
      </div>
    );
  }

  return null;
}

// Inline spinner — no extra dependency needed, pure CSS animation via Tailwind
function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"
      aria-hidden="true"
    />
  );
}
