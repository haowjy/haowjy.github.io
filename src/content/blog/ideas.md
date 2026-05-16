# Blog Ideas

> This is an idea inventory/backlog, not a published post.

## 1. How Claude Code, Codex, and OpenCode Actually Work — A Harness Developer's Guide

**Angle:** Three tools that look the same to users (type a prompt, get code) have radically different internals. Walk through each architecture, capability gaps, and what it means for anyone building tooling on top.

**Core material:**
- `ConnectionCapabilities` dataclass in `src/meridian/lib/harness/connections/base.py:46-60`
- Per-harness capability flags:
  - Claude: `claude_ws.py:74-79` — `mid_turn_injection="queue"`, `supports_steer=False`, `structured_reasoning=True`, no primary observer
  - Codex: `codex_ws.py:208-216` — `mid_turn_injection="interrupt_restart"`, `supports_steer=True`, `supports_primary_observer=True`, `supports_runtime_hitl=True`
  - OpenCode: `opencode_http.py:66-72` — `mid_turn_injection="http_post"`, `supports_steer=False`, `supports_primary_observer=True`, no runtime HITL
- Internal harness launch and control matrix (design doc)
- Internal no-PTY decision log

**Sessions:** Internal transcripts from observability, side-channel API research, and injection timing probes.

**Work items:**
- `terminal-resize-corruption-investigation`
- `no-pty-sidechannel-control-plane`

---

## 2. What LLMs Get Wrong About Writing — And What Countermeasures Actually Work

**Angle:** Not "how to prompt better" but a descriptive catalog of LLM writing pathologies discovered through real system-building. Each default behavior causes real damage; each countermeasure has a scar behind it.

**Default LLM writing pulls** (from `llm-writing` skill):
- Fluent filler that fills structural expectations without anchoring to purpose
- Stating conclusions without evidence — summarizing with labels
- Conversational mode leaking into documents ("Let's break this down" — the reader wasn't in the conversation)
- Defining things by what they aren't — correcting a misconception nobody has
- Same structure for every document — smoothing over genuine uncertainty
- Encoding corrections as absolute prohibitions
- Fractal summaries recapping a conversation that didn't happen

**Specific countermeasures discovered:**
- "Caveman style" changelog convention — terse, fragment-friendly, filler-free
- Positive framing beats negatives: "Tell the model what TO do" (negatives keep prohibited behavior in attention)
- "Every word carries decision weight — if removing it doesn't change behavior, cut it"
- "Write for the reader. They have no context from the conversation"
- "Do not add additional code explanation summary unless requested" — the explanation instinct
- "IMPORTANT: You should NOT answer with unnecessary preamble or postamble"

**The helpfulness trap** (from `intent-modeling`):
- LLMs default to "what feels helpful" rather than "what was asked for"
- Elaborating when brevity was wanted, summarizing when depth was wanted, smoothing when rough edges were intentional
- "Serving intent means doing what they need, which might be more or less than what feels helpful"

**Core material:**
- `llm-writing` skill — LLM writing pathologies
- `prompt-principles` skill — 4 levels of prompt design
- `intent-modeling` skill — helpfulness trap
- Tone/style conventions in the primary system prompt
- `CHANGELOG.md` — caveman style in practice

---

## 3. Cognitive Lanes: A Model for Designing AI Agent Teams

**Angle:** Don't think of agents as workers who do tasks. Think of them as cognitive lanes — each with a specific way of thinking, a specific model, clear boundaries, and defined outputs. The orchestrator routes work to the right lane; it doesn't tell agents how to think.

**The lanes** (from `meridian mars list`):

| Lane | Thinking mode | Right model | Mode | Output |
|---|---|---|---|---|
| Reading (explorer) | Fast, high-throughput scanning | `gpt-5.4-mini` | Read-only | Findings |
| Creating (coder) | Functional implementation | `codex` | Writes code | Changed files |
| Judging (reviewer) | Adversarial evaluation | `gpt-5.4` | Read-only | Findings w/ severity |
| Diagnosing (investigator) | Root cause + narrowing | `gpt-5.4` | Reports | Diagnosis + next step |
| Designing (design-lead) | Structural tradeoffs | `claude-opus-4-6` | Writes design | Design package |
| Probing (smoke-tester) | Runtime verification | `gpt-5.4` | Runs probes | Test results |
| Capturing (kb-writer) | Knowledge preservation | `sonnet` | Writes docs | KB entries |
| Orchestrating (product-lead) | Intent + routing | `claude-opus-4-6` | Spawns agents | Coordination |

**Core principles this maps to:**
- "Route by cognitive mode" — decompose by thinking type, not file type or domain
- "Match model to cognitive mode" — clear-goal execution vs ambiguity handling vs nuanced judgment need different models
- "Single focus" — each agent does one job well; context window is attention budget
- "Fresh spawn = fresh attention budget"

**Core material:**
- `docs/agent-profiles.md` — profile format and fields
- `prompt-principles` skill — agent-level and system-level principles
- `design-principles` skill — spec-driven development

**Sessions:** Internal transcripts from nested-safe chat launch design and architecture exploration.

---

## 4. The PTY Trap: Why Transparent Wrapping Is the Wrong Default for AI Tools

**Angle:** Wrapping everything in a PTY seems like the simple, universal solution for AI tool observation. It's not. Terminal corruption, permission interception failures, lost control signals — the transparent abstraction isn't transparent. A concrete case study from the terminal-resize investigation.

**The discovery story:**
1. User reports Codex CLI terminal corruption ("messed up codex cli") — happens during resize, also during idle
2. Investigation reveals Meridian uses a fundamentally different Codex path: `app-server` + `resume --remote` + PTY wrapper, vs direct `codex` which uses native TUI
3. Codex's `app-server` WebSocket transport is documented as "experimental / unsupported"
4. OpenCode and Codex both expose first-class HTTP/SSE observer APIs — the PTY was unnecessary for them

**The design conclusion** (from no-PTY decision log):
- D-1: Separate terminal ownership from control ownership
- D-2: Keep Claude on PTY (no side-channel exists), but Codex/OpenCode go native
- D-3: Terminal surface mode becomes explicit launch field (`native_inherit | pty_mediated`)
- D-8: Avoid transparent MITM/protocol proxying unless first-class APIs fail

**Core material:** Internal investigation report, decision log, and harness launch/control matrix (design docs).

**Sessions:** Internal transcripts from the terminal resize corruption investigation, OpenCode observability, side-channel research, and injection timing probes.

**Work items:**
- `terminal-resize-corruption-investigation`
- `no-pty-sidechannel-control-plane`

---

## 5. Crash-Only AI Systems: Designing for the Certainty of Failure

**Angle:** Apply Candea & Fox's crash-only design to AI agent systems. Every write is atomic. Every read tolerates truncation. There is no graceful shutdown. Recovery IS startup. This isn't just system design theory — it's the only way to make multi-agent orchestration survivable.

**Core principles** (from `AGENTS.md`):
- Every write is atomic (tmp+rename)
- Every read tolerates truncation
- There is no "graceful shutdown" — if meridian is killed mid-spawn, the next `meridian status` detects and reports the orphaned state
- Recovery IS startup
- Crash-only design paired with "files as authority" — no databases, no in-memory state

**How it manifests in the design:**
- `ChatRuntime.recover_all()` on startup — rebuilds event indexes from history files
- Atomic `chat-server.json` writes via tmp+rename
- Stale nested chat runtime directories are acceptable residue (crash-only prefers durable residue over implicit cleanup)
- D-5: Treat stale post-interrupt Codex output as stale data, not invisible data — persisting with causal ids preserves forensic truth

**Core material:**
- `AGENTS.md` — Design Principle #5
- `src/meridian/lib/state/` — state layer
- Internal target architecture doc — operational residue section

**Work items:**
- `nested-chat-launch-guard`

---

## 6. Files as Authority: Why I Chose JSONL Over Databases for AI Agent State

**Angle:** All AI agent state lives on disk — spawns, sessions, work items, KB. No databases, no services, no hidden state. If it's not on disk, it doesn't exist. This is a deliberate architectural choice with implications for observability, debugging, crash recovery, and cross-model portability.

**Core principle** (from `AGENTS.md`):
- "Files as Authority: All state is files. No databases, no services, no hidden state."
- "Knowledge in Data, Not Code: Agent capabilities live in YAML profiles, not procedural code. State lives in JSONL events, not in-memory objects."
- Cross-platform path handling via `get_user_home()`

**Why this matters:**
- Inspectable — any tool can read JSONL; no database client needed
- Portable — state follows the user home, not a server
- Crash-safe — atomic writes, truncation-tolerant reads
- Harness-agnostic — no model-specific state dependencies
- Debuggable — `meridian session log` reads raw history files

**Core files:**
- `AGENTS.md` — Design Principle #4, Core Principle #2
- `src/meridian/lib/state/` — path resolution, spawn store, session store
- `src/meridian/lib/platform/__init__.py` — cross-platform primitives

---

## 7. Designing for Delegation: When Agents Spawn Agents

**Angle:** What happens when AI agents spawn other AI agents? The nested-chat-launch-guard work is a case study in gradual trust: start with a blanket ban, then replace with targeted protections as you understand the isolation boundaries you actually need.

**The problem:**
- `meridian chat` refused to launch from nested Meridian execution (MERIDIAN_DEPTH > 0)
- The guard was coarse: a "root-only user-home mutation firewall"
- Actual risks: discovery file clobbering, recovery cross-talk, shared spawn namespace
- What was already safe: chat ID uniqueness, ephemeral port allocation, UUID-based IDs

**The solution** (Option B: isolated runtime root per chat server scope):
- Replace blanket guard with targeted runtime scoping
- Each chat server gets its own isolated runtime subtree
- Recovery becomes correct by construction — `recover_all()` only sees this server's chats
- "One runtime boundary deletes multiple classes of cross-talk at once"

**Design artifacts** (internal, work item `nested-chat-launch-guard`):
Requirements, exploration findings, target architecture, behavioral spec, feasibility study, and review findings.

**Sessions:** Internal transcripts from nested-safe chat design and architecture option analysis.

**Work items:**
- `nested-chat-launch-guard`

---

## 8. My Agents Are Great at Discovery. They Never Finish Anything.

**Angle:** A personal, reflective post about a pattern observed over months of using multi-agent systems. Agents excel at exploration, research, and design. But closing the loop — converting findings to durable artifacts, advancing from design to implementation, marking work done — requires deliberate discipline. The tool won't do it for you.

**The evidence:**
- Two work items (`terminal-resize-corruption-investigation`, `nested-chat-launch-guard`) with completed design/research but still "open" status
- Investigation produced actionable findings but no KB capture, no follow-through
- ~8 spawns showing as "running (idle)" — the harness bug obscures completion, but the pattern is real
- Design packages with target architecture but no plan/, no phase breakdown, no implementation started
- KB docs exist but haven't absorbed recent findings (PTY investigation, injection smoke results)

**The insight:**
- Exploration is cheap with agents (parallel spawns, cheap models, rapid probes)
- Convergence is expensive — it's the human's job, not the agent's
- "Crash-only isn't just system design — it's interaction design. If it's not on disk, it doesn't exist."

**Work items showing the pattern:**
- `terminal-resize-corruption-investigation` — open, has finished investigation + smoke tests
- `nested-chat-launch-guard` — open, has thorough design package, no plan/implementation

---

## 9. Model Personalities: What I Learned About Claude, GPT, and GPT-5.5 from Months of Multi-Agent Usage

**Angle:** Not benchmarks. Real behavioral patterns from extensive use in a multi-agent system.

**Observed tendencies:**
- **GPT (gpt-5.4):** Errs on the side of correctness and completeness. Tries to find every issue, be thorough. Can over-correct. Good for review, investigation, smoke testing.
- **Claude (opus/sonnet):** Drives to completion. Wants to finish things, ship code. May miss some stuff but gets things done. Good for design, architecture, implementation.
- **GPT-5.5:** Drives changes to completion, but is sensitive to context quality. With good context engineering, ships well. With bad context, confidentially drives in the wrong direction.
- **Harness effects:** Same model through different harnesses behaves differently. System prompt, tool definitions, execution model all matter.

**How this maps to agent assignment (cognitive lanes):**
- GPT for judging lanes — adversarial, thorough, finds all issues
- Claude for designing and orchestrating lanes — drives to completion, handles ambiguity
- GPT-5.5/codex for creating lanes — ships code, needs good context
- Cheap models for reading lanes — fast, high-throughput, don't waste expensive models on grep

---

## 10. Where Did $52 Go? Auditing a Real Multi-Agent Work Item

**Angle:** Take one real work item (`reaper-escape-fix`) and trace every dollar. 26 spawns, 5 agent roles, 6 models, ~3 hours wall clock. Show the full spawn tree, the model mix, and where the money actually went. The punchline: the single biggest cost driver wasn't reasoning — it was the wrong harness for an orchestrator agent.

**The case study: `reaper-escape-fix`**
- Total cost: ~$52 across 26 spawns
- Pipeline: design-lead → planner → tech-lead → qa-lead + kb-lead (parallel)
- Zero failures. Zero redesign loops. Clean execution.

**The cost breakdown that tells the real story:**

| Agent | Model | Cost | % of Total | What it did |
|---|---|---|---|---|
| qa-lead | GPT 5.4 (Codex) | $15.67 | **30%** | Trimmed test files. Spawned 2 children ($4.91). |
| tech-lead | Opus 4.6 (Claude) | $3.27 | 6% | Coordinated 10 children across 5 phases + corrective. |
| general reviewer | GPT 5.4 (Codex) | $3.78 | 7% | Final gate review. Found 1 high, 2 medium findings. |
| kb-maintainer | GPT 5.5 (Codex) | $4.43 | 9% | Fixed 2 broken links. |

**The qa-lead deep dive (the $15.67 spawn):**
- 5.5M input tokens per turn, 97.4% cache hits
- 15 empty `write_stdin` polling cycles waiting for a child spawn — each one a full context-window round-trip through the cache layer
- Cost attribution: ~$2.50 in pure wait-polling overhead, ~$1.50 reading a 51K-token explorer transcript, ~$4.91 on its two children, rest is orchestration + editing
- The same work on Claude harness would have been ~$3-4 total: native `spawn wait` blocks as a single tool call, no polling tax

**The insight: harness choice is a cost multiplier for orchestrators.**
- Codex's interaction model turns every wait-yield into a full context-window round-trip
- Orchestrators spend most of their time *waiting for children*, not reasoning
- The tech-lead (Opus 4.6 on Claude) coordinated 10 children for $3.27. The qa-lead (GPT 5.4 on Codex) coordinated 2 children for $15.67. 5x more expensive, 5x fewer children.
- Fix: move orchestrator profiles to Claude harness (Sonnet) — native blocking wait, no polling tax
- Also: kb-maintainer at GPT 5.5 for link-fixing is like hiring a senior architect to change lightbulbs

**The model mix analysis:**
- Claude Opus 4.6 (3 spawns, $7.59): design-lead, tech-lead. High-stakes coordination — justified.
- Claude Sonnet 4.6 (9 spawns, $4.77): coders, doc writers. Good execution, cheap. Best value.
- GPT 5.4 (8 spawns, $32.96): reviewers, smoke-testers, planner, qa-lead. Includes the $15.67 qa-lead outlier.
- GPT 5.4-mini (2 spawns, $0.91): explorers. Cheapest reads.
- GPT 5.5 (1 spawn, $4.43): kb-maintainer. Overkill.

**What changed after the audit:**
- qa-lead: `gpt-5.4` (Codex) → `sonnet` (Claude). Native spawn-wait, no polling tax.
- kb-maintainer: `gpt-5.5` medium → `gpt-5.4-mini` high. Structural work doesn't need deep reasoning.
- Estimated savings on this work item alone: ~$15-17

**Relates to ideas:** #3 (Cognitive Lanes — model-to-lane matching), #9 (Model Personalities — harness effects)

**Case study:** Work item `reaper-escape-fix` — 26 spawns, all spawn reports and session transcripts introspectable via the Meridian CLI.

**Sessions for qa-lead dissection:** The qa-lead orchestrator, its explorer child (keep/delete assessment), and its reviewer child (challenge pass) — all inspectable via internal session logs.

---

## 11. 82% of My File Reads Were Redundant — Scraping 3 Months of AI Agent Sessions

**Angle:** The data post. Pull tool-call history from 10,152 sessions across Claude Code, Codex, and OpenCode. Every Read, every cat and sed, every grep. Track which reads were redundant (same file, same session). Show the numbers, the patterns, the charts.

**The headline numbers (unified analysis, Feb 8 – May 9 2026):**
- 10,152 sessions, 145,718 file reads, 119,527 redundant (82%)
- Earlier dataset (4,339 sessions): 67,017 reads, 50,319 redundant (75.1%)
- Estimated cost at API rates: ~$15,068 over 3 months

**Key breakdowns:**
- **Read-edit-reread:** Agent reads file, edits it, reads it back to "verify." Claude Code's Edit tool says "Do NOT re-read" — they do anyway. 2,197 read-after-edit events tracked.
- **Delegation tax:** Primary sessions 5.5% redundancy, subagents 80.8%. 14.7x worse.
- **Compaction death spiral:** Sessions that compact: 69.4 avg reads, $24.56 avg cost. Without compaction: 12.1 avg reads, $2.18 avg cost. 17x cost difference.
- **Per-model (confounded by role):** GPT-5.4 at 80.4%, GPT-5.5 at 29.5% — but GPT-5.4 was leaf coder, GPT-5.5 was orchestrator. Controlling for role, every model re-reads >50%.
- **Per-harness cache:** 82.3% overall cache hit ratio. Claude harness $10,288 estimated, Codex $4,753, OpenCode $27.
- **Most-read files:** spawn/execute.py (248 reads across 104 sessions), launch/context.py (269 reads across 149 sessions)
- **Model-by-role analysis:** Model rankings reverse depending on role. GPT-5.4-mini is worst as explorer, best as coder. Claude Opus 4-6 is worst as architect, best as explorer.

**The experiment I want to run:**
- Workspace cache (LRU of recent files in system prompt) to break read-edit-reread
- Measure before/after on the redundancy numbers
- The analysis script is rerunnable — can show the diff

**Charts already generated (social media format):**
- `final-headline.png` — hero stat donut
- `final-delegation-tax.png` — primary vs subagent
- `final-agent-roles.png` — waste by role
- `final-models.png` — model comparison
- `final-daily-cost.png` — peak week stacked by model
- `final-model-spread.png` — model usage distribution
- `final-model-role-heatmap.png` — model × role matrix
- Per-role model charts: `final-model-as-coder.png`, `final-model-as-reviewer.png`, `final-model-as-architect.png`, `final-model-as-explorer.png`

**Data sources:**
- `research/file-read-waste/scripts/session-read-analyzer.py` — unified analyzer
- `research/file-read-waste/scripts/read-waste-viz-final.py` — chart generator
- `research/file-read-waste/runs/2026-05-09-unified/model-role-report.md` — model-by-role narrative

**Relates to:** #10 (Where My Tokens Went — the qa-lead story references this data)

---

## Quick-Reference: Work Items

| Work item | Status | Contains |
|---|---|---|
| `terminal-resize-corruption-investigation` | open | Investigation report, injection smoke tests, requirements |
| `nested-chat-launch-guard` | open | Requirements, design/spec, architecture, feasibility, exploration, review |
| `no-pty-sidechannel-control-plane` | open | Requirements, architecture/decision-log, harness matrix, permission routing |
| `architecture-refactor-roadmap` | open | Target architecture, feasibility, refactors |
| `context-active-work-resolution` | open | Requirements, implementation prompts |
| `reaper-escape-fix` | open | Full spawn tree (26 spawns), design package, plan, implementation, QA, KB |

## Quick-Reference: Key Source Files

| File | Content |
|---|---|
| `AGENTS.md` | Design philosophy, principles, architecture |
| `src/meridian/lib/harness/connections/base.py` | ConnectionCapabilities dataclass |
| `src/meridian/lib/harness/connections/claude_ws.py` | Claude capability flags |
| `src/meridian/lib/harness/connections/codex_ws.py` | Codex capability flags |
| `src/meridian/lib/harness/connections/opencode_http.py` | OpenCode capability flags |
| `llm-writing` skill | LLM writing pathologies |
| `prompt-principles` skill | 4-level prompt design principles |
| `intent-modeling` skill | Helpfulness trap, intent capture |
| `design-principles` skill | Spec-driven development, edge-case thinking |
| `dev-principles` skill | Refactoring, abstraction, deletion discipline |
| `docs/agent-profiles.md` | Profile format, fields, routing |
| `mars.toml` | Package dependencies |
