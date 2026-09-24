import { cn } from '../../utils/cn.js'
import {
  PreferenceRow,
  PreferencesSection,
  SegmentedControl,
} from './PreferencePrimitives.jsx'
import {
  CURRENCIES,
  DISTANCE_UNITS,
  TEMPERATURE_UNITS,
  WEEK_STARTS,
} from '../../data/preferences.js'

export function CurrencySelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        Primary Currency
      </p>
      <SegmentedControl
        options={CURRENCIES}
        value={value}
        onChange={onChange}
      />
      <p className="text-[12px] text-rw-muted">
        Used across trip budgets and header displays. Conversion rates are not
        applied in this frontend stage.
      </p>
    </div>
  )
}

export function TemperatureSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        Temperature Metric
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TEMPERATURE_UNITS.map((option) => {
          const active = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
                active
                  ? 'border-rw-accent bg-rw-accent text-white'
                  : 'border-rw-divider/70 bg-rw-input text-rw-ink hover:border-rw-accent/40',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RegionalUnitsSection({ preferences, setPreference }) {
  return (
    <PreferencesSection
      id="regional"
      title="Regional & Units"
      description="Localization defaults for money, weather, distance, and calendars."
    >
      <CurrencySelector
        value={preferences.currency}
        onChange={(currency) => setPreference('currency', currency)}
      />
      <TemperatureSelector
        value={preferences.temperatureUnit}
        onChange={(temperatureUnit) =>
          setPreference('temperatureUnit', temperatureUnit)
        }
      />
      <div className="space-y-2">
        <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
          Distance & Speed
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DISTANCE_UNITS.map((option) => {
            const active = option.id === preferences.distanceUnit
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreference('distanceUnit', option.id)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
                  active
                    ? 'border-rw-accent bg-rw-accent text-white'
                    : 'border-rw-divider/70 bg-rw-input text-rw-ink hover:border-rw-accent/40',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
      <PreferenceRow title="Calendar first day of week">
        <div className="flex gap-2">
          {WEEK_STARTS.map((option) => {
            const active = option.id === preferences.weekStartsOn
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreference('weekStartsOn', option.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-[13px] font-semibold transition',
                  active
                    ? 'bg-rw-accent text-white'
                    : 'bg-rw-surface-muted text-rw-muted hover:bg-rw-chip',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </PreferenceRow>
    </PreferencesSection>
  )
}
