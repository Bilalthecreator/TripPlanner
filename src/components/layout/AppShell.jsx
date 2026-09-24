import { Link, NavLink } from 'react-router-dom'
import logo from '../../assets/brand/logo.png'
import { cn } from '../../utils/cn.js'
import { useTheme } from '../../store/useTheme.js'
import {
  IconCurrency,
  IconMoon,
  IconPlus,
  IconSun,
} from '../common/Icons.jsx'

const NAV = [
  { to: '/', label: 'Discover', end: true },
  { to: '/trips', label: 'Trips' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/budget', label: 'Budget' },
  { to: '/saved', label: 'Saved' },
  { to: '/settings', label: 'Settings' },
]

export function AppHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-rw-divider/40 bg-rw-header shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 lg:gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src={logo} alt="" className="size-8 object-contain" />
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-semibold tracking-[-0.45px] text-rw-ink">
                RoamWise
              </span>
              <span className="hidden rounded bg-rw-surface-muted px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase sm:inline">
                Trip Planner
              </span>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full bg-rw-surface-soft p-1 md:flex"
            aria-label="Primary"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-1 text-[13px] font-semibold tracking-[0.26px] transition lg:px-4',
                    isActive
                      ? 'bg-rw-accent text-white shadow-[0_4px_6px_rgba(185,5,56,0.2)]'
                      : 'text-rw-muted hover:bg-rw-surface-muted/70',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/trips"
            className="relative inline-flex items-center gap-1 rounded-full bg-rw-accent px-3 py-1 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_8px_20px_-4px_rgba(185,5,56,0.3)] sm:px-4"
          >
            <IconPlus />
            <span className="hidden sm:inline">New Trip</span>
          </Link>

          <div className="flex items-center gap-1 rounded-full bg-rw-surface-muted px-2 py-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-1 text-rw-muted transition hover:bg-rw-surface"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted"
              aria-label="Currency USD"
            >
              <IconCurrency />
              USD $
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-rw-divider/30 px-4 py-2 md:hidden">
        <nav className="flex w-max gap-1 rounded-full bg-rw-surface-soft p-1" aria-label="Mobile">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-1 text-[12px] font-semibold tracking-[0.26px]',
                  isActive ? 'bg-rw-accent text-white' : 'text-rw-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function AppFooter() {
  return (
    <footer className="mt-auto bg-rw-footer shadow-[0_-1px_4px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs tracking-[0.12px] text-rw-muted">
          RoamWise Travel Engine
          <span className="mx-2 text-rw-dot">•</span>
          Designed for fluid travel orchestration
        </p>
        <div className="flex items-center gap-4 text-[11px] font-bold tracking-[0.55px] text-rw-muted">
          <span>Status: All Services Synced</span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-rw-teal" />
            Offline Ready
          </span>
        </div>
      </div>
    </footer>
  )
}

export function AppShell({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-rw-bg text-rw-ink">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-10 pt-[7.5rem] sm:px-6 md:pt-24">
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
