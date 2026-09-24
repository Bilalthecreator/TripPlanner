import {
  PreferenceRow,
  PreferencesSection,
  ToggleSwitch,
} from './PreferencePrimitives.jsx'

const AUTOMATION_ROWS = [
  {
    key: 'walkingLegs',
    title: 'Auto-calculate walking & transit legs',
    description:
      'Estimate travel buffers between timed activities using distance heuristics.',
  },
  {
    key: 'currencyConvert',
    title: 'Auto-convert foreign currency expenses',
    description:
      'Normalize receipts into your primary currency when conversion data is available.',
  },
  {
    key: 'weatherAlerts',
    title: 'Weather alert warnings for outdoor data',
    description:
      'Surface precipitation and wind advisories on outdoor itinerary days.',
  },
  {
    key: 'offlineCache',
    title: 'Offline caching for active trip itineraries',
    description:
      'Keep day plans and maps available when connectivity drops.',
  },
]

export function AutomationSection({ automation, setAutomation }) {
  return (
    <PreferencesSection
      id="automation"
      title="Smart Automation & Sync"
      description="Control which background helpers run in your workspace."
    >
      {AUTOMATION_ROWS.map((row) => (
        <PreferenceRow
          key={row.key}
          title={row.title}
          description={row.description}
        >
          <ToggleSwitch
            label={row.title}
            checked={Boolean(automation[row.key])}
            onChange={(value) => setAutomation(row.key, value)}
          />
        </PreferenceRow>
      ))}
    </PreferencesSection>
  )
}

export function DataPrivacySection({
  storageLabel,
  onExport,
  onFlush,
}) {
  return (
    <PreferencesSection
      id="privacy"
      title="Data Storage & Export"
      description="Local-only tools for backup and cache hygiene."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-rw-divider/60 bg-rw-surface-soft/60 p-4">
          <p className="font-semibold text-rw-ink">Export Workspace Snapshot</p>
          <p className="mt-1 text-[13px] text-rw-muted">
            Download a JSON backup of trips and preferences stored in this
            browser.
          </p>
          <button
            type="button"
            onClick={onExport}
            className="mt-4 rounded-full bg-rw-surface px-4 py-2 text-[13px] font-semibold text-rw-ink shadow-sm ring-1 ring-rw-divider/70 transition hover:ring-rw-accent/40"
          >
            Download JSON Backup
          </button>
        </div>
        <div className="rounded-2xl border border-rw-accent/25 bg-rw-accent/5 p-4">
          <p className="font-semibold text-rw-ink">Flush Offline Cache</p>
          <p className="mt-1 text-[13px] text-rw-muted">
            Clear derived cache markers without deleting your saved trips.
          </p>
          <button
            type="button"
            onClick={onFlush}
            className="mt-4 rounded-full border border-rw-accent/40 px-4 py-2 text-[13px] font-semibold text-rw-accent transition hover:bg-rw-accent hover:text-white"
          >
            Flush Cache ({storageLabel})
          </button>
        </div>
      </div>
    </PreferencesSection>
  )
}
