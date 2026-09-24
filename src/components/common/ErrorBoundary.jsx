import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl border border-rw-accent/20 bg-rw-surface p-8 text-center shadow-sm">
          <h2 className="font-display text-xl font-semibold text-rw-ink">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-rw-muted">
            {this.state.error?.message ||
              'An unexpected error occurred in this view.'}
          </p>
          <button
            type="button"
            className="mt-5 rounded-full bg-rw-accent px-5 py-2 text-[13px] font-semibold text-white"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
