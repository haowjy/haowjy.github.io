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

function toneClass(tone: Tone | undefined): string {
  if (tone === 'duplicate') return 'viz-workspace-cache__step--duplicate'
  if (tone === 'cache' || tone === 'ack') return 'viz-workspace-cache__step--cache'
  return ''
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="viz-workspace-cache__timeline">
      {items.map((item, index) => (
        <li
          key={item.label}
          className={`viz-workspace-cache__step ${toneClass(item.tone)}`}
        >
          <span className="viz-workspace-cache__step-num">{index + 1}</span>
          <div>
            <p className="viz-workspace-cache__step-label">{item.label}</p>
            <p className="viz-workspace-cache__step-result">{item.result}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function ContextSheet({
  title,
  lines,
  memory = false,
}: {
  title: string
  lines: string[]
  memory?: boolean
}) {
  return (
    <div className={`viz-workspace-cache__sheet${memory ? ' viz-workspace-cache__sheet--memory' : ''}`}>
      <p className="viz-workspace-cache__sheet-title">{title}</p>
      {lines.map((line) => (
        <code key={line} className="viz-workspace-cache__sheet-line">
          {line}
        </code>
      ))}
    </div>
  )
}

export function WorkspaceCacheDiagram() {
  return (
    <figure className="viz-workspace-cache">
      <header className="viz-workspace-cache__header">
        <p className="viz-workspace-cache__eyebrow">Working memory cache</p>
        <h3 className="viz-workspace-cache__title">
          Stop storing current files in message history.
        </h3>
      </header>

      <div className="viz-workspace-cache__grid">
        <section className="viz-workspace-cache__panel">
          <p className="viz-workspace-cache__panel-label">Before</p>
          <h4 className="viz-workspace-cache__panel-title">
            File state accumulates in the transcript
          </h4>
          <Timeline items={beforeTimeline} />
          <div className="viz-workspace-cache__context">
            <p className="viz-workspace-cache__context-label">Context sent to the model</p>
            <ContextSheet
              title="message history"
              lines={[
                'Read agent.ts (FULL FILE v1)',
                'Edit agent.ts',
                'Read again (FULL FILE v2)',
              ]}
            />
          </div>
          <p className="viz-workspace-cache__note">
            The model receives stale and duplicate snapshots mixed into message history.
          </p>
        </section>

        <section className="viz-workspace-cache__panel">
          <p className="viz-workspace-cache__panel-label">After</p>
          <h4 className="viz-workspace-cache__panel-title">
            Current files live in working memory
          </h4>
          <Timeline items={afterTimeline} />
          <div className="viz-workspace-cache__context">
            <p className="viz-workspace-cache__context-label">Context sent to the model</p>
            <div className="viz-workspace-cache__context-grid viz-workspace-cache__context-grid--split">
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
                memory
                lines={['agent.ts @ v2', 'current file contents']}
              />
            </div>
          </div>
          <p className="viz-workspace-cache__note">
            The transcript stays compact. The current file is attached separately.
          </p>
        </section>
      </div>

      <figcaption className="viz-workspace-cache__caption">
        The change is the shape of each model call: compact message history plus a
        bounded working-memory block for current files.
      </figcaption>
    </figure>
  )
}
