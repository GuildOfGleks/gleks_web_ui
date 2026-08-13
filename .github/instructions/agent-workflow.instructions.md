---
description: 'Cross-cutting rules for AI agents working anywhere in this workspace'
applyTo: '**'
---

# Agent Workflow Rules

These apply to every project in this workspace (`gleks-ui-lab`, `ui-showcase`, the
`@guildofgleks/ui` library, and anything added later), regardless of which files are being
edited. Project-specific instruction files add to these; they don't replace them.

## A library change touches exactly two projects

**`projects/gleks/ui` and `projects/ui-showcase`. Never `projects/gleks-ui-lab`.**

The lab resolves `@guildofgleks/ui` from the **published npm package**, so it can only ever
document what a consumer can install today. Editing it in the same session as the library
change puts it ahead of npm: its examples reference API that does not exist yet, and its build
breaks the moment it touches a path or symbol that only exists in the local `dist/`.

So the loop is:

1. Change the library.
2. Add or extend the example in `ui-showcase` that exercises the change, and verify it there —
   that is the only place a library change is verified live (`gleks-ui-library.instructions.md`
   step 7).
3. **Anything the lab will need — new API to document, a statement that stops being true, a
   path that moves — goes into `docs/lab-after-publish.md` instead of into the lab.** Write it
   as a checklist entry with the file and, where useful, the line: the point is that whoever
   picks it up later does not have to re-derive it.

`docs/lab-after-publish.md` is a **live** file, not an archive: **once an entry is actually
done in the lab, delete it.** An entry that stays after the work is finished is worse than no
entry — it sends the next person to re-check something already correct, and after that happens
twice nobody trusts the file. Its length is the honest size of the lab's debt, and it should
reach zero after each release is documented.

The one exception is repo hygiene that is not about API at all — a workspace-wide `prettier`
pass, a dependency bump. Those may touch the lab, because they say nothing about the library.

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
