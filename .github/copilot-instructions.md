# Copilot instructions

This project uses a spec-driven development workflow. Specs are local Markdown files under `.sdd/specs/`. Run `/plan` to create a spec and a step-by-step implementation plan, `/build` to implement it one reviewable step at a time, and `/status` to see progress. A spec can be synced on demand to Jira (via the Atlassian MCP — agent mode), YouTrack, or GitHub Issues, selected in `.sdd/config.json`.

## Working principles

Behavioral guidelines to reduce common coding mistakes. They bias toward caution over speed — for trivial tasks, use judgment.

### 1. Think before coding

Don't assume. Don't hide confusion. Surface tradeoffs. State assumptions explicitly; if uncertain, ask. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. If something is unclear, stop and ask.

### 2. Simplicity first

Minimum code that solves the problem. No features beyond what was asked, no abstractions for single-use code, no unrequested "flexibility", no error handling for impossible scenarios. If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical changes

Touch only what you must. Don't "improve" adjacent code or formatting, don't refactor what isn't broken, match existing style. Remove only the imports/variables your own changes orphaned; mention pre-existing dead code rather than deleting it. Every changed line should trace directly to the request.

### 4. Goal-driven execution

Define success criteria and loop until verified. Turn "add validation" into "write tests for invalid inputs, then make them pass." For multi-step tasks, state a brief plan with a verify check per step.

## Pause caveat

Copilot agent mode self-corrects in a loop and cannot deterministically halt before each commit. In `/build`, honor the per-step review intent by surfacing the commit prompt and waiting for the user via the edit/terminal approval gates — do not run past a step the user hasn't confirmed.

## graphify

For any question about this repo's architecture, structure, components, or how to add/modify/find
code, your first action should be `graphify query "<question>"` when `graphify-out/graph.json`
exists. Use `graphify path "<A>" "<B>"` for relationship questions and `graphify explain "<concept>"`
for focused-concept questions. These return a scoped subgraph, usually much smaller than the full
report or raw grep output.

Triggers: "how do I…", "where is…", "what does … do", "add/modify a <component>",
"explain the architecture", or anything that depends on how files or classes relate.

If `graphify-out/wiki/index.md` exists, use it for broad navigation. Read `graphify-out/GRAPH_REPORT.md`
only for broad architecture review or when query/path/explain do not surface enough context. Only read
source files when (a) modifying/debugging specific code, (b) the graph lacks the needed detail, or
(c) the graph is missing or stale.

Type `/graphify` in Copilot Chat to build or update the graph.
