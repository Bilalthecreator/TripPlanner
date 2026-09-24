import { cn } from '../../utils/cn.js'
import {
  PreferenceRow,
  PreferencesSection,
  ToggleSwitch,
} from './PreferencePrimitives.jsx'
import { THEME_MODES } from '../../data/preferences.js'

export function ThemeToggle({ value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        Color Palette & Mode
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {THEME_MODES.map((mode) => {
          const active = mode.id === value
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={cn(
                'rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rw-accent',
                active
                  ? 'border-rw-accent shadow-sm'
                  : 'border-rw-divider/70 hover:border-rw-accent/40',
              )}
            >
              <ThemePreview swatch={mode.id} selected={active} />
              <p className="mt-3 text-sm font-semibold text-rw-ink">
                {mode.label}
              </p>
              <p className="mt-1 text-[12px] leading-4 text-rw-muted">
                {mode.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ThemePreview({ swatch, selected }) {
  if (swatch === 'dark') {
    return (
      <div className="relative h-16 overflow-hidden rounded-xl bg-[#12141c] p-2">
        <div className="h-full rounded-lg bg-[#1a1d28] ring-1 ring-white/10" />
        {selected ? <SelectedMark /> : null}
      </div>
    )
  }
  if (swatch === 'system') {
    return (
      <div className="relative flex h-16 overflow-hidden rounded-xl">
        <div className="w-1/2 bg-[#faf8ff] p-2">
          <div className="h-full rounded-lg bg-white ring-1 ring-black/5" />
        </div>
        <div className="w-1/2 bg-[#12141c] p-2">
          <div className="h-full rounded-lg bg-[#1a1d28] ring-1 ring-white/10" />
        </div>
        {selected ? <SelectedMark /> : null}
      </div>
    )
  }
  return (
    <div className="relative h-16 overflow-hidden rounded-xl bg-[#f2f3ff] p-2">
      <div className="h-full rounded-lg bg-white ring-1 ring-black/5" />
      {selected ? <SelectedMark /> : null}
    </div>
  )
}

function SelectedMark() {
  return (
    <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-rw-accent text-[11px] font-bold text-white">
      ✓
    </span>
  )
}

export function DisplayThemeSection({ preferences, setPreference }) {
  return (
    <PreferencesSection
      id="display"
      title="Display & Appearance"
      description="Choose how RoamWise looks across Discover, Trips, and Workspace."
    >
      <ThemeToggle
        value={preferences.theme}
        onChange={(theme) => setPreference('theme', theme)}
      />
      <PreferenceRow
        title="High Contrast Accessibility"
        description="Increase edge contrast for text and controls."
      >
        <ToggleSwitch
          label="High contrast"
          checked={preferences.highContrast}
          onChange={(highContrast) =>
            setPreference('highContrast', highContrast)
          }
        />
      </PreferenceRow>
      <PreferenceRow
        title="Compact Timeline Cards"
        description="Collapse activity boards to single-line titles for faster scanning."
      >
        <ToggleSwitch
          label="Compact timeline cards"
          checked={preferences.compactTimeline}
          onChange={(compactTimeline) =>
            setPreference('compactTimeline', compactTimeline)
          }
        />
      </PreferenceRow>
    </PreferencesSection>
  )
}
