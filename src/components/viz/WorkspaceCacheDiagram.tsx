type Tone = 'normal' | 'duplicate' | 'cache' | 'ack'

type TimelineItem = {
  label: string
  result: string
  tone?: Tone
}

const beforeTimeline: TimelineItem[] = [
  { label: 'Call 1', result: 'Read agent.ts → full file copy v1' },
  { label: 'Call 2', result: 'Edit agent.ts → full file copy v2' },
  { label: 'Call 3', result: 'Read agent.ts again → duplicate v2', tone: 'duplicate' },
]

const afterTimeline: TimelineItem[] = [
  { label: 'Call 1', result: 'Read agent.ts → store v1 in working memory', tone: 'cache' },
  { label: 'Call 2', result: 'Edit agent.ts → update working memory to v2', tone: 'cache' },
  { label: 'Call 3', result: 'Read agent.ts again → compact ack', tone: 'ack' },
]

const eventToneClass: Record<Tone, string> = {
  normal: 'border-stone-950/15 bg-[#fff7e7]/55',
  duplicate: 'border-amber-700/60 bg-amber-900/[0.06]',
  cache: 'border-teal-800/55 bg-teal-950/[0.05]',
  ack: 'border-sky-900/50 bg-sky-950/[0.05]',
}

const numberToneClass: Record<Tone, string> = {
  normal: 'border-stone-950/20 text-stone-500',
  duplicate: 'border-amber-700/55 text-amber-800',
  cache: 'border-teal-800/55 text-teal-800',
  ack: 'border-sky-900/50 text-sky-900',
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="grid gap-2">
      {items.map((item, index) => {
        const tone = item.tone ?? 'normal'

        return (
          <li
            key={item.label}
            className={[
              'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border p-3',
              eventToneClass[tone],
            ].join(' ')}
          >
            <span
              className={[
                'grid size-8 shrink-0 place-items-center rounded-full border bg-white/20 font-serif text-base font-bold leading-none',
                numberToneClass[tone],
              ].join(' ')}
            >
              {index + 1}
            </span>

            <span className="grid min-w-0 gap-1">
              <strong className="font-mono text-sm leading-tight text-stone-950 sm:text-[0.95rem]">
                {item.label}
              </strong>
              <span className="font-mono text-xs leading-relaxed text-stone-600 sm:text-sm">
                {item.result}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ContextSheet({
  title,
  lines,
  variant = 'default',
}: {
  title: string
  lines: string[]
  variant?: 'default' | 'memory'
}) {
  return (
    <div
      className={[
        'min-w-0 border p-3 shadow-[5px_5px_0_rgba(28,25,20,0.045)]',
        variant === 'memory'
          ? 'border-teal-800/40 bg-teal-950/[0.055]'
          : 'border-stone-950/15 bg-[#fffaf0]/70',
      ].join(' ')}
    >
      <p className="mb-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">
        {title}
      </p>

      <div className="grid">
        {lines.map((line, index) => (
          <code
            key={`${line}-${index}`}
            className={[
              'block min-w-0 truncate border-t border-stone-950/10 py-1 font-mono text-[0.72rem] leading-relaxed text-stone-800 sm:text-xs',
              line.includes('duplicate') || line.includes('FULL FILE v2 again')
                ? 'text-amber-800'
                : '',
              line.includes('working memory') || line.includes('current file')
                ? 'text-teal-900'
                : '',
            ].join(' ')}
            title={line}
          >
            {line}
          </code>
        ))}
      </div>
    </div>
  )
}

function BeforeContext() {
  return (
    <div className="mt-4 border-t border-stone-950/15 pt-4">
      <p className="mb-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-stone-500">
        Context sent to the model
      </p>

      <ContextSheet
        title="message history"
        lines={[
          'Read agent.ts (FULL FILE v1)',
          'Edit agent.ts',
          'Read again (FULL FILE v2)',
        ]}
      />
    </div>
  )
}

function AfterContext() {
  return (
    <div className="mt-4 border-t border-stone-950/15 pt-4">
      <p className="mb-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-stone-500">
        Context sent to the model
      </p>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <ContextSheet
          title="message history"
          lines={[
            'Read agent.ts: collapsed',
            'Edit agent.ts: compact record',
            'Read again: already available',
          ]}
        />

        <ContextSheet
          title="working memory"
          variant="memory"
          lines={['agent.ts @ v2', 'current file contents']}
        />
      </div>
    </div>
  )
}

export function WorkspaceCacheDiagram() {
  return (
    <figure className="overflow-hidden border border-stone-950/20 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(180deg,#efe9d6_0%,#e7dfc9_100%)] p-4 text-stone-950 sm:p-6 lg:p-9">
      <div className="mb-6 max-w-4xl">
        <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.28em] text-stone-500 sm:text-sm">
          Working memory cache
        </p>

        <h3 className="max-w-2xl font-serif text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl">
          Stop storing current files in message history.
        </h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="min-w-0 border border-stone-950/15 bg-[#f8f2df]/65 p-4 sm:p-5">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
            Before
          </p>

          <h4 className="mb-4 font-serif text-2xl font-bold leading-tight tracking-[-0.035em] text-stone-950 sm:text-3xl">
            File state accumulates in the transcript
          </h4>

          <Timeline items={beforeTimeline} />
          <BeforeContext />

          <p className="mt-4 border-t border-stone-950/15 pt-4 text-sm leading-relaxed text-amber-900/85 sm:text-base">
            The model receives stale and duplicate snapshots mixed into message history.
          </p>
        </section>

        <section className="min-w-0 border border-stone-950/15 bg-[#f8f2df]/65 p-4 sm:p-5">
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
            After
          </p>

          <h4 className="mb-4 font-serif text-2xl font-bold leading-tight tracking-[-0.035em] text-stone-950 sm:text-3xl">
            Current files live in working memory
          </h4>

          <Timeline items={afterTimeline} />
          <AfterContext />

          <p className="mt-4 border-t border-stone-950/15 pt-4 text-sm leading-relaxed text-teal-900/85 sm:text-base">
            The transcript stays compact. The current file is attached separately.
          </p>
        </section>
      </div>

      <figcaption className="mt-4 max-w-4xl text-sm leading-relaxed text-stone-600 sm:text-base">
        The change is the shape of each model call: compact message history plus a
        bounded working-memory block for current files.
      </figcaption>
    </figure>
  )
}