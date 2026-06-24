---
description: "Create or modify a spec and produce its step-by-step implementation plan"
agent: "agent"
tools: ["vscode/askQuestions", "search/codebase", "edit", "execute/runInTerminal"]
---
<!-- GENERATED from src/workflows/spec/commands/plan.md by scripts/generate.py — edit the source, not this file. -->

Senior software analyst. Create the spec if it does not exist, understand it, explore the codebase, surface risks, get user decisions, produce a concrete implementation plan. Adhere to CLAUDE.md.

User input: ${input:args}

Output style: terse. No filler, no narration. Code, git commit messages, PR bodies, and verbatim interactive prompts pass through unchanged.

The spec_id is the issue key/number in your configured tracker (e.g. `PAR-796`, or a GitHub issue number). Spec files live on disk under `.sdd/specs/` and are always git-excluded — the tracker issue is the source of truth, kept in sync by §8.

**ask-prompt** (used throughout): present the listed options as a **single-select** question using your environment's native structured picker — Claude Code: the `AskUserQuestion` tool; VS Code Copilot: `vscode/askQuestions`; OpenCode: its question tool, or plain-text numbered options if no structured picker is available. List the recommended option **first** with `(Recommended)` and a one-line reason. Always allow a free-form answer. **STOP and wait** for the selection before proceeding.

## Workflow

### 1. Parse arguments

- `spec_id` = first whitespace-separated token. Uppercase `A-Z`, `0-9`, `-` only.
- `rest` = everything after `spec_id`. Its meaning depends on mode (§2): the spec **description** (create mode) or the **changes** (modification mode). May be empty.

### 2. Lazy init, load spec, detect mode

**Lazy init (runs first, every invocation, idempotent — no prompting):**
1. If `.sdd/specs/` does not exist, create it (`mkdir -p .sdd/specs`).
2. If inside a git repo (`git rev-parse --git-dir` succeeds), ensure `.sdd/` is git-excluded: resolve the exclude file with `git rev-parse --git-path info/exclude`, then read it and, if it has no line exactly `.sdd/`, append `.sdd/` (preserving existing content). Skip silently when not in a git repo.

The template is read from `/home/adriana/.claude/plugins/marketplaces/ai-tools/src/workflows/spec/templates/spec.md` in §3.4.

**Load + detect mode:** Read `.sdd/specs/<spec_id>.md`. Mode is driven by spec-file existence and plan presence:

- **File missing** → **create mode** (§3). The spec is created, its body filled from `rest`, then the same invocation continues into analysis (§4) and produces the plan.
- **File present, no `## Implementation Plan` section** → **first-plan mode**. `rest` optional. Skip §3; go to §4.
- **File present, `## Implementation Plan` present** → **modification mode** (re-plan). `rest` is the required `changes`. If empty, print:
  ```
  This spec already has an Implementation Plan. Re-running /plan requires a description of what changed.
  Usage: /plan <spec_id> <what changed and why>
  ```
  and stop.

### 3. Create mode

Runs only when the spec file is missing. Then falls through to §4 — **do not stop after creating the file.**

#### 3.1 Derive metadata

From `spec_id`, `rest`, and any issue id / URL in the input, infer:

| Field | Rules | Example |
|---|---|---|
| `spec_type` | One of: `feature`, `bugfix`, `refactor`, `chore`, `docs`, `experiment`, `hotfix`, `release`, `support` | `bugfix` |
| `spec_title` | Short Title Case description | `Same Value Min Max Validation` |

Derive `branch_name` = `<spec_type>/<spec_id>-<Title-Case-Words-Joined-By-Dashes>`.

If `spec_type`, `spec_title`, or `spec_id` cannot be inferred from the input, **ask-prompt — do not guess.** Offer the candidate `spec_type` values as options; a free-form title comes through the free-form answer.

#### 3.2 Dirty tree check

Run `git status --porcelain`. Non-empty → abort, ask the user to commit or stash. `.sdd/` is git-excluded and will not appear; only non-ignored dirty files matter.

#### 3.3 Branch prompt

ask-prompt (only `<branch_name>` substitutes):

- `question`: `Create branch <branch_name> from HEAD?`
- `header`: `Branch`
- options:
  - `Yes (create branch)` — `Switch to a new branch named <branch_name> from the current HEAD.`
  - `No (stay here)` — `Skip branch creation. Stay on the current branch.`

`Yes (create branch)` is the recommended option (list it first).

- Selected `Yes (create branch)` → switch to a new branch from HEAD using `branch_name`. If taken, append `-v2`, `-v3`, etc. Set frontmatter `branch: <branch_name>`.
- Selected `No (stay here)` → skip branch creation. Set frontmatter `branch: <none>`. Stay on the current branch.

#### 3.4 Write the spec file

Read the spec template from `/home/adriana/.claude/plugins/marketplaces/ai-tools/src/workflows/spec/templates/spec.md`. (Always read it fresh — never copy it into the project — so the latest template is used.) Create `.sdd/specs/<spec_id>.md` with:

- Frontmatter:
  ```yaml
  ---
  spec_id: <spec_id>
  spec_type: <spec_type>
  spec_title: <spec_title>
  branch: <branch_name or <none>>
  ---
  ```
- Body = the template sections, **filled from the provided description** (`rest`, plus any linked issue). Expand the human's input into the product-level sections (Context, Summary, Functional Requirements, Non-Goals, Edge Cases, Acceptance Criteria, Open Questions, Testing Guidelines). Leave a section's placeholder only when the input genuinely says nothing about it. Product-level only — no implementation details, code, or file paths in the body.

Then continue to §4 in the same invocation.

### 4. Codebase exploration

Be thorough, not superficial. Read-only — **do not write or modify code.**

Must investigate:
- Files affected.
- Similar features already implemented — find closest analogous pattern and follow it.
- Existing tests — patterns to follow.

Modification mode → focus on areas touched by `changes`.

### 5. Risks

Document anything that could go wrong:
- Breaking changes to existing behavior.
- Performance implications.
- Missing test coverage.

### 6. Ask user

Gather the user's answers via **ask-prompt** — not a free-form text prompt. Surface:
1. Open questions from the spec (if unanswered).
2. Technical decisions with multiple valid approaches.
3. Risks needing user input.

Batch them (a structured picker takes 1–4 questions per call). For each question, infer 2–4 candidate answers and present them as options, recommended candidate **first**. The free-form answer is always available.

Infer options using this source-of-truth order:
1. Spec body (existing constraints or examples).
2. Codebase (closest analogous pattern already implemented).
3. Prior specs / `CLAUDE.md` (established conventions).
4. Generic defaults (common industry practice).

When a question has no reasonably inferable options, ask it open-ended in plain text instead and wait for the answer the same way.

**STOP and wait for answers.** Do not proceed until the user responds.

### 7. Write/refresh spec sections

#### 7a. First run (create mode or first-plan mode)

Append to spec body (preserve all existing content above):

```markdown
## Clarifications
<!-- User's answers to open questions and decisions -->

## Analysis

### Affected Files
<!-- Every file to create or modify, grouped by layer -->

### Risks & Concerns
<!-- Problems and mitigations -->

### Decisions
<!-- Key technical decisions and rationale -->

## Implementation Plan
<!-- Ordered steps. Each step = one atomic, committable unit. -->
- [ ] Step 1: ...
- [ ] Step 2: ...
```

#### 7b. Modification mode (re-run)

1. Prepend a new entry to `## Clarifications` with the `changes` input and the user's answers from step 6. **Cap each re-run's append at ≤3 bullets** summarising what changed and why — do not enumerate every prior question.
2. Update `## Analysis` subsections with new/changed Affected Files, Risks, Decisions. Do NOT delete prior entries — append or amend with dated notes (current date).
3. Refresh `## Implementation Plan`:
   - Checked step still valid (`- [x] Step N: ...`) → keep.
   - Checked step invalidated → **delete the line outright.** Subsequent step numbers do not renumber — gaps are intentional and indicate where superseded work used to live. Record the *reason* the step was dropped as one of the ≤3 Clarifications bullets.
   - Unchecked step still valid → keep.
   - Unchecked step no longer relevant → remove.
   - New work → append with numbering continuing the sequence (do not renumber existing steps).

When `changes` revise the product requirements (not just the plan), amend the affected product-level sections (Summary, Functional Requirements, etc.) in place, preserving `## Clarifications` / `## Analysis` / `## Implementation Plan`.

Plan rules (both modes):
- Each step atomic — reviewable and committable independently.
- Each step names specific files to create or modify.
- Order by dependency — foundational layers first.
- Include a testing step per layer where tests are needed.
- Final step = run the QA pipeline defined in CLAUDE.md.
- 3–15 steps total depending on complexity.

### 8. Sync to the tracker

The spec body should be mirrored to its tracker issue (`spec_id` is the issue key/number). Offer it — do not push without consent.

ask-prompt (only `<spec_id>` substitutes):

- `question`: `Sync <spec_id> to its tracker issue description?`
- `header`: `Sync`
- options:
  - `Sync` — `Overwrite the tracker issue description with the spec body.`
  - `Skip` — `Leave the tracker issue untouched. The spec stays local.`

`Sync` is the recommended option (list it first).

- Selected `Skip` → print `Spec <spec_id> kept local. Tracker not updated.` and proceed to §9.
- Selected `Sync` → read `.sdd/config.json` `source` and dispatch:
  - `local` (or no config) → print `No tracker configured (source=local). Spec <spec_id> kept local.` and proceed to §9.
  - `jira` → push via the **connected Atlassian MCP**:
    1. Use whichever connected Atlassian/Jira MCP exposes `editJiraIssue` and `getAccessibleAtlassianResources` (tool names vary by client). If none is connected, print `No Atlassian MCP connected — cannot sync <spec_id>. Connect one and re-run, or sync manually.` and proceed to §9.
    2. Resolve `cloudId`: pass `sources.jira.site` from `.sdd/config.json` as `cloudId` first; if that fails, call `getAccessibleAtlassianResources` and use the returned id.
    3. Build the body: strip the YAML frontmatter (between the first two `---` lines), the leading `# Spec: …` heading, and all HTML comments (`<!-- … -->`). The remaining markdown — including the `## Implementation Plan` task-list checkboxes — is the description.
    4. Call `editJiraIssue` with `issueIdOrKey: <spec_id>`, `fields: { "description": <body> }`, and `contentFormat: "markdown"` (the MCP converts markdown to ADF server-side; do not hand-build ADF).
    5. On success print `Synced <spec_id> to Jira.` On failure print the error verbatim; the local spec is unaffected.
  - `youtrack` or `github` → run `bash "/home/adriana/.claude/plugins/marketplaces/ai-tools/scripts/publish.sh" <spec_id>` (the shell publish script reads `.sdd/config.json` and pushes to the configured backend with drift detection). Print its output verbatim. On non-zero exit the local spec is unaffected.

  Then proceed to §9.

### 9. Output

Print exactly:

```
Plan complete for <spec_id>: <spec_title>
Mode:   <create|first-plan|re-run>
Steps:  <N> total (<K> carried over, <D> deleted, <M> new)
Sync:   <synced|skipped|sync failed>

Next: /build <spec_id>
```
