import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import numpy as np

# -------------------- Data --------------------
HEADLINE = {
    "sessions": 1038,
    "total_reads": 16251,
    "redundant_reads": 12867,
    "unique_files": 3384,
    "hours": 163,
}
HEADLINE["redundant_ratio"] = HEADLINE["redundant_reads"] / HEADLINE["total_reads"]
HEADLINE["unique_reads"] = HEADLINE["total_reads"] - HEADLINE["redundant_reads"]

HOT_FILES = [
    (264, 114, "spawn/api.py"),
    (245, 101, "spawn/execute.py"),
    (236, 91, "launch/context.py"),
    (183, 88, "launch/runner.py"),
    (148, 71, "spawn/models.py"),
    (128, 49, "test_launch_process.py"),
    (120, 67, "state/paths.py"),
    (118, 54, "cli/chat_cmd.py"),
    (117, 38, "config/settings.py"),
    (115, 74, "core/spawn_service.py"),
]

PRIMARY_VS_SUB = {
    "Primary": {"spawns": 37, "reads": 437, "redundant": 24, "ratio": 5.5},
    "Subagent": {"spawns": 999, "reads": 15814, "redundant": 12766, "ratio": 80.7},
}

AGENT_ROLES = [
    ("reviewer", 198, 3871, 2879, 74.4),
    ("coder", 137, 2341, 1688, 72.1),
    ("smoke-tester", 91, 1527, 844, 55.3),
    ("refactor-coder", 60, 1421, 1073, 75.5),
    ("explorer", 70, 1221, 583, 47.7),
    ("refactor-reviewer", 43, 690, 350, 50.7),
    ("tech-lead", 16, 607, 179, 29.5),
    ("alignment-reviewer", 34, 565, 260, 46.0),
    ("integration-tester", 42, 526, 278, 52.9),
    ("planner", 15, 484, 214, 44.2),
]

MODELS = [
    ("GPT-5.4", 633, 10665, 8577, 80.4),
    ("GPT-5.3-codex", 136, 2041, 1456, 71.4),
    ("GPT-5.4-mini", 78, 1264, 605, 47.9),
    ("GPT-5.5", 46, 982, 289, 29.4),
    ("Claude Sonnet", 75, 531, 303, 57.1),
    ("Claude Opus", 7, 266, 104, 39.1),
]

HARNESS_ROWS = [
    ("Codex • GPT-5.4", 633, 10665, 80.4),
    ("Codex • GPT-5.3-codex", 136, 2041, 71.4),
    ("Codex • GPT-5.4-mini", 78, 1264, 47.9),
    ("Codex • GPT-5.5", 46, 982, 29.4),
    ("Claude • Sonnet", 75, 531, 57.1),
    ("Claude • Opus", 7, 266, 39.1),
]

TOKEN_STATS = {
    "Codex": {"input": 1.93e9, "cache": 1.84e9, "hit": 48.8},
    "Claude": {"input": 1.0e6, "cache": 161.6e6, "hit": 95.8},
}

DAILY_SPEND = [
    ("May 6", 185, 747.75, 7.76),
    ("May 7", 223, 964.68, 14.36),
    ("May 8", 480, 2515.22, 8.08),
    ("May 9", 154, 496.08, 71.19),
]

# -------------------- Style --------------------
BG = "#12161d"
PANEL = "#1a2029"
TEXT = "#edf2f7"
MUTED = "#9aa5b1"
GRID = "#2b3442"
ACCENT = "#54a6ff"
REDUNDANT = "#ff6b6b"
UNIQUE = "#3dd6c6"

FIGSIZE = (8, 4.5)  # 1200x675 @ 150 dpi
FIGSIZE_TALL = (8, 16 / 3)  # 1200x800 @ 150 dpi
DPI = 150


def apply_theme():
    plt.style.use("dark_background")
    plt.rcParams.update(
        {
            "figure.facecolor": BG,
            "axes.facecolor": PANEL,
            "savefig.facecolor": BG,
            "text.color": TEXT,
            "axes.labelcolor": TEXT,
            "xtick.color": TEXT,
            "ytick.color": TEXT,
            "axes.edgecolor": PANEL,
            "font.family": "DejaVu Sans",
        }
    )


def add_watermark(fig):
    fig.text(
        0.99,
        0.015,
        "meridian-flow • 1,038 agent sessions analyzed",
        ha="right",
        va="bottom",
        fontsize=11,
        color=MUTED,
        alpha=0.95,
    )


def save(fig, path):
    add_watermark(fig)
    fig.savefig(path, dpi=DPI)
    plt.close(fig)


def human_tokens(value):
    if value >= 1e9:
        return f"{value / 1e9:.2f}B"
    if value >= 1e6:
        return f"{value / 1e6:.1f}M"
    return f"{value:,.0f}"


def viz_headline(path):
    fig, ax = plt.subplots(figsize=FIGSIZE)
    fig.subplots_adjust(left=0.08, right=0.92, top=0.84, bottom=0.10)

    ratio = HEADLINE["redundant_ratio"]
    ax.pie(
        [ratio, 1 - ratio],
        colors=[REDUNDANT, "#2a3140"],
        startangle=90,
        counterclock=False,
        wedgeprops=dict(width=0.28, edgecolor=BG, linewidth=2),
    )

    ax.add_patch(Circle((0, 0), 0.58, facecolor=PANEL, edgecolor=PANEL))
    ax.text(
        0,
        0.1,
        f"{ratio * 100:.1f}%",
        ha="center",
        va="center",
        fontsize=44,
        fontweight="bold",
        color=REDUNDANT,
    )
    ax.text(0, -0.12, "redundant reads", ha="center", va="center", fontsize=17, color=MUTED)

    fig.text(0.5, 0.92, "AI Agents Keep Reading the Same Files", ha="center", fontsize=24, fontweight="bold", color=TEXT)
    fig.text(
        0.5,
        0.86,
        "16,251 file reads analyzed across 1,038 AI agent sessions",
        ha="center",
        fontsize=17,
        color=MUTED,
    )

    ax.set(aspect="equal")
    ax.set_xticks([])
    ax.set_yticks([])
    save(fig, path)


def viz_hotfiles(path):
    files = [r[2] for r in HOT_FILES][::-1]
    reads = np.array([r[0] for r in HOT_FILES])[::-1]
    sessions = np.array([r[1] for r in HOT_FILES])[::-1]

    # first read in each session is unique; repeats are redundant
    unique = np.minimum(reads, sessions)
    redundant = reads - unique

    fig, ax = plt.subplots(figsize=FIGSIZE_TALL)
    fig.subplots_adjust(left=0.39, right=0.97, top=0.77, bottom=0.17)
    y = np.arange(len(files))

    ax.barh(y, unique, color=UNIQUE, height=0.68, label="Unique (first per session)")
    ax.barh(y, redundant, left=unique, color=REDUNDANT, height=0.68, label="Redundant (repeats)")

    for i, total in enumerate(reads):
        ax.text(total + 3, i, f"{int(total)} ({int(sessions[i])} sess)", va="center", fontsize=16, color=TEXT)

    ax.set_yticks(y)
    ax.set_yticklabels(files, fontsize=17)
    ax.set_xlabel("File reads", fontsize=18)
    fig.suptitle("Top 10 Hot Files Read Across Agent Sessions", fontsize=22, fontweight="bold", y=0.95)
    ax.grid(axis="x", color=GRID, alpha=0.35, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.legend(loc="upper left", bbox_to_anchor=(0.01, 1.14), ncol=1, frameon=False, fontsize=13)
    ax.tick_params(axis="x", labelsize=15)
    ax.set_xlim(0, reads.max() * 1.65)

    save(fig, path)


def viz_agents(path):
    sorted_rows = sorted(AGENT_ROLES, key=lambda x: x[2], reverse=True)
    roles = [r[0] for r in sorted_rows][::-1]
    reads = np.array([r[2] for r in sorted_rows])[::-1]
    redundant = np.array([r[3] for r in sorted_rows])[::-1]
    unique = reads - redundant
    ratio = np.array([r[4] for r in sorted_rows])[::-1]

    fig, ax = plt.subplots(figsize=FIGSIZE)
    fig.subplots_adjust(left=0.30, right=0.95, top=0.84, bottom=0.17)
    y = np.arange(len(roles))

    ax.barh(y, unique, color=UNIQUE, height=0.68, label="Unique")
    ax.barh(y, redundant, left=unique, color=REDUNDANT, height=0.68, label="Redundant")

    for i, (total, pct) in enumerate(zip(reads, ratio)):
        ax.text(total + 30, i, f"{pct:.1f}%", va="center", fontsize=15, color=TEXT)

    ax.set_yticks(y)
    ax.set_yticklabels(roles, fontsize=14)
    ax.set_xlabel("Total file reads", fontsize=16)
    ax.set_title("File-Read Waste by Agent Role", fontsize=21, fontweight="bold", pad=14)
    ax.grid(axis="x", color=GRID, alpha=0.35, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.tick_params(axis="x", labelsize=12)
    ax.set_xlim(0, reads.max() * 1.2)
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, 1.07), ncol=2, frameon=False, fontsize=12)

    save(fig, path)


def viz_models(path):
    rows = sorted(MODELS, key=lambda x: x[4], reverse=True)
    names = [r[0] for r in rows]
    ratios = [r[4] for r in rows]

    fig, ax = plt.subplots(figsize=FIGSIZE)
    fig.subplots_adjust(left=0.12, right=0.95, top=0.84, bottom=0.20)
    x = np.arange(len(names))

    colors = [REDUNDANT if r >= 60 else ("#ff9f43" if r >= 45 else ACCENT) for r in ratios]
    bars = ax.bar(x, ratios, color=colors, width=0.65)

    for b, r in zip(bars, ratios):
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 1.4, f"{r:.1f}%", ha="center", fontsize=14)

    ax.set_ylim(0, 90)
    ax.set_ylabel("Redundant read ratio", fontsize=17)
    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=16, ha="right", fontsize=14)
    ax.set_title("Redundant Read Rate by Model", fontsize=26, fontweight="bold", pad=14)
    ax.tick_params(axis="y", labelsize=13)
    ax.grid(axis="y", color=GRID, alpha=0.35, linewidth=0.8)
    ax.set_axisbelow(True)

    callout = (
        f"Primary: {PRIMARY_VS_SUB['Primary']['ratio']:.1f}% redundant\n"
        f"Subagent: {PRIMARY_VS_SUB['Subagent']['ratio']:.1f}% redundant\n"
        "(nearly 15x higher)"
    )
    ax.text(
        0.98,
        0.96,
        callout,
        transform=ax.transAxes,
        ha="right",
        va="top",
        fontsize=16,
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#202735", edgecolor=ACCENT, alpha=0.95),
    )

    save(fig, path)


def viz_harness(path):
    rows = sorted(HARNESS_ROWS, key=lambda x: x[3], reverse=True)
    labels = [r[0] for r in rows][::-1]
    spawns = [r[1] for r in rows][::-1]
    reads = [r[2] for r in rows][::-1]
    ratios = [r[3] for r in rows][::-1]
    y = np.arange(len(labels))

    fig, ax = plt.subplots(figsize=FIGSIZE)
    fig.subplots_adjust(left=0.33, right=0.97, top=0.84, bottom=0.16)

    colors = [REDUNDANT if r >= 60 else ("#ff9f43" if r >= 45 else ACCENT) for r in ratios]
    bars = ax.barh(y, ratios, color=colors, height=0.66)

    for i, (bar, ratio) in enumerate(zip(bars, ratios)):
        ax.text(
            91,
            bar.get_y() + bar.get_height() / 2,
            f"{ratio:.1f}% • {spawns[i]}sp • {reads[i]:,}r",
            va="center",
            ha="right",
            fontsize=12.5,
            color=TEXT,
        )

    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=13)
    ax.set_xlim(0, 92)
    ax.set_xlabel("Redundant read ratio", fontsize=16)
    ax.set_title("Redundancy by Harness × Model", fontsize=20, fontweight="bold", pad=12)
    ax.grid(axis="x", color=GRID, alpha=0.35, linewidth=0.8)
    ax.tick_params(axis="x", labelsize=12)
    ax.set_axisbelow(True)

    save(fig, path)


def viz_tokens(path):
    systems = list(TOKEN_STATS.keys())
    input_tokens = np.array([TOKEN_STATS[s]["input"] for s in systems])
    cache_tokens = np.array([TOKEN_STATS[s]["cache"] for s in systems])
    hit_rates = np.array([TOKEN_STATS[s]["hit"] for s in systems])
    x = np.arange(len(systems))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=FIGSIZE_TALL, gridspec_kw={"width_ratios": [1.25, 1]})
    fig.subplots_adjust(left=0.08, right=0.97, top=0.84, bottom=0.14, wspace=0.22)

    width = 0.36
    bars_input = ax1.bar(x - width / 2, input_tokens, width=width, color=ACCENT, label="Input tokens")
    bars_cache = ax1.bar(x + width / 2, cache_tokens, width=width, color=UNIQUE, label="Cache read tokens")
    ax1.set_yscale("log")
    ax1.set_ylabel("Token volume (log scale)", fontsize=14)
    ax1.set_xticks(x)
    ax1.set_xticklabels(systems, fontsize=13)
    ax1.grid(axis="y", color=GRID, alpha=0.35, linewidth=0.8)
    ax1.tick_params(axis="y", labelsize=11)
    ax1.legend(loc="upper left", frameon=False, fontsize=11)

    for bars in (bars_input, bars_cache):
        for b in bars:
            y = b.get_height()
            ax1.text(
                b.get_x() + b.get_width() / 2,
                y * 1.08,
                human_tokens(y),
                ha="center",
                va="bottom",
                fontsize=10.5,
            )

    hit_bars = ax2.bar(systems, hit_rates, color=[REDUNDANT, UNIQUE], width=0.62)
    for b, r in zip(hit_bars, hit_rates):
        ax2.text(b.get_x() + b.get_width() / 2, r + 1.6, f"{r:.1f}%", ha="center", fontsize=13)

    ax2.set_ylim(0, 105)
    ax2.set_ylabel("Cache hit rate", fontsize=14)
    ax2.tick_params(axis="x", labelsize=13)
    ax2.tick_params(axis="y", labelsize=11)
    ax2.grid(axis="y", color=GRID, alpha=0.35, linewidth=0.8)
    ax2.text(
        0.02,
        0.98,
        "Claude hits cache ~2x better,\nCodex processes vastly more tokens.",
        transform=ax2.transAxes,
        ha="left",
        va="top",
        fontsize=11.5,
        color=MUTED,
    )

    fig.suptitle("Token Volume & Cache Efficiency", fontsize=24, fontweight="bold")
    save(fig, path)


def viz_primary_vs_sub(path):
    names = ["Primary", "Subagent"]
    reads = np.array([PRIMARY_VS_SUB[n]["reads"] for n in names])
    ratios = np.array([PRIMARY_VS_SUB[n]["ratio"] for n in names])
    sessions = [PRIMARY_VS_SUB[n]["spawns"] for n in names]
    redundant = np.array([PRIMARY_VS_SUB[n]["redundant"] for n in names])
    unique = reads - redundant

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=FIGSIZE, gridspec_kw={"width_ratios": [1.25, 1]})
    fig.subplots_adjust(left=0.10, right=0.96, top=0.84, bottom=0.17, wspace=0.24)
    x = np.arange(len(names))

    ax1.bar(x, unique, color=UNIQUE, width=0.6, label="Unique reads")
    ax1.bar(x, redundant, bottom=unique, color=REDUNDANT, width=0.6, label="Redundant reads")
    for i, total in enumerate(reads):
        ax1.text(x[i], total + 240, f"{total:,} reads\n{sessions[i]} sessions", ha="center", fontsize=12)
    ax1.set_xticks(x)
    ax1.set_xticklabels(names, fontsize=13)
    ax1.set_ylabel("Total file reads", fontsize=14)
    ax1.grid(axis="y", color=GRID, alpha=0.35, linewidth=0.8)
    ax1.legend(loc="upper left", frameon=False, fontsize=11)

    ratio_bars = ax2.bar(names, ratios, color=[ACCENT, REDUNDANT], width=0.62)
    for b, r in zip(ratio_bars, ratios):
        ax2.text(b.get_x() + b.get_width() / 2, r + 1.4, f"{r:.1f}%", ha="center", fontsize=13)
    ax2.set_ylim(0, 90)
    ax2.set_ylabel("Redundant read ratio", fontsize=14)
    ax2.tick_params(axis="x", labelsize=13)
    ax2.tick_params(axis="y", labelsize=11)
    ax2.grid(axis="y", color=GRID, alpha=0.35, linewidth=0.8)

    tax = PRIMARY_VS_SUB["Subagent"]["ratio"] / PRIMARY_VS_SUB["Primary"]["ratio"]
    ax2.text(
        0.5,
        0.95,
        f"{tax:.1f}× higher redundancy",
        transform=ax2.transAxes,
        ha="center",
        va="top",
        fontsize=13,
        fontweight="bold",
        color=TEXT,
        bbox=dict(boxstyle="round,pad=0.35", facecolor="#202735", edgecolor=ACCENT, alpha=0.95),
    )

    fig.suptitle("The Delegation Tax: Primary vs Subagent", fontsize=24, fontweight="bold")
    save(fig, path)


def viz_daily_cost(path):
    labels = [d[0] for d in DAILY_SPEND]
    spawns = np.array([d[1] for d in DAILY_SPEND])
    codex = np.array([d[2] for d in DAILY_SPEND])
    claude = np.array([d[3] for d in DAILY_SPEND])
    totals = codex + claude
    x = np.arange(len(labels))

    fig, ax = plt.subplots(figsize=FIGSIZE)
    fig.subplots_adjust(left=0.10, right=0.90, top=0.84, bottom=0.18)

    b1 = ax.bar(x, codex, color=ACCENT, width=0.62, label="Codex")
    b2 = ax.bar(x, claude, bottom=codex, color=UNIQUE, width=0.62, label="Claude")

    for i, total in enumerate(totals):
        ax.text(x[i], total + 35, f"${total:,.0f}", ha="center", va="bottom", fontsize=13)
        ax.text(x[i], 14, f"{spawns[i]} spawns", ha="center", va="bottom", fontsize=10, color=MUTED, rotation=90)

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=13)
    ax.set_ylabel("Estimated spend (USD)", fontsize=14)
    ax.set_title("Daily Agent Spend", fontsize=24, fontweight="bold", pad=12)
    ax.grid(axis="y", color=GRID, alpha=0.35, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.tick_params(axis="y", labelsize=11)
    ax.legend(loc="upper right", frameon=False, fontsize=11)

    save(fig, path)


def main():
    apply_theme()
    viz_headline("/tmp/viz-headline.png")
    viz_hotfiles("/tmp/viz-hotfiles.png")
    viz_agents("/tmp/viz-agents.png")
    viz_models("/tmp/viz-models.png")
    viz_harness("/tmp/viz-harness.png")
    viz_tokens("/tmp/viz-tokens.png")
    viz_primary_vs_sub("/tmp/viz-primary-vs-sub.png")
    viz_daily_cost("/tmp/viz-weekly-cost.png")
    print("Generated all 8 visualizations.")


if __name__ == "__main__":
    main()
