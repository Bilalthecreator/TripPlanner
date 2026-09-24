import { Link } from 'react-router-dom'
import { discoverService } from '../../services/discoverService.js'
import { IconArrowRight, IconBolt } from '../common/Icons.jsx'

export function FeaturedSpotlight() {
  const spotlight = discoverService.getSpotlight()

  return (
    <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-3xl bg-rw-surface-muted p-5 shadow-sm sm:p-6 lg:col-span-8">
      <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[rgba(185,5,56,0.1)] blur-[32px]" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-60 rounded-full bg-[rgba(0,104,95,0.1)] blur-[32px]" />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-rw-accent px-2 py-0.5 text-[11px] font-bold tracking-[0.55px] text-white uppercase">
            {spotlight.badge}
          </span>
          <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">
            • {spotlight.season}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-rw-input px-2 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-teal shadow-sm">
          <IconBolt className="text-rw-teal" />
          {spotlight.match}
        </span>
      </div>

      <div className="relative max-w-xl py-4">
        <h2 className="font-display text-[28px] font-bold leading-10 tracking-[-0.64px] text-rw-ink sm:text-[32px]">
          {spotlight.title}
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-rw-muted">{spotlight.description}</p>
      </div>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Est. Cost Range
            </p>
            <p className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
              {spotlight.costRange}
            </p>
          </div>
          <div className="hidden h-8 w-px bg-rw-divider sm:block" />
          <div>
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Ideal Window
            </p>
            <p className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
              {spotlight.idealWindow}
            </p>
          </div>
        </div>

        <Link
          to={`/destinations/${spotlight.destinationId}`}
          className="inline-flex items-center gap-1 self-start rounded-full bg-rw-accent px-4 py-1 text-[13px] font-semibold tracking-[0.26px] text-white shadow-sm transition hover:brightness-110"
        >
          {spotlight.cta}
          <IconArrowRight />
        </Link>
      </div>
    </section>
  )
}
