# File-Read Waste Analysis

Analysis of AI agent file-reading patterns. Measures how often agents redundantly re-read the same files.

## Key Findings (Unified: 2026-05-09)

- **75.1% of file reads are redundant** (50,319 of 67,017) across 4,339 sessions
- Subagents are **14.7x worse** than primary sessions (80.8% vs 5.5%)
- Sessions with compaction average 69.4 reads vs 12.1 without (5.7× more)
- GPT-5.4 is the worst offender at 80.4% redundancy; GPT-5.5 is best at 29.5%
- Estimated cost: **~$15,068 across 3 months** (Feb 8 - May 9)
- Data sources: Claude Code (3,069 sessions), Meridian spawns (1,051), OpenCode (219)

## Structure

```
file-read-waste/
  README.md           # this file
  scripts/
    session-read-analyzer.py   # unified analyzer (Claude Code + Meridian + OpenCode)
    read-waste-viz-final.py    # social media chart generator
  runs/
    2026-05-09-baseline/       # original meridian-only analysis (1,038 sessions)
      analysis-with-costs.txt
      raw-output.txt
      images/
    2026-05-09-unified/        # full unified analysis (4,339 sessions)
      analysis.txt
      images/
```

## Running a New Analysis

```bash
# Full analysis with cost estimates
python3 scripts/session-read-analyzer.py

# Generate charts
python3 scripts/read-waste-viz-final.py

# Save a new run
mkdir -p runs/$(date +%Y-%m-%d)-post-optimization/images
python3 scripts/session-read-analyzer.py > runs/$(date +%Y-%m-%d)-post-optimization/analysis.txt
cp /tmp/final-*.png runs/$(date +%Y-%m-%d)-post-optimization/images/
```

## Methodology

Data sources:
- **Meridian spawns**: `~/.meridian/projects/*/spawns/*/history.jsonl` + `state.json`
- **Claude Code**: `~/.claude/projects/*/*.jsonl` (native session logs)
- **OpenCode**: `~/.local/share/opencode/opencode.db` (SQLite: session/message/part tables)

Detection:
- Counts file reads from: `Read` tool calls, `cat`, `sed -n`, `head`, `tail` in Bash, `grep`/`rg` (counted as exploratory)
- Supports Claude (assistant/user message format), Codex (item/started event format), and OpenCode (message/part) harnesses
- "Redundant" = total reads minus unique file paths per session (any re-read of a file already seen)
- Compaction events tracked via system messages and explicit compaction parts
- Cost estimates use published API pricing for models without native cost reporting
- Deduplication: Claude Code sessions overlapping with Meridian spawns are merged

## For the Blog Post

Social media charts (in `/tmp/final-*.png` after running viz script):
1. `final-headline.png` - Hero stat (75.1% donut)
2. `final-delegation-tax.png` - Primary vs Subagent (14.7× multiplier)
3. `final-agent-roles.png` - Waste by agent role
4. `final-models.png` - Model comparison (9 models)
5. `final-daily-cost.png` - Peak week daily spend stacked by model
6. `final-model-spread.png` - Model usage distribution

No internal file names — charts focus on universal patterns.

## Key Insights for Blog Post

1. **The headline**: 3 out of 4 file reads are redundant — agents re-read files they've already seen
2. **The delegation tax**: spawning a subagent = starting blind. 14.7× more redundancy than primary sessions
3. **The compaction death spiral**: sessions that compact average 69 reads vs 12 without. Compaction → amnesia → re-read → fill context → compact again
4. **Model ≠ efficiency**: GPT-5.5 looks efficient (29.5%) but was used as orchestrator. GPT-5.4 looks wasteful (80.4%) but was leaf coder. The model chart is really a role chart in disguise
5. **Cache helps but doesn't fix it**: Claude harness has 95.8% cache hit rate vs Codex at 48.8% — but both still have massive redundancy because cached reads still consume context window space
