import { cn } from '../../utils/cn.js'
import { PreferencesSection } from './PreferencePrimitives.jsx'
import {
  BUDGET_TIERS,
  PACING_OPTIONS,
  TRAVEL_AFFINITIES,
  TRAVELER_PRESETS,
} from '../../data/preferences.js'

export function TravelersSelector({ value, onChange }) {
  const decrement = () => onChange(Math.max(1, value - 1))
  const increment = () => onChange(Math.min(30, value + 1))

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        Default Travelers
      </p>
      <div className="inline-flex items-center gap-3 rounded-full bg-rw-input p-1 shadow-sm">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 1}
          className="size-9 rounded-full bg-rw-surface text-lg font-semibold text-rw-ink disabled:opacity-40"
          aria-label="Decrease travelers"
        >
          −
        </button>
        <span className="min-w-28 text-center text-sm font-semibold text-rw-ink">
          {value} {value === 1 ? 'Traveler' : 'Travelers'}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= 30}
          className="size-9 rounded-full bg-rw-surface text-lg font-semibold text-rw-ink disabled:opacity-40"
          aria-label="Increase travelers"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRAVELER_PRESETS.map((preset) => {
          const active = value === preset.value
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12px] font-semibold transition',
                active
                  ? 'bg-rw-accent text-white'
                  : 'bg-rw-surface-muted text-rw-muted hover:bg-rw-chip',
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TravelPreferenceSelector({ selected, onToggle }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        Activity & Exploration Affinities
      </p>
      <div className="flex flex-wrap gap-2">
        {TRAVEL_AFFINITIES.map((item) => {
          const active = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(item.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rw-accent',
                active
                  ? 'border-rw-accent bg-rw-accent text-white'
                  : 'border-rw-divider bg-rw-surface text-rw-muted hover:border-rw-accent/50 hover:text-rw-ink',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PlanningDefaultsSection({
  preferences,
  setPreference,
  toggleTravelPreference,
}) {
  return (
    <PreferencesSection
      id="planning"
      title="Trip Planning Defaults"
      description="Seed values for new trips and itinerary suggestions."
    >
      <TravelersSelector
        value={preferences.defaultTravelers}
        onChange={(defaultTravelers) =>
          setPreference('defaultTravelers', defaultTravelers)
        }
      />

      <div className="space-y-3">
        <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
          Default Itinerary Pacing
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {PACING_OPTIONS.map((option) => {
            const active = preferences.pacing === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreference('pacing', option.id)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition',
                  active
                    ? 'border-rw-accent bg-rw-accent/5 shadow-sm'
                    : 'border-rw-divider/70 hover:border-rw-accent/40',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-rw-ink">{option.label}</p>
                  {option.recommended ? (
                    <span className="rounded-full bg-rw-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] text-rw-accent uppercase">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-[12px] leading-5 text-rw-muted">
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
          Default Budgeting Tier
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {BUDGET_TIERS.map((option) => {
            const active = preferences.budgetTier === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreference('budgetTier', option.id)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition',
                  active
                    ? 'border-rw-accent bg-rw-accent/5 shadow-sm'
                    : 'border-rw-divider/70 hover:border-rw-accent/40',
                )}
              >
                <p className="font-semibold text-rw-ink">{option.label}</p>
                <p className="mt-2 text-[12px] leading-5 text-rw-muted">
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <TravelPreferenceSelector
        selected={preferences.travelPreferences}
        onToggle={toggleTravelPreference}
      />
    </PreferencesSection>
  )
}
