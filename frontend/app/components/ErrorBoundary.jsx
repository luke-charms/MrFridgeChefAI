"use client";

import { Component } from "react";

// React Error Boundaries must be class components because there is currently
// no Hook equivalent for componentDidCatch or getDerivedStateFromError.
// This component catches unhandled errors in its child component tree.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // Initialize state to track whether an error has occurred and the error message
    this.state = { hasError: false, message: null };
  }

  // This method is called when a child component throws an error
  static getDerivedStateFromError(error) {
    // Update state to indicate an error has occurred and store the error message
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  // This method is called after an error has been thrown in a child component
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  // Reset the error state to allow the user to try again
  handleReset() {
    this.setState({ hasError: false, message: null });
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI when an error has occurred
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

    // If no error has occurred, render the child components normally
    return this.props.children;
  }
}
