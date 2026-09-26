---
description: 'How to run this workspace’s npm scripts without hanging or waiting on dead processes'
applyTo: '**'
---

# Running commands in this workspace

Every script here is fast — the slowest is 15 seconds, with one deliberate exception,
`check:install`, which builds a whole app (below). If you are waiting minutes for any other, it
is not slow, it is **hung**, and waiting will not help. This file records which commands exit
cleanly, which do not, and how to run either kind so a session never stalls.

Measured on the original reference machine (Windows, `npm@11.6.2`, Angular v21), cold `.angular/cache`.
The workspace moved to Linux on 2026-09-26; the same scripts run there in the same order of
magnitude or faster (`test:lib` ~6 s):

| Script                                    | Exits on its own?           | Wall time                                                                                         |
| ----------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run check:tokens`                    | ✅                          | ~1 s                                                                                              |
| `npm run format:check` / `npm run format` | ✅                          | ~6 s                                                                                              |
| `npm run build:lib`                       | ✅                          | ~5–7 s                                                                                            |
| `npm run lint`                            | ✅                          | ~25 s (three projects: library, showcase, lab)                                                    |
| `npm run test:lib`                        | ✅                          | ~13 s                                                                                             |
| `npm run build:showcase`                  | ✅                          | ~11–15 s                                                                                          |
| `npm run build:lab`                       | ✅ (via wrapper, see below) | ~8–9 s                                                                                            |
| `npm run check:install`                   | ✅                          | ~80 s warm npm cache, longer cold — generates and installs a whole app; run it with `timeout 590` |
| `ng serve …` (any project)                | ❌ by design                | a dev server is supposed to keep running                                                          |

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

## `build:lab` — the known hang, and why the script still exits

`ng build gleks-ui-lab` run directly **completes its work and then never exits.** The output is
fully written — `Prerendered 1 static route`, `Application bundle generation complete`,
`Output location: …` — and `dist/gleks-ui-lab/` is correct and usable. The process simply does
not terminate (single `ng` process, ~14 live threads, no open sockets).

Ruled out as causes, so don't re-investigate these: the corporate `HTTP_PROXY`/`HTTPS_PROXY`
env vars (hangs identically with them unset), prerendering (hangs with `RenderMode.Prerender`
swapped for `.Server`, and hangs identically with prerendering disabled entirely), a stale
`.angular/cache` (hangs after a full cache wipe), the `server.ts` entry (byte-identical to
`ui-showcase`, which exits fine), and the `npm run` wrapper (`npx ng build gleks-ui-lab` hangs
the same way). The remaining difference from `ui-showcase` is that `gleks-ui-lab` pulls in
FontAwesome as a CommonJS dependency and reads its assets/styles out of
`node_modules/@guildofgleks/ui`. Root cause is unidentified; it is an Angular CLI teardown
problem, not a project-config one — so don't chase it in application code (timers, intervals,
`isPlatformBrowser` guards); it reproduces even in a page with none of that.

`npm run build:lab` itself now runs `scripts/build-lab.mjs` instead of `ng build` directly: the
wrapper spawns the real build, watches its stdout for the `Output location:` marker Angular CLI
prints last, and force-kills the process once that lands — so the _script_ exits 0 in ~8–9 s even
though the underlying `ng` process still wouldn't on its own. This is also why `docker build` on
`projects/gleks-ui-lab/Dockerfile` no longer hangs at `RUN npm run build:lab`.

If you ever need to run the raw `ng build gleks-ui-lab` (bypassing the wrapper) for debugging,
judge it by its **output marker**, never by process exit, and keep the timeout tight:

```bash
LOG=<scratchpad>/lab-build.log
timeout 30 npx ng build gleks-ui-lab > "$LOG" 2>&1   # exit=124 is the expected result
grep -q "Output location" "$LOG" && echo "BUILD OK" || echo "BUILD FAILED"
grep -c "ERROR" "$LOG"                                # must be 0
```

Then kill the leftover process (see cleanup below) — the wrapper does this for you automatically,
raw `ng build` does not.

`build:lab` is **not a CI step** (CI builds `@gleks/ui` and `ui-showcase` only); it does run as
part of `projects/gleks-ui-lab/Dockerfile`'s image build.

## Never run two builds into the same `dist/` at once

Two concurrent `ng build`s racing on one output directory produce artifacts you cannot trust,
and the exit codes become meaningless. Run builds one at a time. This matters especially with
`build:lab`, where the temptation is to "just start another one" because the first appears
stuck.

## Cleaning up

A hung `ng` process holds file locks on `dist/` and will corrupt the next build. Kill leftovers
before finishing a turn (this is also required by `agent-workflow.instructions.md`):

```bash
pkill -f '^ng build' || true
```

For a dev server, free the port explicitly:

```bash
pkill -f '^ng serve' || true   # or: fuser -k 4200/tcp, where psmisc is installed
```

Angular CLI rewrites its own process title, so on Linux `/proc/<pid>/cmdline` reads
`ng serve ui-showcase --port 4200 …` — neither `node` nor the path to `ng.js` survives. A pattern
naming `ng.js` matches nothing and fails silently. Keep the `^` anchor: without it, `pkill -f`
also matches the shell whose command line contains the pattern and kills it. `pgrep -af '^ng '`
lists what is left.

## Sandbox gotchas hit in real sessions

- **`npm install` inside `projects/gleks/ui` breaks the whole test suite.** The library's
  `package.json` declares Angular as a _peer_ dependency with the range
  `^21.2.0 || ^22.0.0`, so npm run there resolves it to the newest match — **Angular 22** — and
  writes a nested `projects/gleks/ui/node_modules` plus a `package-lock.json`. Both are
  git-ignored, so nothing shows in `git status`. Anything resolving from inside the library folder
  then finds that copy instead of the workspace's Angular 21, and every spec fails with
  `Error: Need to call TestBed.initTestEnvironment() first` — 356 failures across 49 files, with
  no hint of the real cause. Found on 2026-09-05; the stray install was dated the evening of the
  21.9.1 publish. **Fix: delete `projects/gleks/ui/node_modules` and
  `projects/gleks/ui/package-lock.json`.** There is one `node_modules` in this workspace, at the
  root; the library is built from source by `ng build @gleks/ui` and never needs its own install.
  If a step of the release really does need one, `npm publish` from the root with `--workspace`
  rather than `cd`-ing into the package.
- **`npm install` will not restore a package you overwrote with a local build** when the two
  carry the same version string — npm sees the version it wants and leaves the directory alone.
  To undo the local-library swap from `ui-showcase.instructions.md`, delete the package
  directory (`rm -rf node_modules/@guildofgleks/ui`) _first_, then `npm install`.
- **Chained sleeps are blocked** (`sleep 30; cat log`). To wait for a condition, use a
  backgrounded `until` loop: `until grep -q "marker" log; do sleep 2; done`.
- **Prefer redirecting to a file over `| head -N`.** Reading a saved log is cheaper than
  re-running a build, and `head` closing the pipe early can leave the writer in an odd state.
- **Strip ANSI colour before grepping** Angular/prettier output, or patterns silently miss:
  `... 2>&1 | sed 's/\x1b\[[0-9;]*m//g'`.
- **`npm run format` is workspace-wide.** Running `prettier --write` on a glob will reformat
  files unrelated to your change. Format only what you touched, or accept the whole-repo pass
  as its own separate commit.
