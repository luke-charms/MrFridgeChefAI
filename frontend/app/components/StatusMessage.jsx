import { useEffect, useState } from "react";

function parseRetryDelay(errorStr) {
  // The backend forwards the Gemini API's 'retryDelay' string.
  // We use regex to extract the number so we can build a live countdown timer.
  const match = errorStr?.match(/retryDelay['"]\s*:\s*['"](\d+)s/);
  return match ? parseInt(match[1], 10) : null;
}

// Local component to handle the countdown timer state independently
function RetryCountdown({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    // Reset the countdown if the parent component re-renders with a new retry delay
    setRemaining(seconds);
    if (seconds <= 0) return;

    // Start a 1-second interval countdown timer that counts down remaining time
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0; // Stop at 0
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup the interval on unmount or when seconds change
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
  // Handle error states first, as they take precedence over other phases
  if (error) {
    const retryDelay = parseRetryDelay(error);
    // Check for rate limit errors based on known error messages
    const isRateLimit =
      error.includes("429") ||
      error.includes("RESOURCE_EXHAUSTED") ||
      error.includes("high demand") ||
      error.includes("UNAVAILABLE");

      // If we have a retry delay, show the countdown timer; otherwise, show a static message
    if (isRateLimit && retryDelay) {
      return <RetryCountdown seconds={retryDelay} />;
    }

    // If we have a rate limit error without a retry delay, show a static message
    if (isRateLimit) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Gemini is overloaded.</strong> The backend retried several
          times and still failed. Please wait 30–60 seconds and try again.
        </div>
      );
    }

    // For other errors, show the error message directly
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  // Handle the "uploading" and "generating" phases with a spinner and message
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

  // If there's no error and we're not in a special phase, render nothing
  return null;
}

// Local component for the spinner animation
function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"
      aria-hidden="true"
    />
  );
}
