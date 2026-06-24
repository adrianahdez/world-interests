---
description: "Show the current phase of a spec (or all specs) and the next command to run"
agent: "ask"
tools: ["search/codebase", "execute/runInTerminal"]
---
<!-- GENERATED from src/workflows/spec/commands/status.md by scripts/generate.py — edit the source, not this file. -->

Report the state of one or more specs. **Read-only**: do not modify files, do not call external services or the tracker, no network.

Output style: terse. No filler, no narration.

User input: ${input:args}

## Workflow

### 1. Parse arguments

- Empty → list mode (all specs).
- Otherwise → single mode, `spec_id` = first token.

### 2. Locate specs

- Single: read `.sdd/specs/<spec_id>.md`. Missing → print:
  ```
  No spec found at .sdd/specs/<spec_id>.md
  Run: /plan <spec_id> <description>
  ```
  and stop.
- List: glob `.sdd/specs/*.md`, exclude `.sdd/specs/template/` and `.sdd/specs/.cache/`.

### 3. Derive state per spec

Parse YAML frontmatter: `spec_id`, `spec_type`, `spec_title`, `branch`.

Derive `phase` from body:

| Condition | phase |
|---|---|
| No `## Implementation Plan` section | `drafted` |
| Plan exists, zero `- [x]` lines | `planned` |
| Plan exists, mix of `- [x]` and `- [ ]` | `building` |
| Plan exists, all `- [x]` | `done` |

Counts when plan exists:
- `total` — `- [ ]` + `- [x]` lines in the Plan.
- `done` — `- [x]` lines.
- `pending` — `- [ ]` lines.

Numbering may have gaps where prior re-plans deleted invalidated steps — that is expected, not an error.

Branch hint: run `git branch --show-current` once. Per spec:
- frontmatter `branch` is `<none>` → no branch comparison; skip the `on_branch` field.
- Otherwise compare frontmatter `branch` to current; mark `on_branch: yes|no`.

### 4. Next command

| phase | next |
|---|---|
| `drafted` | `/plan <spec_id>` |
| `planned` | `/build <spec_id>` |
| `building` | `/build <spec_id>` (resumes at next unchecked step) |
| `done` | none — complete. Suggest `/plan <spec_id> <changes>` if scope expands. |

If spec is on a named branch and the user is not on it, prepend hint: `git switch <branch>` before the next command. Skip the hint when `branch: <none>`.

### 5. Output

#### Single mode

```
Spec:      <spec_id> — <spec_title>
Type:      <spec_type>
Branch:    <branch>  (current: <current_branch>, on_branch: <yes|no>)
Phase:     <phase>
Progress:  <done>/<total> done, <pending> pending
Next:      <next command>
```

When `branch: <none>`, print `Branch:    <none>` without the parenthetical.

#### List mode

One row per spec, most recently modified first:

```
SPEC-ID        PHASE      PROGRESS    NEXT
PAR-224        building   3/7         /build PAR-224
PAR-219        done       5/5         —
FOO-12         drafted    —           /plan FOO-12
```

Right-trim columns; do not exceed 120 chars total. After the table, print the count per phase.

No spec bodies or analysis contents — dashboard only.
