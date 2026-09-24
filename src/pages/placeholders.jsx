import { Link } from 'react-router-dom'

export function StubPage({ title }) {
  return (
    <div className="rounded-3xl bg-rw-surface p-8 text-center shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-rw-ink">{title}</h1>
      <p className="mt-2 text-sm text-rw-muted">
        Coming in a later TripPlanner milestone.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-rw-accent px-5 py-2 text-[13px] font-semibold text-white"
      >
        Back to Discover
      </Link>
    </div>
  )
}
