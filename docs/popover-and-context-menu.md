# `gog-popover` and `gog-context-menu`

Target: the in-progress 21.20.0. The filename carries no version on purpose.

Both were asked for by the owner on 2026-10-18 while extending `gog-scheduler`
(`docs/scheduler.md`, iteration 2) — "+N more" was to open a popover, and an editable scheduler a
context menu — and both were asked for as **library components usable anywhere**, not as panels
private to the scheduler.

---

## `gog-context-menu` is `gog-menu`, opened differently

The panel, the items, the keyboard, the styling and the tokens a context menu needs are exactly
`gog-menu`'s, so it is built on it rather than beside it. Two changes to `gog-menu` made that
possible, both additive:

- **`openAt(point, returnFocusTo)`.** A menu that opens at a viewport point instead of under a
  trigger. A point has nothing to travel with when the page scrolls, so a menu opened at one
  closes on scroll (its own list scrolling does not count), and a press anywhere — the region it
  was opened from included — closes it.
- **Items found in the rendered panel, not by a content query.** A query sees only items written
  between `<gog-menu>` tags; a context menu's items are stamped from a template, which a query does
  not see. Reading `.gog-menu__item` from the panel serves both. All 37 menu specs passed unchanged.

What `gog-context-menu` adds is the opening and the data: `[gogContextMenu]` on any region opens it
on `contextmenu`, and on the ContextMenu key or Shift+F10 under the focused element; the data is
`gogContextMenuData`, or `gogContextMenuResolve(target)` for one listener over many rows — where
`null` leaves the browser's own menu, because a right-click on nothing in particular should still
offer the browser's. The items are a `gogContextMenuContent` template that receives the data.

**Focus** goes to the first item and back to what was clicked — the nearest focusable element
around it, so a right-click on a row's text returns focus to the row's button.

## `gog-popover` is a non-modal dialog

A popover holds content, not commands, so it is `role="dialog"`, not a menu: Tab moves through what
is inside, focus moving out closes it, Escape closes it and returns focus. It does not trap focus or
block the page — `gog-dialog` does that. Placement is `gog-menu`'s (`resolveMenuPlacement`: below,
flipping up only without room, aligned to the trigger's inline start, clamped into the viewport),
because the geometry question is the same one.

- **Its width is a measure.** Its content wraps, so `docs/component-geometry.md`'s L9 and L8 both
  apply: `min(52ch, calc(100vw - var(--gog-space-16) * 2))`, recorded under D7 and in
  `check-measure.mjs`'s table, which failed until it was.
- **Its measured height is written by the component**, as the menu's is, so
  `--gog-popover-available-height` joined `--gog-menu-available-height` in `check-tokens`'s two
  exception lists.
- **Content that renders as it opens** — the scheduler fills its list in the same pass — is not
  there when the panel is attached, so focus moves inside again after that render if it landed on
  the panel itself.

## Iterations

| #   | What                                                                                    | Status        |
| --- | --------------------------------------------------------------------------------------- | ------------- |
| 1   | `openAt` and DOM-read items on `gog-menu`; both components, specs, showcase pages, docs | ✅ 2026-10-18 |
