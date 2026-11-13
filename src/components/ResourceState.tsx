import { secondaryButtonClassName } from './ui'

export function ResourceState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading: boolean
  error: Error | null
  empty: boolean
  onRetry: () => void
}) {
  if (loading) {
    return (
      <p className="px-4 py-7 text-center text-sm text-slate-600" role="status" aria-live="polite">
        Loading data…
      </p>
    )
  }
  if (error) {
    return (
      <div className="px-4 py-7 text-center text-sm text-red-700" role="alert">
        <p className="mb-3">{error.message}</p>
        <button className={secondaryButtonClassName} type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }
  if (empty)
    return <p className="px-4 py-7 text-center text-sm text-slate-600">No data to display yet.</p>
  return null
}
