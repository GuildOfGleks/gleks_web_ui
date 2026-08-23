# How to finish the showcase's `.card` → `gog-panel` conversion

**This is the whole job, written out so nobody has to work anything out.** It is iteration 4 of
`docs/panel-card.md`, split into its own file because it is bulk work with a fixed recipe, and a
recipe belongs somewhere you can follow line by line.

Nothing here is difficult. There is a lot of it. Read **Part 1** once, then repeat **Part 3** for
one page, commit, and repeat. Do not read ahead of the page you are on.

---

## Part 1 — What is wrong, in one paragraph

`ui-showcase` has its own CSS class called `.card`, defined once in
`projects/ui-showcase/src/app/pages/_detail.scss`:

```scss
.card {
  padding: 20px;
  border: 1px solid var(--gog-border-color);
  background: color-mix(in srgb, var(--gog-surface-color) 92%, transparent);
  box-shadow: var(--gog-panel-shadow);
}
```

Every demo page uses it to box each example: `<article class="card">…</article>`. The library now
ships **`gog-panel`**, which is that box plus a real accessible name, so the showcase should use
its own component instead of a hand-rolled class. A demo app that does not use the library it
demonstrates is the weakest possible argument for the library.

### The numbers, counted on 2026-08-23

**Correction, same day:** the first count used `grep -c 'class="card"'`, an exact string match,
and missed every block whose `class` attribute puts `card` next to a page-local class
(`class="card dash__filters"`, `class="catalog__header card"`, in either order). Two pages,
`catalog-page` and `onboarding-page`, were entirely missing from Part 4's table because of it;
`dashboard-page`'s count was short by one. Recount with the class list split on whitespace, not
the raw attribute string — the numbers below already are:

```bash
python3 - <<'EOF'
import re, glob, os
for f in sorted(glob.glob('projects/ui-showcase/src/app/pages/**/*.html', recursive=True)):
    text = open(f, encoding='utf-8').read()
    plain = hero = 0
    other = []
    for m in re.finditer(r'class="([^"]*)"', text):
        c = m.group(1).split()
        if 'card' not in c: continue
        rest = [x for x in c if x != 'card']
        if not rest: plain += 1
        elif len(rest) == 1 and (rest[0] == 'detail__hero' or rest[0].endswith('__header')): hero += 1
        else: other.append(c)
    if plain or hero or other:
        print(os.path.basename(os.path.dirname(f)), plain, hero, other)
EOF
```

| What                                                                                                            | How many                                                          | What to do with it                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `class="card"` on its own                                                                                       | **250**, across **38** files                                     | **convert these.** This is the job.                                                                                                                                              |
| `card` + a page-local class, non-hero order                                                                    | **3** — `dash__filters`, `catalog__filters`, `onboarding__panel` | **convert these too**, same treatment as the plain ones — the page-local class rides along on the new `<gog-panel>` unchanged (except `onboarding__panel`, see below).       |
| `class="detail__hero card"`, plus the 3 renamed heroes (`dash__header`, `settings__header`, `catalog__header`) | **43**, one per page                                              | **leave alone.** See Part 2, finding 2 — same shape, different page-local name.                                                                                              |
| `class="card bench-index-card"`                                                                                | **1** (`benchmark-index-page.html`)                               | leave for last; see Part 5.                                                                                                                                                       |
| `class="card onboarding__panel"`                                                                               | **1** (`onboarding-page.html`)                                    | **leave alone, whole block** — its eyebrow, heading and entire form share one element; there is no separate header to peel off. Hero-shaped, not a filters-style composite.  |
| pages already converted                                                                                        | **1** (`divider-page`)                                            | the worked example — open it and copy it.                                                                                                                                     |

`panel-page` and `ripple-page` use `gog-panel` too, but they were written that way; only
`divider-page` was converted from `.card`, and it is the one to imitate.

### What "done" looks like

- The recount script above prints `plain=0` and `other=[]` for **every** page except
  `onboarding-page`, whose one `other` block (`['card', 'onboarding__panel']`) is the deliberate
  leftover from the row above, and `benchmark-index-page`, whose `bench-index-card` is retired
  per Part 5 rather than left as `other`.
- Every page looks the same as before, modulo the one deliberate difference in Part 2, finding 3.
- `_detail.scss`'s `.card` rule is gone, renamed to `.detail__hero` (Part 5).

---

## Part 2 — The three things the pilot already found out

These were paid for once on `divider-page`. Do not rediscover them.

### Finding 1 — the swap is mechanical, and the template does not get shorter

One attribute on the heading, one import pair on the page class, same nesting. What changes is
what the page _means_: named regions instead of anonymous `<article>`s. **If you find yourself
adding a wrapper `<div>` or reaching for `::ng-deep` to get the old look back, stop** — that is
the signal the API is wrong, and it is worth a note in `docs/panel-card.md` rather than a
workaround in a template.

### Finding 2 — the hero block does **not** convert

`.detail__hero` puts an eyebrow `<p>` _above_ its `<h2>`:

```html
<div class="detail__hero card">
  <p class="eyebrow">gog-divider</p>
  <h2>Divider</h2>
  <p class="lead">…</p>
</div>
```

`gog-panel` always renders its header slot first, so the eyebrow would jump below the title. The
hero keeps the hand-rolled class. **Do not add a slot to `gog-panel` for this.** One page's
layout is not a reason to grow a component's API.

### Finding 3 — `.card` is border **and** shadow, which is not any one variant

`gog-panel`'s variants are `outlined` (border, no shadow), `elevated` (shadow, no border) and
`filled`. The old `.card` had both. So:

- In the **dark** theme you will see no difference — the shadow carries its own ring.
- In the **light** theme `elevated` reads slightly flatter than the old class did.

Nothing is broken and the conversion is **not pixel-identical**. Expect it, and do not go hunting
for the missing pixel. Use `size="md"`, which is what `divider-page` settled on; the panel's own
default is `lg` and is too roomy for a demo box.

---

## Part 3 — The recipe, for one page

Pick one page from the table in Part 4. Do these nine steps. Then commit. Then pick the next page.

### Step 1 — open the three files of that page

```
projects/ui-showcase/src/app/pages/<name>-page/<name>-page.html
projects/ui-showcase/src/app/pages/<name>-page/<name>-page.ts
projects/ui-showcase/src/app/pages/<name>-page/<name>-page.scss   ← usually untouched
```

### Step 2 — in the `.html`, replace every plain card block

Find every block that looks like this:

```html
<article class="card">
  <h3>Line styles</h3>
  …
</article>
```

and make it look like this:

```html
<gog-panel size="md">
  <h3 gogPanelHeader>Line styles</h3>
  …
</gog-panel>
```

Three edits per block, and nothing else moves:

1. `<article class="card">` → `<gog-panel size="md">`
2. `</article>` → `</gog-panel>`
3. add `gogPanelHeader` to the `<h3>` that is the box's title

**The `<article>` may also be a `<div>` or a `<section>`.** Same treatment.

### Step 3 — what if the block has no heading?

Then it gets no `gogPanelHeader`, and that is allowed — a panel without a heading is still a
panel, it just has no accessible name. Convert it anyway:

```html
<gog-panel size="md">
  <p class="hint">…</p>
</gog-panel>
```

**Do not invent a heading to fill the slot.** A heading nobody asked for is worse than an
unnamed region.

### Step 4 — what if the heading is not the first child?

If something (an image, a toolbar, a paragraph) comes _before_ the `<h3>` and has to stay there,
this block is a hero-shaped block: leave it as `class="card"` and add a one-line HTML comment
saying why. That is a real answer, not a failure — there is one of these per page at most.

### Step 5 — in the `.ts`, add the two imports

At the top of the file, add to the existing `@guildofgleks/ui` import (keep the list
alphabetical):

```ts
import {
  /* …whatever is already there… */
  GogPanelHeaderDirective,
  PanelComponent,
} from '@guildofgleks/ui';
```

and add both to the component's `imports:` array:

```ts
@Component({
  selector: 'app-divider-page',
  imports: [
    /* …whatever is already there… */
    GogPanelHeaderDirective,
    PanelComponent,
  ],
  …
})
```

**If the page has no block with a heading**, you do not need `GogPanelHeaderDirective` — and the
build will tell you so, loudly, because an unused import is a warning here.

### Step 6 — build it

From the repo root:

```bash
timeout 200 npm run build:showcase; echo "exit=$?"
```

`exit=0` and no new `NG` warning about your page. `exit=124` means it hung, which for this script
means something is wrong, not that it is slow — see
`.github/instructions/running-commands.instructions.md`.

The usual mistake at this step is a forgotten `</gog-panel>`, and the compiler names the line.

### Step 7 — look at the page in a browser

```bash
npx ng serve ui-showcase
```

Open `http://localhost:4200/<route>` — the route is the folder name without `-page`, and the list
is in `projects/ui-showcase/src/app/app.routes.ts`.

Check, in this order:

1. every box that used to be a box is still a box;
2. nothing inside a box is clipped — a `gog-select` or `gog-menu` opened inside a panel must
   escape the panel's edge (this was a real bug once, fixed by the panel undoing the collapse
   geometry it inherits; if it comes back, that is a library bug, not a page bug);
3. switch the theme select in the header to **light** and look again, remembering finding 3;
4. flip the **RTL** toggle in the header and look again.

**Then stop the dev server.** Leaving it running is the single most common way the next session
ends up testing stale code:

```powershell
Get-NetTCPConnection -LocalPort 4200 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Step 8 — run the rest of the checks

```bash
timeout 200 npm run lint;         echo "exit=$?"
timeout 200 npm run format:check; echo "exit=$?"
```

If `format:check` complains, format **only the files you touched**:

```bash
npx prettier --write "projects/ui-showcase/src/app/pages/<name>-page/*"
```

Never run the workspace-wide `npm run format` as part of this — it reformats files that have
nothing to do with your change and buries the diff.

### Step 9 — commit this one page, on its own

```bash
git add projects/ui-showcase/src/app/pages/<name>-page
git commit
```

Message shape:

```
refactor(showcase): <name>-page uses gog-panel instead of .card

<N> hand-rolled `.card` blocks become `<gog-panel size="md">` with a
`gogPanelHeader` heading. The hero keeps the class — a panel renders its
header slot first and the hero's eyebrow sits above the title.
```

**One page per commit.** This is not a style preference: `docs/lab-stackblitz-plan.md` is the
post-mortem of a bulk conversion that had to be reverted wholesale, and its conclusion — no
commit converts more than one page — applies here for the same reason. A 39-page commit is a
diff nobody can review and a revert nobody can aim.

Then update the row in Part 4's table, and go back to Step 1 with the next page.

---

## Part 4 — The pages, in the order to do them

**Smallest first.** The first three are practice; by the fourth you will not need Part 3 any more.

Counts are `plain` + `other` blocks from the recount script above, on 2026-08-23, hero excluded.
**40 rows, not 39** — `catalog-page` was missing from the first version of this table (see the
correction in Part 1); `dashboard-page`'s count was 1, now corrected to 2.
`onboarding-page` and `themes-page` carry **no** row: both are hero-only (0 convertible blocks —
see Part 1's table for why `onboarding-page` stays whole), so there is nothing for Part 3 to do
to them.

| Order | Page                       | Blocks      | Done?                    |
| ----- | -------------------------- | ----------- | ------------------------ |
| —     | `divider-page`             | —           | ✅ the pilot             |
| 1     | `catalog-page`             | 1           | ✅                       |
| 2     | `settings-page`            | 1           | ✅                       |
| 3     | `benchmark-accordion-page` | 2           | ✅                       |
| 4     | `benchmark-dropdown-page`  | 2           | ✅                       |
| 5     | `benchmark-instances-page` | 2           | ✅                       |
| 6     | `benchmark-table-page`     | 2           | ✅                       |
| 7     | `dashboard-page`           | 2           | ✅                       |
| 8     | `global-config-page`       | 4           | ✅                       |
| 9     | `card-page`                | 5           | ✅                       |
| 10    | `checkbox-page`            | 5           | ⬜                       |
| 11    | `dialog-page`              | 5           | ⬜                       |
| 12    | `icon-page`                | 5           | ⬜                       |
| 13    | `menu-page`                | 5           | ⬜                       |
| 14    | `panel-page`               | 5           | ⬜                       |
| 15    | `radio-group-page`         | 5           | ⬜                       |
| 16    | `tag-page`                 | 5           | ⬜                       |
| 17    | `toast-page`               | 5           | ⬜                       |
| 18    | `badge-page`               | 6           | ⬜                       |
| 19    | `progressbar-page`         | 6           | ⬜                       |
| 20    | `spinner-page`             | 6           | ⬜                       |
| 21    | `toggle-page`              | 6           | ⬜                       |
| 22    | `skeleton-page`            | 7           | ⬜                       |
| 23    | `tabs-page`                | 7           | ⬜                       |
| 24    | `button-page`              | 8           | ⬜                       |
| 25    | `button-toggle-page`       | 8           | ⬜                       |
| 26    | `chip-page`                | 8           | ⬜                       |
| 27    | `paginator-page`           | 8           | ⬜                       |
| 28    | `slider-page`              | 8           | ⬜                       |
| 29    | `textarea-page`            | 8           | ⬜                       |
| 30    | `tooltip-page`             | 8           | ⬜                       |
| 31    | `autocomplete-page`        | 9           | ⬜                       |
| 32    | `table-page`               | 9           | ⬜                       |
| 33    | `collapsible-page`         | 10          | ⬜                       |
| 34    | `datepicker-page`          | 10          | ⬜                       |
| 35    | `scroll-page`              | 10          | ⬜                       |
| 36    | `accordion-page`           | 12          | ⬜                       |
| 37    | `inputfield-page`          | 12          | ⬜                       |
| 38    | `select-page`              | 12          | ⬜                       |
| 39    | `multiselect-page`         | 13          | ⬜                       |
| 40    | `benchmark-index-page`     | 1 composite | ⬜ **read Part 5 first** |

Tick the rows as you go. A table that lies about where the work is is worse than no table.

Two pages on that list deserve a moment's care, and neither is hard. `catalog-page` (order 1) is
a third, of a different kind: its one block is `class="card catalog__filters"` — Step 2's rule
about `<article>`/`<div>`/`<section>` applies to the tag, and the extra class `catalog__filters`
travels onto `<gog-panel size="md" class="catalog__filters">` exactly as Part 5 describes for
`bench-index-card`.

- **`collapsible-page` and `accordion-page`** put a collapsible inside a box. A `gog-panel` can
  itself collapse, and it would be tempting to merge the two. **Do not.** The page is
  demonstrating `gog-collapsible`, and wrapping the demo in something that does the same thing
  makes the demo unreadable. Convert the box, leave the demo inside it alone.
- **`table-page` and `select-page`** open overlays inside the box. This is exactly what step 7's
  check 2 is for.

---

## Part 5 — The last two things, after all 39 pages

### `benchmark-index-page`'s composite class

One block is `class="card bench-index-card"` — the shared class plus a page-local one. Open
`benchmark-index-page.scss`, look at what `.bench-index-card` adds, and:

- if it only adds layout (grid, gap, width), convert to `<gog-panel size="md"
class="bench-index-card">` — a class on a component host works normally;
- if it _overrides_ the border or background, that is a page deciding it wanted a different
  surface, so give it the matching variant (`variant="filled"` or `variant="outlined"`) and
  delete the override.

### Retire `.card` itself

Once nothing but the heroes uses it, the class name is a lie: it is not a card any more, it is
the hero's surface. `.detail__hero` has **no rule of its own anywhere** today — the whole of its
appearance comes from the `card` sitting beside it — so in
`projects/ui-showcase/src/app/pages/_detail.scss` you rename the rule rather than merging two:

```scss
/* was `.card`, when 39 pages still used it as a generic box */
.detail__hero {
  padding: 20px;
  border: 1px solid var(--gog-border-color);
  background: color-mix(in srgb, var(--gog-surface-color) 92%, transparent);
  box-shadow: var(--gog-panel-shadow);
}
```

Then remove ` card` from the 40 `class="detail__hero card"` attributes:

```bash
grep -rl 'detail__hero card' projects/ui-showcase/src --include=*.html |
  xargs sed -i 's/class="detail__hero card"/class="detail__hero"/'
```

Build, look at two or three pages, and commit that as its own final change.

### Close the iteration

In `docs/panel-card.md`, change iteration 4's row in the status table to ✅ and replace the
_Iteration 4, as far as it got_ section with what actually happened — in particular, whether
finding 1 held up over 39 pages, because that is the honest verdict on whether `gog-panel`'s API
is any good, and it is the only reason this iteration exists.

---

## Part 6 — If something goes wrong

| Symptom                                                | Cause                                | Fix                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `'gog-panel' is not a known element`                   | forgot Step 5                        | add `PanelComponent` to `imports:`                                                                                                |
| `Can't bind to 'gogPanelHeader'`                       | you wrote `[gogPanelHeader]`         | it takes no value — plain `gogPanelHeader`                                                                                        |
| Warning: `GogPanelHeaderDirective is not used`         | no block on the page has a heading   | remove it from the import and the array                                                                                           |
| The heading now looks different                        | `gogPanelHeader` styles the heading  | correct and intended — the panel owns its title's type scale now                                                                  |
| A dropdown is clipped inside a panel                   | a **library** bug, not yours         | stop, and report it against `gog-panel`; the non-collapsible panel is supposed to undo the collapse geometry, `overflow` included |
| The box lost its border in light theme                 | finding 3                            | expected; do not chase it                                                                                                         |
| The page is fine but `lint` fails on an unrelated file | you ran the workspace-wide formatter | `git checkout` the files you did not mean to touch                                                                                |
