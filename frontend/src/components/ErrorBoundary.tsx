import React from 'react';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error in component tree', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm text-red-800">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
