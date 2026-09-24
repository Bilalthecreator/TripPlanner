export function ExperienceBanner({ experience }) {
  if (!experience) return null

  return (
    <section className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-rw-surface-muted p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="max-w-xl space-y-1">
        <p className="text-[11px] font-bold tracking-[0.55px] text-rw-teal uppercase">
          {experience.eyebrow}
        </p>
        <h3 className="font-display text-2xl font-semibold tracking-[-0.36px] text-rw-ink">
          {experience.title}
        </h3>
        <p className="text-sm leading-[22px] text-rw-muted">{experience.body}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {experience.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-rw-surface px-2 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-ink"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 self-start rounded-full bg-rw-accent px-6 py-1 text-[13px] font-semibold tracking-[0.26px] text-white shadow-sm sm:self-center"
      >
        {experience.cta}
      </button>
    </section>
  )
}
