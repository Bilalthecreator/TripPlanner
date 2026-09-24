import { discoverService } from '../../services/discoverService.js'
import { IconGroup, IconTrain, IconWallet } from '../common/Icons.jsx'

const ICONS = {
  currency: IconWallet,
  rail: IconTrain,
  sync: IconGroup,
}

const TONES = {
  accent: 'bg-[rgba(185,5,56,0.1)] text-rw-accent',
  teal: 'bg-[rgba(0,104,95,0.1)] text-rw-teal',
  warm: 'bg-rw-warm text-[#6b4f3a] dark:text-[#e7ded3]',
}

export function DiscoveryTips() {
  const tips = discoverService.getTips()

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {tips.map((tip) => {
        const Icon = ICONS[tip.id] ?? IconWallet
        return (
          <article
            key={tip.id}
            className="flex gap-4 rounded-2xl bg-rw-surface p-5 shadow-sm sm:p-6"
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${TONES[tip.tone]}`}
            >
              <Icon />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-[-0.08px] text-rw-ink">
                {tip.title}
              </h3>
              <p className="mt-0.5 text-xs leading-[18px] tracking-[0.12px] text-rw-muted">
                {tip.body}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
