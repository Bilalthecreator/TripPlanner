import { ErrorState } from '../common/StatusBlocks.jsx'

export function BudgetErrorState({ message, onRetry }) {
  return (
    <ErrorState
      title="Couldn’t load budget"
      message={
        message ||
        'Something went wrong loading this trip’s expenses. Retry without leaving the page.'
      }
      onRetry={onRetry}
    />
  )
}
