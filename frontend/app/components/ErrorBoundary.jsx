"use client";

import { Component } from "react";

// Error boundaries must be class components — React's error boundary API
// (componentDidCatch / getDerivedStateFromError) has no hooks equivalent.
// This is the one place in the project where a class component is correct.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: null };
  }

  static getDerivedStateFromError(error) {
    // Called during render when a child throws. Update state so the next
    // render shows the fallback UI instead of the broken tree.
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error, info) {
    // Good place to send to an error monitoring service (e.g. Sentry) in production
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, message: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col gap-4 text-center">
            <span className="text-4xl">🍳</span>
            <h2 className="text-xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500">
              FridgeChef hit an unexpected error. This is a bug — it's not
              something you did wrong.
            </p>
            {this.state.message && (
              <pre className="text-xs text-left bg-gray-50 rounded-lg p-3 text-gray-400 overflow-auto">
                {this.state.message}
              </pre>
            )}
            <button
              onClick={() => this.handleReset()}
              className="mt-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
