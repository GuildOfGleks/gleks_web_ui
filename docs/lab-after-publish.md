# `gleks-ui-lab` — what to update after each publish

`gleks-ui-lab` resolves `@guildofgleks/ui` from the **published npm package**, on purpose: its
examples have to reflect what a consumer can install today, not an unreleased local build. That
rule (see `gleks-ui-library.instructions.md` step 7) means lab edits are always _deferred_ —
work lands in the library first, and the lab catches up only once the version carrying it is
actually on npm.

This file is that backlog, and the rule that feeds it is in
`.github/instructions/agent-workflow.instructions.md`: a library change touches the library and
`ui-showcase`, and everything the lab will need lands here instead.

**It is a live checklist, not an archive. Delete each entry the moment it is actually done in
the lab** — do not tick it, strike it through, or move it to a "done" section. An entry that
outlives the work sends the next reader to re-verify something already correct, and a file that
does that twice stops being trusted. What is left in here is exactly the lab's outstanding
debt, and it should reach zero after each release is documented; when a whole section empties,
delete the section too.

---

## Checking your work

`npm run check:app-contrast` — WCAG AA for both apps' **own** chrome, in all 11 themes. The lab
half resolves against the palettes of the _installed_ package, which is what the site renders
with; the showcase half against the workspace, which is why it catches a palette problem one
release earlier. `check:contrast` covers neither: it measures the library. Added 2026-09-03, when
it found the lab's sidebar hover label and two `code` chips under AA.

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.

## 21.17.0

- **A new Avatar page**, in the D6 shape (`gleks-ui-lab.instructions.md`): the fallback chain
  (picture, initials, a `src` that fails, icon), the five sizes beside the skeleton circle they
  share, `shape`, initials from names (including an emoji and a name of one word), `initials`,
  `decorative`, and an avatar with a `gogBadge` count and a status dot. Accessibility: named once
  as an image, `decorative`, nameless, and a pressable avatar is a button that contains one. Add
  it to the navigation, the sitemap and the Global Config note (it reads no config). Look at it in
  a browser — the failing-`src` example must show initials, not a broken image, on the
  server-rendered page.
- **Badge page:** a badge on a `role="img"` host (a named avatar) is now the host's description,
  and a round avatar anchors the badge on its circle — `--gog-badge-host-inset` and
  `--gog-badge-dot-offset` are new tokens for the token reference.
- **Token reference and theme starter:** the `--gog-avatar-*` family and the two badge tokens;
  regenerate `theme-starter.css`.
- **The component count** (31 in the README) and the comparison page's per-library counts.
