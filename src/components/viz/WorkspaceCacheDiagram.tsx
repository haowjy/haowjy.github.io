type TimelineItem = {
  label: string
  result?: string
  tone?: 'normal' | 'duplicate' | 'ack' | 'cache' | 'evict'
}

const beforeTimeline: TimelineItem[] = [
  { label: 'Read agent.ts', result: 'appends full file copy v1' },
  { label: 'Edit agent.ts', result: 'appends full file copy v2' },
  { label: 'Read agent.ts again', result: 'appends duplicate copy v2', tone: 'duplicate' },
  { label: 'Check the file later', result: 'appends another copy v2', tone: 'duplicate' },
  { label: 'Conversation state', result: 'current file state is whichever copy is latest', tone: 'duplicate' },
]

const afterTimeline: TimelineItem[] = [
  { label: 'Read agent.ts', result: 'stores v1 in workspace working memory', tone: 'cache' },
  { label: 'Edit agent.ts', result: 'replaces cache entry with v2', tone: 'cache' },
  { label: 'Read agent.ts again', result: 'returns “already current” ack', tone: 'ack' },
  { label: 'Conversation history', result: 'keeps the event log, not every file copy' },
  { label: 'LRU eviction', result: 'records that agent.ts left working memory', tone: 'evict' },
  { label: 'Read agent.ts after eviction', result: 'real reread; cache repopulates', tone: 'cache' },
]

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="viz-workspace-cache__timeline">
      {items.map((item, index) => (
        <li className={`viz-workspace-cache__event viz-workspace-cache__event--${item.tone ?? 'normal'}`} key={`${item.label}-${index}`}>
          <span className="viz-workspace-cache__event-main">{item.label}</span>
          {item.result ? <span className="viz-workspace-cache__event-result">{item.result}</span> : null}
        </li>
      ))}
    </ol>
  )
}

export function WorkspaceCacheDiagram() {
  return (
    <figure className="viz-workspace-cache" aria-labelledby="workspace-cache-title">
      <div className="viz-workspace-cache__header">
        <p className="viz-workspace-cache__eyebrow">Conversation state</p>
        <h3 id="workspace-cache-title">Move current file state out of the fuzzy transcript and into working memory.</h3>
      </div>

      <div className="viz-workspace-cache__compare">
        <section className="viz-workspace-cache__panel viz-workspace-cache__panel--before">
          <p className="viz-workspace-cache__panel-label">Before: history stores state</p>
          <Timeline items={beforeTimeline} />
          <div className="viz-workspace-cache__result viz-workspace-cache__result--bad">
            <strong>Result</strong>
            <span>The transcript accumulates duplicate snapshots. Current state is implicit: find the latest copy.</span>
          </div>
        </section>

        <section className="viz-workspace-cache__panel viz-workspace-cache__panel--after">
          <p className="viz-workspace-cache__panel-label">After: cache stores state</p>
          <Timeline items={afterTimeline} />
          <div className="viz-workspace-cache__result viz-workspace-cache__result--good">
            <strong>Result</strong>
            <span>The cache has one authoritative current copy until eviction. After eviction, the next read is real and repopulates the cache.</span>
          </div>
        </section>
      </div>

      <figcaption className="viz-workspace-cache__caption">
        The cache acts like immediate working memory for files: small, current, and task-local. Conversation history remains useful context, but it stops being the place where every version of the same file has to live.
      </figcaption>
    </figure>
  )
}
