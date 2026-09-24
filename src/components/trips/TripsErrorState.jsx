import { ErrorState } from '../common/StatusBlocks.jsx'

export function TripsErrorState({ error, onRetry }) {
  return (
    <ErrorState
      title="Couldn't load your trips"
      message={
        error?.message ||
        'Something went wrong loading your trips. You can retry without leaving the page.'
      }
      onRetry={onRetry}
      className="items-center text-center"
    />
  )
}
