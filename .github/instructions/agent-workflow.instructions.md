---
description: 'Cross-cutting rules for AI agents working anywhere in this workspace'
applyTo: '**'
---

# Agent Workflow Rules

These apply to every project in this workspace (`gleks-ui-lab`, `ui-showcase`, the
`@guildofgleks/ui` library, and anything added later), regardless of which files are being
edited. Project-specific instruction files add to these; they don't replace them.

## Clean up background processes when you're done

If verifying a change required starting a shell script, dev server (`ng serve`, `npm start`,
`start:lab`, etc.), or any other long-running background process, **stop it before ending your
turn**. Do not leave a dev server listening on a port once you've confirmed the change works —
the next session (human or agent) will either hit a "port already in use" error or, worse,
silently test against stale code from a server nobody remembers is still running.

- Track the port/PID you started and kill it explicitly once verification is complete.
- This applies to every verification server: `ui-showcase`, `gleks-ui-lab`, and the library's
  own `ng test`/`ng build` watch modes.
- If a step required a temporary, reversible change to get the server running (see
  `gleks-ui-library.instructions.md`'s node_modules swap for local library verification),
  undo that too once you're done — don't leave the workspace in a "mid-verification" state.
