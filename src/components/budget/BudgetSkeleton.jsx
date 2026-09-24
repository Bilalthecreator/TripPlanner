import {
  BudgetSummarySkeleton,
} from './BudgetSummary.jsx'
import { CategoryBreakdownSkeleton } from './CategoryBreakdown.jsx'
import { ExpenseListSkeleton } from './ExpenseList.jsx'
import { SkeletonBlock } from '../common/StatusBlocks.jsx'

export function BudgetSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading budget">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-9 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>
      <BudgetSummarySkeleton />
      <CategoryBreakdownSkeleton />
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-40" />
        <ExpenseListSkeleton />
      </div>
    </div>
  )
}
