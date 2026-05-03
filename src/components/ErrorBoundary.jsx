import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Hook for Sentry / error reporting service.
    if (import.meta.env.DEV) console.error("App error:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const Fallback = this.props.fallback;
    if (Fallback) return <Fallback error={error} reset={this.reset} />;

    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-4 rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
        >
          Yeniden dene
        </button>
      </div>
    );
  }
}
