# `gog-scheduler` — a month, week or day of the app's events

Target: the in-progress 21.20.0. The filename carries no version on purpose.

`docs/backlog.md`'s Features section, item 8, recorded only a name: "if the library ever gets a
full-page event calendar, it is `gog-scheduler`" (decided 2026-10-03, so a plan would not reach for
"big calendar" or "full calendar"; `gog-calendar` is the date grid and keeps that meaning). On
2026-10-18 the owner asked for it to be built.

---

## The decisions — taken by the owner on 2026-10-18

1. **Scope: month, week and day views, no drag-and-drop.** Events as data (a generic `T[]` with
   accessors), outputs for an event pressed, an empty slot pressed and the range drawn, a
   `gogSchedulerEvent` slot, navigation and a "now" line. Drag/resize, recurring events and
   resource columns are out — each is its own decision, and drag in particular brings a keyboard
   story larger than the rest of the component.
2. **Its own entry point, `@guildofgleks/ui/scheduler`.** `docs/entry-points.md` had decided on
   2026-09-13 that the split stops at table, datepicker and dialog — but that was about _moving_
   shipped components, where every move breaks an import. A new component breaks nothing, is large,
   and usually lives on one route, which is exactly the case a split entry point exists for. That
   file's _Where the split stops_ now says so.
3. **`locale`, `firstDayOfWeek` and `timeZone` fall back to `GOG_CONFIG.datepicker`.** They are the
   app's calendar settings, not one widget's; a `GOG_CONFIG.scheduler` repeating them would make an
   app set its locale twice. The key's JSDoc says it reaches the scheduler.

## What it owns that a grid of divs does not

- **Placement.** Spanning versus timed (all-day, or a day long or more, is a bar), clipping to the
  drawn hours, pieces of an event that crosses midnight, and lanes for overlapping events — all in
  `scheduler-layout.ts`, pure functions over wall dates, specified without a fixture.
- **A keyboard model.** A month is 42 cells and a week up to 336 slots; tabbing through them is not
  a model. The focused day carries the tab stops — its cell or slot, its header and all-day cell,
  and its events — and the arrows move it, moving the view past what is drawn. The same idea as
  `gog-calendar`'s roving cell, extended to the elements a day owns.
- **The clock.** Every `Date` in and out is an instant, and with `timeZone` the scheduler is drawn
  on that zone's clock — the boundary conversion `docs/time-zone.md` built for the datepicker, used
  as is.

## How it is built

- **Positions are minutes of the wall day**, not milliseconds: on a day the browser's zone is 23 or
  25 hours long, an hour row still has to be an hour of the clock.
- **An event shorter than a slot is laid out a slot long**, because that is how tall it is drawn —
  at its real length the next event in its lane would be drawn on top of it.
- **Severity is a leading edge over the surface**, as `gog-alert` draws it: the palette has no
  per-status tint, and the label stays the body text, so `check:contrast` has nothing new to gate.
- **The slot height is the 24px pointer target** (law 5), so every slot of the hour grid is one.
- **Stepping is not debounced.** The toolbar's buttons are `gog-button`s, whose 300ms default
  debounce dropped the second of two quick presses on "Previous" — a spec found it. Stepping is
  meant to be pressed repeatedly, so the three navigation buttons set `[debounce]="0"`.

## What it does not do

- **No drag-and-drop**: moving and extending go through the context menu and a pick (iteration 2).
  No recurring events (the app expands them into `events`), no resource columns, no agenda/list
  view, no `loading` state yet.

## Iterations

| #   | What                                                                                                                                                                                  | Status        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | `gog-scheduler`, `gogSchedulerEvent`, the entry point, labels, tokens, specs, showcase page and specimen, docs                                                                        | ✅ 2026-10-18 |
| 2   | Bars across the week, `monthEventLimit` and `moreEventsAction` in `GOG_CONFIG.scheduler`, "+N more" in a `gog-popover`, editing (`readonly`, context menu, move/resize/create/delete) | ✅ 2026-10-18 |

## Iteration 1, as it finished

- **Specs**: 16 for the layout functions, 29 for the component (views, accessors, outputs,
  navigation, the range output's de-duplication, keyboard, time zone, config, the slot).
- **Gates**: `check:geometry` needed one entry — `scheduler-event`'s radius, declared outermost in
  `check-radii.mjs` (an event sits in a square-cornered cell). Everything else passed as written.
- **Verified in the showcase**, built and served over SSR, driven through Playwright and the
  installed Chrome: the three views, keyboard movement into the next month, Enter on a day, RTL,
  the dark and light themes, two zones side by side — and no console message on `/scheduler`,
  `/progressbar`, `/datepicker` or `/specimen`. **Two defects were found only by looking**, both
  fixed: an event one slot tall showed its time and not its title (under `overflow: hidden` a
  column flex item's minimum height is zero, so the title shrank away first), and the demo data
  anchored on Monday drew nothing on a Sunday under `en-US`, whose week starts that day.
- **`check:install` passed on 2026-10-18**, against the published 21.19.0: 48 files in the tarball
  (+3, none removed), root +3 exports and `/shared` +5, none removed, `@guildofgleks/ui/scheduler`
  reported as a new entry point. Its `SMOKE` page — a fixed week in `timeZone="UTC"`, because the
  page is prerendered at build time and hydrated later — prerendered with the configured `today`
  label and the event, hydrated with an empty console, and took a press on the event. Initial
  bundle 121.54 kB estimated transfer; the scheduler's lazy chunk 8370 bytes, beside the table's
  8310, the datepicker's 9270 and the dialog's 4000. Run it again if another change that triggers
  it lands before 21.20.0 is cut.

## Iteration 2 — asked for by the owner on 2026-10-18

Five requests, each with the decision taken while building it:

1. **The month cell's limit, from the config.** `GOG_CONFIG.scheduler.monthEventLimit` (a new key,
   beside `moreEventsAction` and `readonly`), the input winning as everywhere. The semantics did not
   change — the limit is the cell's rows, "+N more" included — because that is what keeps a month's
   rows one height. What changed is the height: the cell is now **as tall as its rows**, computed
   from the limit and bound inline, so `5` shows five; the fixed `--gog-scheduler-cell-height`
   token went (it was never released).
2. **"+N more" in another language.** It already was — `GOG_CONFIG.labels.moreEvents`, a formatter
   — so this became a demo and a spec rather than code.
3. **"+N more" opens a popover or the day.** `moreEventsAction: 'popover' | 'day'`, default
   `'popover'`, listing the whole day as event buttons. The popover is a new library component,
   `gog-popover` (`docs/popover-and-context-menu.md`), not a panel private to the scheduler.
4. **Multi-day events, and the order.** Each week is now packed: a spanning event takes the lowest
   row free on _all_ its days, longest and earliest first, so its pieces line up into one bar —
   they reach over the cell's padding and line to meet, only the first carries the severity edge,
   and the title is drawn where the bar starts and where a week row begins. Timed events fill the
   rows left free, in start order. `weekRows()` and `fitRows()` in `scheduler-layout.ts`; the week
   view's all-day row uses the same packing.
5. **`readonly`, and a context menu to edit.** On by default, as asked ("works as before"). Off, a
   right-click — or the ContextMenu key, or Shift+F10 — opens a `gog-context-menu`, also a new
   library component: New event on a slot or day; Move, Change end and Delete on an event. **Move
   and Change end are a pick, not a drag**: the menu item sets a pending change, a status line says
   so, and the next slot or day pressed — pointer, or arrows and Enter — is where it goes; Escape
   cancels. That is one interaction for the pointer and the keyboard, which a drag would not have
   been. The scheduler emits `gogEventCreate`, `gogEventDelete`, `gogEventChange` and changes
   nothing itself.

**Found while verifying, in the browser rather than by a spec:** a move could not land on a slot
another event covered — the event took the press. While a place is being chosen, events now let
the pointer through (`pointer-events: none`), and Enter on an event picks its day. And the "+N
more" popover first focused its own panel rather than the first event, because the list renders
in the same pass the panel is attached in; `gog-popover` now moves focus inside again after that
render.

**`check:install` passed again after iteration 2** (2026-10-18), against the published 21.19.0:
root +9 exports and `/shared` +6, none removed; initial bundle 124.39 kB estimated transfer (from
121.54 — the popover and context menu are root components); the scheduler's lazy chunk 10590 bytes
(from 8370 — the editing and the popover list). The `SMOKE` page still prerenders, hydrates with an
empty console and takes a press on its event.

## Iteration 3 — one bar, not pieces (2026-10-18)

The owner's verdict on iteration 2's bars: the line breaks between days. It did — a bar was a piece
per cell, joined by negative margins over the cell's padding and its border, and the joint showed
at every day boundary. No margin arithmetic removes a seam between two elements, so the bar became
**one element**: a month week is now a CSS grid (seven columns; the day number's row, one row per
event row, the bottom padding), and each event is placed across the columns it covers with
`grid-column: <first> / span <n>`. `weekBars()` joins `weekRows()`' pieces into those bars and
breaks one only where a day hides that row behind "+N more". The week view's all-day row is the
same grid. A bar still ends at the week's edge, square, and continues in the next week row.

The month grid stopped being a `<table>`: a bar spanning cells cannot live inside one cell. Each week
is a named group, and the weekday row is `aria-hidden`, because every day and every event is a
button whose name already says its weekday and date.
