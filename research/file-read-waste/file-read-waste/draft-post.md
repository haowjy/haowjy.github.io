---
title: "Where My Tokens Actually Went"
date: 2026-05-16
tags: [ai, agents, llm, analysis]
description: "I spent $200/month on Codex. At API rates, I used $17,000 worth of compute in 3 months."
status: draft — needs charts and editing pass
---

# Where My Tokens Actually Went

I'm on the Codex $200/month plan. A few weeks ago I opened the dashboard and my usage had dropped from 60% to 10% overnight.

I'd just finished a large refactor of [meridian](https://github.com/meridian-flow/meridian-cli), a multi-agent orchestration engine I've been building. The refactor itself was driven by the engine — product leads spawning design leads spawning architects spawning coders, all coordinating through the same system they were restructuring. Dozens of agents running in parallel across Claude Code, Codex, and OpenCode. The largest session to date — over 8 hours. I'd been regularly running 2-3 hour sessions without thinking much about it, but this one was different.

The timing lined up with a wave of complaints I was seeing from Claude Code and Codex users about providers getting stingy with usage limits. Claude Code users had been hitting it for months. Now with GPT-5.5 bringing a flood of new Codex users, the same thing was starting there. My first thought was the same as everyone else's: did they quietly reduce my limits?

I also had no real visibility into where the token budget was going — how much cache I was hitting, whether cost correlated with useful work, or how much was just overhead from the multi-agent setup. So I wrote a script to pull the tool call history from every agent session I could find — Claude Code's JSONL logs, Codex's native session files, OpenCode's SQLite database. Every `Read` call, every `cat` and `head` in bash, every grep. For each file read, I tracked whether the agent had already seen that file earlier in the same session.

10,895 sessions total. February through May 2026. Roughly two dozen models.

The headline number: out of 157,281 file reads, **129,685 were redundant**. The agent re-reading a file it already had in context, in the same session. 82.5%.

Not across sessions — within a single session.

## Read-Edit-Reread

The single biggest contributor to the 82.5%. An agent reads a file, edits it, then reads it again to "confirm" the edit stuck. Claude Code's own Edit tool tells agents "Do NOT re-read a file you just edited to verify — Edit would have errored if the change failed." They do it anyway.

This isn't a delegation problem or a compaction problem. It's a verification instinct baked into the model's behavior. The agent doesn't trust that its tool call worked, so it checks. Every check is a file read. Every file read burns context window space. In long sessions, this adds up — the same 200-line file read 8 times across a sequence of small edits, when a single read plus the diffs would have been sufficient.

The pattern is most visible in coder sessions doing iterative implementation. Read the file to understand it. Edit it. Read it back to verify. Run tests. Read the file again to plan the next edit. Edit. Read back. For a file touched 4 times in a session, you get 8+ reads of the same content.

## Trust the Explorers

My setup uses a lot of delegation — a product lead spawns a design lead, which spawns an architect, which spawns a coder. Each spawn starts a new context window with none of the parent's file reads.

| | Sessions | Redundancy rate |
|---|---|---|---|
| Primary (me talking to an agent) | 38 | 5.5% |
| Subagents | 10,112 | 81% |

When I talk to an agent directly, there's almost no redundancy. I ask it to read a file, it reads it, we move on. Subagents re-read 81% of the time. Every delegation boundary is a cliff — the orchestrator read the files and knows what matters, but the agent it spawns starts blind.

But the worse pattern is when the orchestrator doesn't even trust its own delegates.

I caught a qa-lead agent that spawned an explorer to assess 6 test files. Standard delegation — the explorer is a cheap model (GPT 5.4-mini) that reads fast and reports findings. While the explorer was still running, the qa-lead started reading the same test files itself. `sed -n '1,220p'` on the source files. `git diff main` on the test files. `rg` across the test directory. By the time the explorer reported back, the qa-lead had already read everything the explorer was supposed to read for it.

The explorer's 265-second run was largely wasted — the orchestrator duplicated most of it in parallel. Then, when the explorer finished, the qa-lead read the explorer's full session transcript (51,000 tokens) instead of just its structured report. So it paid for the reading twice: once doing it itself, once ingesting the explorer's record of doing the same thing.

This isn't a one-off. In another session, an investigator spawned an explorer to read the codebase, then went and read the same files itself before the explorer returned. The delegation was cosmetic — the orchestrator couldn't stop itself from looking.

The fix isn't technical. It's a prompt problem. Orchestrators need to be told: delegate, then wait. Don't read the files your delegate is reading. Work from reports, not raw files. The model's instinct is to gather context itself — fighting that instinct is what makes delegation actually save tokens instead of doubling them.

## Compaction

When an agent fills its context window, it compacts — summarizing the conversation to free up space. The summary is lossy. The agent loses the contents of files it read, so it reads them again, which fills context again, which triggers another compaction.

| | Sessions | Avg reads | Redundancy | Avg cost |
|---|---|---|---|---|---|
| With compaction | 253 | 66.7 | 39.6% | $20.16 |
| Without compaction | 10,642 | 13.2 | 22.1% | $1.13 |

One coder session compacted 22 times in 12 minutes — roughly every 33 seconds. Read, fill context, compact, forget, re-read. Sessions that compacted cost 18x more on average.

## Harness Overhead

File re-reading is the biggest waste category, but there's a second tax that doesn't show up in file-read stats at all: the cost of *waiting*.

I audited a recent work item end-to-end — a process cleanup bug fix. 26 agent spawns, ~$33 total, 3 hours wall clock. The spawn tree:

```
product-lead (primary session, Claude)              $13.41
├── design-lead        Opus 4.6      $3.05
├── planner            GPT 5.4       $0.76
├── tech-lead          Opus 4.6      $3.27   ← coordinated 10 children
│   ├── coder ×3       Sonnet 4.6    $3.04
│   ├── smoke-tester ×2 GPT 5.4     $1.19
│   ├── reviewer ×3    GPT 5.4      $1.60
│   ├── alignment-rev  GPT 5.4      $0.26
│   └── coder (fix)    Sonnet 4.6   $0.36
├── qa-lead            GPT 5.4      $3.18   ← 10% of total cost
│   ├── explorer       GPT 5.4-mini  $0.11
│   └── reviewer       GPT 5.4      $0.92
└── kb-lead            Sonnet 4.6    $0.63
    ├── code-mirror ×2 Sonnet 4.6    $0.66
    ├── kb-writer      Sonnet 4.6    $0.49
    └── kb-maintainer  GPT 5.5      $0.82
```

The tech-lead coordinated 10 children across 5 implementation phases, ran a 4-lane final review gate, caught two medium findings, fixed them in a corrective phase, and shipped. Cost: $3.27.

The qa-lead coordinated 2 children to trim test files. Cost: $3.18.

The tech-lead ran on Claude. The qa-lead ran on Codex.

When a Claude agent calls `meridian spawn wait`, it blocks. One tool call, one context load, the agent sleeps until the child finishes. When a Codex agent does the same thing, it polls — `write_stdin` every 5 seconds, each poll sending the full context window through the model. The qa-lead had a 5.5 million token context window and polled 15 times waiting for a single child. Fifteen empty round-trips where nothing happened except burning tokens through the cache layer.

The qa-lead's actual work — reading test files, deciding what to cut, rewriting 6 files — was maybe $1-2 of useful compute. The rest was overhead: $1.03 on its two children, plus wait-polling and reading the explorer's full transcript instead of just its report.

Same pattern with the kb-maintainer at the bottom of the tree: GPT 5.5 for $0.82 to fix two broken links. Like hiring a senior architect to change lightbulbs.

**Harness choice is a cost multiplier for orchestrators.** The model matters, but the harness determines how much overhead the model pays just to coordinate. An orchestrator that spends most of its time waiting for children should be on a harness that handles waiting efficiently. Codex is great for leaf agents that read, think, and write. It's expensive for agents that mostly delegate and wait.

## Cost

Estimating cost across three harnesses and a dozen models is rough, but the token counts are exact. Based on published API pricing:

**~$17,200 estimated over 3 months.**

The hosted plan masked how large the underlying API bill would have been. At API rates, the same usage would have cost orders of magnitude more than the flat-rate plan, with the largest spike during a multi-agent refactor.

A caveat on model comparisons: the per-model redundancy rates range from 29.5% to 80.4%, but this is almost entirely confounded by role. GPT-5.5 was my orchestrator — it delegates instead of reading. GPT-5.4 was the leaf coder. Controlling for role, every model re-reads more than half its files. The model matters less than where it sits in the delegation chain.

The providers are subsidizing a huge amount of agentic usage compared with raw API pricing.

## What I Changed

**Profile changes:**

- **qa-lead**: GPT 5.4 on Codex → Sonnet 4.6 on Claude. An orchestrator that delegates to cheap explorers and reviewers doesn't need expensive reasoning — it needs efficient coordination. Native blocking wait, no polling tax.
- **kb-maintainer**: GPT 5.5 → GPT 5.4-mini at high effort. Structural doc health checks don't need a frontier model. Added writing quality and self-review skills to compensate for the smaller model on the prose it does touch.
- Estimated savings on the audited work item alone: $2-3, roughly 6-9% of total.

**Orchestrators on Claude, workers on whatever fits:**

The qa-lead fix is a specific case of a broader principle I'm applying across the board. Orchestrators — agents that spend most of their time spawning children, reading reports, and making routing decisions — belong on Claude harness. Claude's tool-call model handles `spawn wait` as a single blocking call. No polling, no empty round-trips.

Leaf agents — coders, reviewers, smoke-testers — can stay on Codex or whatever model fits the task. They don't wait for children. They read, think, and write. Codex is good at that.

**Trust the explorers:**

The delegation redundancy is a prompt problem. Orchestrators now get explicit instructions: delegate, then wait. Work from reports, not raw files. Don't read what your delegate is reading. The model's instinct is to gather context itself — the prompt has to override that instinct, or delegation just doubles the token spend.

**Codex polling fix:**

The Codex `write_stdin` polling loop for `spawn wait` is a harness-level problem, not something I can fix with prompts or profiles. I'm looking into whether this can be fixed upstream in Codex, or whether I need to fork and patch the wait behavior to avoid the repeated context-window round-trips. Even cached, 15 empty polls at 5.5M tokens each is real money. If the harness could yield without re-entering the model, the orchestrator-on-Codex tax drops to near zero.

The file-read analysis script is rerunnable, so I can measure before/after on the redundancy numbers. For the harness overhead, the spawn metadata already tracks input tokens, cache hits, and cost per spawn — the audit is just reading what's already there.

## What I Haven't Fixed Yet

The read-edit-reread cycle is the hardest one. It's not a prompt problem or a delegation problem — it's a fundamental limitation of the conversation-as-context model. The agent's only view of the file system is what's in its conversation history. After an edit, the "current" version of the file exists only as a tool result somewhere in the history. If the conversation is long enough, that result may have been compacted away. The agent can't tell whether it still "knows" the file's current state, so it reads again to be safe.

The conversation history treats file reads as events: "at turn 47, the agent read foo.py and saw these 200 lines." But the agent doesn't need a log of past reads. It needs the current state of the files it's working with.

I'm going to try something: a workspace — an LRU cache of the most recently touched files, injected into the system prompt on every turn. After an edit, the workspace reflects the new contents automatically. No re-read needed. When a file gets evicted (the agent moved on to other files), the last-known contents drop into the conversation history where they're still available but no longer front-and-center. The system prompt always has the live version, not the version from the last explicit Read.

This should also break the compaction death spiral — the workspace lives in the system prompt, not the conversation, so it survives compaction. The agent can compact freely without losing its view of active files.

The analysis script is rerunnable. I'll measure before and after. I'll report back.

The data and analysis scripts live with this site draft.

---

*10,895 sessions across Claude Code, Codex, and OpenCode. February–May 2026. Spawn audit from `reaper-escape-fix` work item (26 spawns, May 2026).*
