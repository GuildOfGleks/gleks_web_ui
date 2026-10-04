# `gog-file-upload` — choosing files, by picker or by drop

Target: the in-progress 21.18.0, beside `gog-breadcrumbs` and `gog-stepper` — a minor can carry
several components. The filename carries no version on purpose.

`docs/backlog.md`'s Gaps section lists `file upload` next. It is additive.

---

## The question this plan exists to answer

**What does it own that an `<input type="file">` and a class do not?** Three answers.

### 1. `accept` is a hint, and a drop ignores it

The native `accept` attribute only filters what the operating system's picker offers; a reader can
switch the picker to "All files", and **a file dropped on the page is not checked against it at
all**. A drop zone built from a `<div>` and the input therefore accepts anything dropped on it. The
component validates every file the same way whichever way it arrived — type against `accept`
(extensions, `type/*` and exact MIME types, the native syntax), size against `maxSize`, count
against `maxFiles` — and reports each refusal with its reason.

### 2. A drop zone that is also a control

A drop zone is a mouse affordance. The component keeps the real `<input type="file">` as the
control — focusable, labelled by its `<label>`, opened with Enter or Space, operable by a screen
reader — and lays it over the zone so a click anywhere opens the picker. Dragging over the zone
shows that it will take the drop. Nothing about the zone needs a role or a key handler of its own,
because the input already is the control.

### 3. What happened, said out loud

Adding files and having some refused both happen silently on screen — a list grows, a message
appears below. A permanently mounted polite live region says it: "2 files added", "setup.exe was
not added: its type is not accepted". And removing a file from the list moves focus to the next
file's remove button, or back to the input, rather than dropping it to `<body>`.

---

## What it is

```html
<gog-file-upload
  label="Attachments"
  accept=".pdf,image/*"
  [maxSize]="5 * 1024 * 1024"
  [maxFiles]="3"
  multiple
  [(value)]="files"
  (gogReject)="onRejected($event)"
/>
```

| Input / model                  | Type             | Default | Notes                                                     |
| ------------------------------ | ---------------- | ------- | --------------------------------------------------------- |
| `value`                        | `model<File[]>`  | `[]`    | Two-way, and a `ControlValueAccessor` holding a `File[]`. |
| `multiple`                     | `boolean`        | `false` | Off: a new file replaces the one there.                   |
| `accept`                       | `string`         | `''`    | Native syntax; enforced, not only passed to the picker.   |
| `maxSize`                      | `number \| null` | `null`  | Bytes, per file.                                          |
| `maxFiles`                     | `number \| null` | `null`  | Counting the files already chosen.                        |
| `label`, `hint`, `ariaLabel`   | `string`         | `''`    | The input's name and description.                         |
| `errorMessage`, `errorDisplay` | as every field   |         | `GogErrorState`, like the other controls.                 |
| `disabled`, `size`             | as every field   |         |                                                           |

Output: `gogReject: GogFileRejection[]`, `{ file, reason: 'type' | 'size' | 'count' }`.

**It does not upload.** The app gets `File` objects and sends them however it sends anything; a
component that uploaded would need `HttpClient`, an endpoint, retries and auth, none of which are
its business. Per-file progress is a possible second iteration, driven by the app.

## What it is not

- **Not an uploader** (above).
- **Not an image cropper or previewer.** The list shows a name and a size.

---

## Iterations

| #   | What                                                                                                                                               | Status        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | `gog-file-upload`: picker and drop, validation with reasons, the list with remove, announcements, forms, sizes, tokens, specs, showcase page, docs | ✅ 2026-10-04 |

## Geometry, colour and the gates

- **The zone is a surface** (law 3's exemption: it frames content rather than balancing a label),
  and says so in its stylesheet; its dashed border is the boundary token, so it is visible at 3:1.
- **Law 5**: the remove button gets 24x24 with a `::before`; the zone itself is far larger.
- **`check:contrast`**: the prompt, the hint, file names and sizes on the zone and the page.

## Iteration 1, as it finished

Built as planned, with three things worth keeping.

- **No `file` glyph.** The built-in set has none, and adding one for a decorative mark in a list row
  is the "more icons" decision `docs/backlog.md` keeps separate. The row is a name, a size and a
  remove button.
- **"browse" is not coloured.** The first build drew it in `--gog-accent-dim`, which fell to 4.29:1
  on the hover tint in `one-dark`. Its underline and weight already mark it, so it takes the text
  colour and clears every ground.
- **A drop is prevented even while disabled** — otherwise the browser navigates to the dropped file
  and the page is gone.

Measured in Chrome on the showcase: a click anywhere on the zone opens the real file chooser; a
2 MB PDF picked against a 1 MB limit is refused and announced; a dropped `setup.exe` is refused for
its type although the picker was never involved; Enter on a remove button leaves focus on the next
one; the remove button paints 16px and takes the pointer across 24; the zone shows a 3px ring when
the input inside it has keyboard focus. `check:contrast` measures the prompt, "browse", the hint and
the dashed boundary in all eleven themes.
