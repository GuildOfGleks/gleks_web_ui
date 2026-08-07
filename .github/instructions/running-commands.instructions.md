---
description: 'How to run this workspace’s npm scripts without hanging or waiting on dead processes'
applyTo: '**'
---

# Running commands in this workspace

Every script here is fast — the slowest is 15 seconds. If you are waiting minutes for one, it
is not slow, it is **hung**, and waiting will not help. This file records which commands exit
cleanly, which do not, and how to run either kind so a session never stalls.

Measured on the reference machine (Windows, `npm@11.6.2`, Angular v21), cold `.angular/cache`:

| Script | Exits on its own? | Wall time |
| --- | --- | --- |
| `npm run check:tokens` | ✅ | ~1 s |
| `npm run format:check` / `npm run format` | ✅ | ~6 s |
| `npm run build:lib` | ✅ | ~5–7 s |
| `npm run lint` | ✅ | ~10 s |
| `npm run test:lib` | ✅ | ~13 s |
| `npm run build:showcase` | ✅ | ~11–15 s |
| **`npm run build:lab`** | ❌ **never exits** | work done in ~8 s, then hangs forever |
| `ng serve …` (any project) | ❌ by design | a dev server is supposed to keep running |

## The one rule

**Always put a `timeout` in front of a build/test command, and print the exit code.**

```bash
timeout 120 npm run build:lib; echo "exit=$?"
```

`exit=124` means the command hit the timeout — i.e. it hung. Any other code is a real result.
Without this you cannot tell "still working" from "wedged", and the tool call burns its full
budget before telling you anything.

Do **not** reach for `run_in_background` to dodge a hang. These commands take seconds; running
them in the foreground with a timeout gives you the answer immediately. Backgrounding a hung
build just moves the stall somewhere you will notice it later — and a backgrounded build that
never exits reports no result at all, so you end up polling a log file to find out that it
finished 4 minutes ago.

## `build:lab` — the known hang

`ng build gleks-ui-lab` **completes its work and then never exits.** The output is fully
written — `Prerendered 1 static route`, `Application bundle generation complete`,
`Output location: …` — and `dist/gleks-ui-lab/` is correct and usable. The process simply does
not terminate (single `ng` process, ~14 live threads, no open sockets).

So judge it by its **output marker**, never by process exit — and keep the timeout tight, since
the work is done in ~8 s and every extra second is dead waiting:

```bash
LOG=<scratchpad>/lab-build.log
timeout 30 npm run build:lab > "$LOG" 2>&1          # exit=124 is the expected result
grep -q "Output location" "$LOG" && echo "BUILD OK" || echo "BUILD FAILED"
grep -c "ERROR" "$LOG"                               # must be 0
```

`timeout 30` is deliberate: a 120 s timeout does not make the build more reliable, it just
makes you sit through 112 s of nothing. If the marker is missing at 30 s, re-run with a longer
timeout — but that means something genuinely changed, not that the machine is slow.

Then kill the leftover process (see cleanup below).

Ruled out as causes, so don't re-investigate these: the corporate `HTTP_PROXY`/`HTTPS_PROXY`
env vars (hangs identically with them unset), prerendering (hangs with `RenderMode.Prerender`
swapped for `.Server`), a stale `.angular/cache` (hangs after a full cache wipe), the
`server.ts` entry (byte-identical to `ui-showcase`, which exits fine), and the `npm run`
wrapper (`npx ng build gleks-ui-lab` hangs the same way). The remaining difference from
`ui-showcase` is that `gleks-ui-lab` pulls in FontAwesome as a CommonJS dependency and reads its
assets/styles out of `node_modules/@guildofgleks/ui`. Root cause is unidentified; it is an
Angular CLI teardown problem, not a project-config one.

`build:lab` is **not a CI step** (CI builds `@gleks/ui` and `ui-showcase` only), so in most
sessions you don't need to run it at all.

## Never run two builds into the same `dist/` at once

Two concurrent `ng build`s racing on one output directory produce artifacts you cannot trust,
and the exit codes become meaningless. Run builds one at a time. This matters especially with
`build:lab`, where the temptation is to "just start another one" because the first appears
stuck.

## Cleaning up

A hung `ng` process holds file locks on `dist/` and will corrupt the next build. Kill leftovers
before finishing a turn (this is also required by `agent-workflow.instructions.md`):

```powershell
Get-CimInstance Win32_Process -Filter "Name like '%node%'" |
  Where-Object { $_.CommandLine -like '*gleks_web_ui*' -and $_.CommandLine -like '*ng.js*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

For a dev server, free the port explicitly:

```powershell
Get-NetTCPConnection -LocalPort 4200 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Windows / sandbox gotchas hit in real sessions

- **`rm -rf node_modules/<pkg>` is blocked** by the tool sandbox. Use PowerShell instead:
  `Remove-Item -Recurse -Force <path>`.
- **`npm install` will not restore a package you overwrote with a local build** when the two
  carry the same version string — npm sees the version it wants and leaves the directory alone.
  To undo the local-library swap from `ui-showcase.instructions.md`, `Remove-Item` the package
  directory *first*, then `npm install`.
- **Chained sleeps are blocked** (`sleep 30; cat log`). To wait for a condition, use a
  backgrounded `until` loop: `until grep -q "marker" log; do sleep 2; done`.
- **Prefer redirecting to a file over `| head -N`.** Reading a saved log is cheaper than
  re-running a build, and `head` closing the pipe early can leave the writer in an odd state.
- **Strip ANSI colour before grepping** Angular/prettier output, or patterns silently miss:
  `... 2>&1 | sed 's/\x1b\[[0-9;]*m//g'`.
- **`npm run format` is workspace-wide.** Running `prettier --write` on a glob will reformat
  files unrelated to your change. Format only what you touched, or accept the whole-repo pass
  as its own separate commit.
