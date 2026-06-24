---
description: "Build a planned spec step by step, pausing for review before each commit, or auto-accepting through to the end"
agent: "agent"
tools: ["vscode/askQuestions", "search/codebase", "edit", "execute/runInTerminal"]
---
<!-- GENERATED from src/workflows/spec/commands/build.md by scripts/generate.py — edit the source, not this file. -->

Build a previously planned spec. Work one step at a time. In step-by-step mode (the default), pause after each step for user review before committing; in auto-accept mode, commit each step and continue without pausing. Adhere to CLAUDE.md.

User input: ${input:args}

Output style: terse. No filler, no narration. Code, git commit messages, PR bodies, and verbatim interactive prompts pass through unchanged.

The spec_id is the issue key/number in your configured tracker (e.g. `PAR-796`, or a GitHub issue number). Spec files live on disk under `.sdd/specs/` and are always git-excluded — the tracker issue is the source of truth, kept in sync by §8.

**ask-prompt** (used throughout): present the listed options as a **single-select** question using your environment's native structured picker — Claude Code: the `AskUserQuestion` tool; VS Code Copilot: `vscode/askQuestions`; OpenCode: its question tool, or plain-text numbered options if no structured picker is available. List the recommended option **first**. Always allow a free-form answer. **STOP and wait** for the selection before proceeding. Where an environment cannot deterministically pause before each commit (e.g. an autonomous agent loop), it must still surface this prompt and wait for the user via the closest available confirmation gate.

## Workflow

### 1. Load and validate

Read `.sdd/specs/<spec_id>.md`. Parse frontmatter (`spec_id`, `spec_type`, `spec_title`, `branch`). Body must contain an `## Implementation Plan` section with checkboxes. Missing → tell user to run `/plan <spec_id>` first and stop.

If `branch` is `<none>`, the spec is being built on the current branch — do not refuse to build, do not switch branches.

Spec files are always git-excluded and never committed; checkbox progress lives on disk only.

### 1a. Select build mode

If at least one step is unchecked, ask-prompt:

- `question`: `Build in step-by-step mode or auto-accept mode?`
- `header`: `Build mode`
- options:
  - `Step-by-step` — `Pause for review before committing each step.`
  - `Auto-accept` — `Run all remaining steps end to end, committing each without pausing.`

`Step-by-step` is the recommended option (list it first).

The selection sets the **build mode** for the run:

- **Step-by-step** — pause at §4 before every commit. The mode can later switch to auto-accept via the `Auto-accept remaining steps` option at any §4 pause. The switch is one-way.
- **Auto-accept** — no per-step pauses. Each step is implemented, committed (§6), and checked off, then the build continues immediately. The §8 completion prompts still run and still wait for the user.

**Auto-accept failure rule:** if a step cannot be completed as specced (tests fail, a command errors, the step's instructions cannot be satisfied), halt immediately. Do not commit the failed step, do not continue, do not fall back to step-by-step. Print the failure reason and a report of steps completed (committed) this run vs. steps pending, then stop.

If all steps are already checked, skip this prompt and go to **Completion**.

### 2. Find next step

First unchecked step (`- [ ]`). Numbering may have gaps where prior re-plans deleted invalidated steps — that is expected. All steps checked → go to **Completion**.

### 3. Build the step

Read the step carefully. It names specific files and actions. Follow:
- Coding conventions from CLAUDE.md.
- Closest analogous patterns in the codebase.
- The `## Coding Standards` section at the end of this file — re-read it before writing code and before drafting the commit message in §6.

### 4. Pause for review

After implementing, print this context block:

```
──────────────────────────────────────
Step N/<total>: <step description>
──────────────────────────────────────

Files changed:
  - <list of files modified or created>

Summary: <brief description of what was done>
──────────────────────────────────────
```

**Auto-accept mode:** print the context block (it is the audit trail), then go directly to §6. Do not pause, do not wait.

**Step-by-step mode:** after the context block, ask-prompt (only `N` and `<short step description>` substitute):

- `question`: `Commit step N — "<short step description>"?`
- `header`: `Step N`
- options:
  - `Continue` — `Commit this step and proceed to the next.`
  - `Auto-accept remaining steps` — `Commit this step, then run all remaining steps without pausing.`
  - `Abort` — `Stop the build without committing this step.`

The free-form answer lets the user give feedback instead of selecting an option.

**STOP after the prompt. Do not commit. Do not proceed. Wait for the user's selection.**

### 5. Handle response

- Selected `Continue` → go to §6.
- Selected `Auto-accept remaining steps` → switch the build mode to auto-accept for the rest of the run (§1a rules apply, including the failure rule), then go to §6.
- Selected `Abort` → stop immediately, do not commit, print how many steps remain.
- Free-form feedback:
  1. Apply the requested changes.
  2. Re-print the §4 context block (refreshed if the feedback affected it).
  3. Re-present the §4 prompt with the **same** question, header, and options in the same order. Only the context block above may change.
  4. Loop until the user selects `Continue`, `Auto-accept remaining steps`, or `Abort`.

The §4 prompt is the canonical pause point in step-by-step mode. Its options must be unchanged across re-displays.

### 6. Commit and mark done

1. `git add -A`
2. Commit message. The subject is `<type>: <short description of the change>`; the message may also carry an extended body. Do not commit with a bare single-line subject — leave room for an extended body.
   - `<type>` is a Conventional-Commits prefix (no scope). Derive it from the spec's frontmatter `spec_type`: `feature`→`feat`, `bugfix`→`fix`, `refactor`→`refactor`, `chore`→`chore`, `docs`→`docs`, `experiment`→`experiment`, `hotfix`→`fix`, `release`→`chore`, `support`→`chore`. When the step's actual change clearly belongs to a different category, pick the type that matches the change instead.
   - The subject must NOT contain the spec_id, the step number, internal ticket numbers, customer information, credentials, API keys, internal URLs, or external system names. See `## Coding Standards` below.
   - These rules define the subject/body *format only*; they do not replace global harness commit conventions. Any standing trailer the harness requires (e.g. a `Co-Authored-By` attribution line) must still be appended.
3. Update spec: change `- [ ] Step N:` to `- [x] Step N:` for the completed step. This edits the git-excluded spec file on disk only — do not `git add` or commit it.
4. Print: `✓ Step N committed. Moving to next step...`

### 7. Loop

Back to step 2. Repeat until done.

### 7a. CLAUDE.md update

Runs once, after all steps are checked, **only if at least one step was committed in this run.**

1. Assess whether the completed build introduced behaviors, invariants, commands, or architectural facts that belong in the project's `CLAUDE.md`.
2. If `CLAUDE.md` is absent in the project root → skip entirely.
3. If no CLAUDE.md-worthy changes were introduced → skip entirely (do not create a no-op commit).
4. Otherwise edit `CLAUDE.md` and commit with subject `docs: <short description of what was documented>` — same format and rules as §6.2.
5. Then proceed to §8.

### 8. Completion

All steps checked:

1. **Push / PR prompt.** Print:

   ```
   ──────────────────────────────────────
   Ready to push branch: <branch>
   ──────────────────────────────────────
   ```

   Then ask-prompt:

   - `question`: `Push branch <branch> to origin?`
   - `header`: `Push`
   - options:
     - `Push` — `Push the branch to origin without creating a PR.`
     - `Push + PR` — `Push the branch and create or update a pull request.`
     - `Skip` — `Exit without touching the remote.`

   - Selected `Skip` → print `Branch <branch> is ready locally. No remote changes made.` and proceed to §8.2.
   - Selected `Push` → run `git push -u origin <branch>`. On success print the remote URL. On failure print the error verbatim and proceed to §8.2.
   - Selected `Push + PR`:
     1. Run `git push -u origin <branch>`. On push failure print the error verbatim and proceed to §8.2 (do not attempt PR).
     2. The PR title is `[<spec_id>] <spec_title>` (the tracker key prefix is intentional — see `## Coding Standards`). Check for an open PR: `gh pr list --head <branch> --state open --json number,url`.
        - Open PR found → `gh pr edit <number> --title "[<spec_id>] <spec_title>" --body "<pr-body>"`.
        - No open PR → `gh pr create --title "[<spec_id>] <spec_title>" --body "<pr-body>"`.
     3. **PR body generation** — build `<pr-body>`:

        **a. Discover PR template.** Use the first that exists:
           1. `.github/PULL_REQUEST_TEMPLATE.md`
           2. `.github/pull_request_template.md`
           3. `docs/pull_request_template.md`
           4. `PULL_REQUEST_TEMPLATE.md` (repo root)
           5. `pull_request_template.md` (repo root)

        **b. Template found → it is authoritative.** Honor the repo's template structure verbatim; do not introduce headings it does not define.
           - Split on markdown headings (`## …` / `### …`). Content before the first heading is the *preamble*.
           - **Preamble**: if it contains explicit removal instructions (e.g. "remove before submitting", ✂ markers), strip the whole preamble. Otherwise preserve it, including HTML comments.
           - Prepare spec data:
             - `SUMMARY` = spec `## Summary` body (verbatim).
             - `IMPLEMENTATION` = spec `## Analysis` body + the step descriptions from `## Implementation Plan` (without checkboxes/status). If `## Analysis` is absent, use only the plan steps.
             - `ISSUE_URL` = derived from `.sdd/config.json` `source`: `jira` → `https://<sources.jira.site>/browse/<spec_id>`; `youtrack` → `<sources.youtrack.base_url>/issue/<spec_id>`; `github` → `https://github.com/<sources.github.repo>/issues/<spec_id>`; `local` → omit the issue reference.
           - PR bodies must not include a commit list, changelog, or `## Commits` section.
           - For each template section, decide by its heading and any placeholder/prompt text:
             - **description / summary / overview / goal / purpose / context** → replace body with `SUMMARY`.
             - **implementation / approach / how** → replace body with `IMPLEMENTATION`.
             - **changes / changelog / what changed** → replace body with `IMPLEMENTATION`.
             - **references / links / related issues** → fill the issue/ticket sub-item with `ISSUE_URL`, fill other derivable sub-items, remove the rest. If none can be filled, remove the section.
             - cannot be filled but placeholder suggests a default → keep, use that default.
             - cannot be filled, no default (e.g. "Screenshots", "Testing checklist") → remove the section.

        **c. No template found → default format.**
           ```
           ## Summary
           <spec Summary section verbatim>

           ## Reference
           * **Issue:** <ISSUE_URL>
           ```
           Omit the Reference section when `source` is `local`. No commit list is appended.

     4. On `gh` success print the PR URL.
     5. On `gh` failure (not installed, not authenticated, etc.): keep the push, print the error verbatim, and print the equivalent manual command.

2. **Sync to the tracker.** Offer to mirror the final spec body to its tracker issue. ask-prompt (only `<spec_id>` substitutes):

   - `question`: `Sync <spec_id> to its tracker issue description?`
   - `header`: `Sync`
   - options:
     - `Sync` — `Overwrite the tracker issue description with the spec body.`
     - `Skip` — `Leave the tracker issue untouched. The spec stays local.`

   `Sync` is the recommended option (list it first).

   - Selected `Skip` → print `Spec <spec_id> kept local. Tracker not updated.` and proceed to §8.3.
   - Selected `Sync` → read `.sdd/config.json` `source` and dispatch (identical to /plan §8):
     - `local` → print `No tracker configured (source=local). Spec <spec_id> kept local.`
     - `jira` → push via the connected Atlassian MCP (resolve `cloudId` from `sources.jira.site`, else `getAccessibleAtlassianResources`; strip frontmatter + `# Spec:` heading + HTML comments; `editJiraIssue` with `contentFormat: "markdown"`). If no Atlassian MCP is connected, print `No Atlassian MCP connected — cannot sync <spec_id>.`
     - `youtrack` or `github` → run `bash "/home/adriana/.claude/plugins/marketplaces/ai-tools/scripts/publish.sh" <spec_id>` and print its output verbatim.

     On success print `Synced <spec_id>.` On failure print the error verbatim; the local spec is unaffected. Then proceed to §8.3.

3. Print:
   ```
   ──────────────────────────────────────
   Build complete: <spec_id>
   Branch:  <current branch>
   Commits: <number of steps completed>
   Remote:  <skipped|pushed|pushed + PR <url>|push failed>
   Sync:    <synced|skipped|sync failed>
   ──────────────────────────────────────
   ```

4. Remind user to run the QA pipeline from CLAUDE.md if the last step didn't already cover it.

## Coding Standards

These standards apply to every piece of code written during a build, every commit message drafted, and every PR body generated. Re-read this section at the start of each step (§3) and before writing the commit message (§6.2).

### Code comments

- Default to writing no comments. Only add a comment when the *why* is non-obvious (a hidden constraint, a subtle invariant, a workaround). If removing the comment would not confuse a future reader, do not write it.
- Keep comments terse — one line whenever possible. Well-named identifiers document *what*; comments cover only *why*.
- Comments must not reference the spec_id, the step number, the current task, or the originating issue. The code outlives the spec; those references rot.
- Do not annotate removed code with "// removed", "// was X". Delete the code outright.

### Sensitive information

The following must not appear in source files, comments, commit subjects, or commit bodies:

- Internal ticket numbers or project keys. **Exception:** the spec's own tracker key is allowed in the PR title (the `[<spec_id>]` prefix) and the PR's References/Issue field. It must still NOT appear in commit subjects/bodies, source files, or comments.
- Customer names, identifiers, account numbers, email addresses, or other PII.
- API keys, tokens, passwords, certificates, private URLs, signing secrets.
- Internal hostnames, internal service names, internal DNS, internal IP ranges.
- External system or vendor names where the relationship is not public.
- Security-related details that would aid an attacker.

When such information is genuinely needed to explain a change, generalise it: "the customer-facing surface" rather than a customer name; "the credential store" rather than a specific secret's env-var name.

### Commit and PR phrasing

- Commit subjects use the Conventional-Commits format from §6.2 — no spec_id, no step number, no internal references.
- The PR title carries the `[<spec_id>] ` tracker-key prefix followed by `<spec_title>`. This is the one place the key is intentionally exposed.
- Bodies, when present, describe *what* the change does and *why*, in normal prose. The PR body's References/Issue field carries the issue URL (per §8.1).
- PR bodies follow §8.1 — no commit list.
