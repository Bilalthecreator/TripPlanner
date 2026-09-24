import { useEffect, useState } from 'react'
import { usePreferences } from '../store/usePreferences.js'
import { SETTINGS_NAV } from '../data/preferences.js'
import { SettingsSidebar } from '../components/settings/SettingsSidebar.jsx'
import { RegionalUnitsSection } from '../components/settings/RegionalUnitsSection.jsx'
import { DisplayThemeSection } from '../components/settings/DisplayThemeSection.jsx'
import { PlanningDefaultsSection } from '../components/settings/PlanningDefaultsSection.jsx'
import {
  AutomationSection,
  DataPrivacySection,
} from '../components/settings/AutomationDataSection.jsx'

function formatSavedAgo(savedAt) {
  const seconds = Math.max(0, Math.round((Date.now() - savedAt) / 1000))
  if (seconds < 15) return 'Saved just now'
  if (seconds < 60) return `Saved ${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `Saved ${minutes}m ago`
  return 'Saved earlier'
}

export function SettingsPage() {
  const {
    preferences,
    setPreference,
    setAutomation,
    toggleTravelPreference,
    resetDefaults,
    savedAt,
    storageBytes,
  } = usePreferences()

  const [activeSection, setActiveSection] = useState('regional')
  const [tick, setTick] = useState(0)
  const [flash, setFlash] = useState('')

  const storageUsedMb = storageBytes / (1024 * 1024)

  useEffect(() => {
    if (!flash) return undefined
    const timer = setTimeout(() => setFlash(''), 2200)
    return () => clearTimeout(timer)
  }, [flash])

  // Refresh relative "Saved Xm ago" label periodically while page is open.
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  const savedLabel = formatSavedAgo(savedAt + tick * 0)

  const scrollToSection = (id) => {
    setActiveSection(id)
    const node = document.getElementById(id)
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSave = () => {
    // Preferences already persist live; Save confirms the current snapshot.
    setTick((n) => n + 1)
    setFlash('Preferences saved')
  }

  const handleReset = () => {
    if (
      !window.confirm(
        'Reset all preferences to RoamWise defaults? This cannot be undone.',
      )
    ) {
      return
    }
    resetDefaults()
    setFlash('Defaults restored')
  }

  const handleExport = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        preferences,
        trips: JSON.parse(localStorage.getItem('roamwise.trips') || '[]'),
        savedPlaces: JSON.parse(
          localStorage.getItem('roamwise.savedPlaces') || '[]',
        ),
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `roamwise-backup-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setFlash('Backup downloaded')
    } catch {
      setFlash('Export failed')
    }
  }

  const handleFlush = () => {
    try {
      localStorage.removeItem('roamwise.offlineCache')
      setFlash('Offline cache flushed')
    } catch {
      setFlash('Could not flush cache')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            Preferences / Workspace Config
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.45px] text-rw-ink">
            Settings & Preferences
          </h1>
          <p className="max-w-2xl text-sm leading-[22px] text-rw-muted">
            Customize localization, format defaults, display themes, and smart
            calculation helpers for your personal RoamWise workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-rw-muted">
            <span className="size-2 rounded-full bg-rw-teal" />
            {savedLabel}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-rw-divider bg-rw-surface px-4 py-2 text-[13px] font-semibold text-rw-ink transition hover:bg-rw-surface-soft"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-rw-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_-4px_rgba(185,5,56,0.3)] transition hover:brightness-110"
          >
            Save Changes
          </button>
        </div>
      </header>

      {flash ? (
        <div
          role="status"
          className="rounded-2xl border border-rw-teal/30 bg-rw-teal/10 px-4 py-2 text-sm font-semibold text-rw-teal"
        >
          {flash}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <SettingsSidebar
          activeId={activeSection}
          onSelect={scrollToSection}
          storageUsedMb={storageUsedMb}
        />

        <div className="flex flex-col gap-5">
          <RegionalUnitsSection
            preferences={preferences}
            setPreference={setPreference}
          />
          <DisplayThemeSection
            preferences={preferences}
            setPreference={setPreference}
          />
          <PlanningDefaultsSection
            preferences={preferences}
            setPreference={setPreference}
            toggleTravelPreference={toggleTravelPreference}
          />
          <AutomationSection
            automation={preferences.automation}
            setAutomation={setAutomation}
          />
          <DataPrivacySection
            storageLabel={`${storageUsedMb.toFixed(1)} MB`}
            onExport={handleExport}
            onFlush={handleFlush}
          />

          <p className="text-center text-[12px] text-rw-faint lg:hidden">
            {SETTINGS_NAV.map((item) => item.label).join(' · ')}
          </p>
        </div>
      </div>
    </div>
  )
}
