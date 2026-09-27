# Keyboard focus handling for the photo lightbox and mobile menu

**Type:** Bug · **Status:** In Review · **Area:** `src/components/PhotoGallery.tsx`, `src/components/Header.tsx` · **Priority:** Medium

## Problem

A scripted keyboard audit (2026-09-27, Playwright against the static export) found
two components that open over the page but don't manage focus.

### Photo lightbox (`PhotoGallery`) — broken for keyboard users

Opening a photo with Enter shows the dialog, but **focus stays on the thumbnail
behind it**. The dialog's `onKeyDown` only fires when focus is inside it, and
nothing puts it there.

| Action (after opening with Enter) | Result |
|---|---|
| ← / → | Nothing — counter stays at "1 / 46" |
| Tab | Walks the thumbnails *behind* the modal (photo 2, 3, 4…); the Close / Previous / Next buttons are never reached |
| Esc | Doesn't close |
| Close with focus inside the dialog | Closes, but focus is dropped to `<body>` instead of the thumbnail that opened it |
| Page scroll | Not locked while open |

With focus explicitly on the dialog, → does advance (1 / 46 → 2 / 46) and Esc
does close — the handlers work, focus just never gets there. Screen-reader users
hit the same wall: the dialog is announced as modal, but focus never enters it.

### Mobile menu (`Header`) — focus escapes the open menu

Tab reaches the menu button, Enter opens it (`aria-expanded="true"`), and Tab moves
into the menu links — good. But after the last link, **Tab continues into the page
content behind the open menu**, and pressing Esc there closes the menu while leaving
focus on that content instead of returning it to the menu button.

## Technical Specifications

### Lightbox
1. On open, move focus into the dialog (the Close button is a sensible target).
2. Trap Tab / Shift+Tab within the dialog while open.
3. Handle Esc / ← / → at the dialog level so they work wherever focus is inside it
   (they already do once focus is inside — keep that).
4. On close (button, Esc, backdrop click), restore focus to the thumbnail that
   opened it.
5. Lock body scroll while open (the Header already does this for its menu —
   reuse the pattern).
6. Consider marking the rest of the page `inert` while open — a simpler, more
   robust alternative to a hand-rolled Tab trap. `inert` is supported in all
   current browsers.

### Mobile menu
1. While open, keep focus within the header (menu button + menu links) — `inert`
   on `<main>`/`<footer>` or a Tab trap.
2. On Esc, close the menu and return focus to the menu button.

## Acceptance Criteria

- [x] Lightbox: after opening with Enter, focus is inside the dialog; ← / → change
      the photo; Tab cycles only through the dialog's controls; Esc closes it.
- [x] Lightbox: after closing (any method), focus is back on the originating
      thumbnail.
- [x] Lightbox: page doesn't scroll behind the open dialog.
- [x] Mobile menu: Tab never leaves the header while the menu is open; Esc closes
      it and focuses the menu button.
- [x] E2E tests cover both flows keyboard-only (open, navigate, close, focus
      restored).
- [x] `npm run lint`, type-check, and tests pass.

## Notes

- Found alongside `card-link-accessible-names.md`; the rest of the keyboard audit
  was clean — skip link present, visible focus on every stop, logical tab order,
  cookbook filter pills toggle with Enter/Space and expose `aria-pressed`.
- Minor, not in scope: the current page's nav link has `tabIndex={-1}`
  (`aria-current` already marks it); every photo's alt text is identical
  ("Photo from Graz, Austria") — a content improvement, not code.

## Outcome

- **Lightbox (`PhotoGallery`):** remembers the opening thumbnail, focuses the Close
  button on open, locks body scroll, traps Tab/Shift+Tab across the dialog's
  buttons, and on close (button, Esc, backdrop) restores scroll and focus to the
  thumbnail. The "n / N" counter is now `aria-live="polite"`, so photo changes are
  announced. Went with a small hand-rolled trap rather than `inert` — the dialog
  renders inside `<main>`, so making the page inert would need a portal.
- **Mobile menu (`Header`):** the document-level keydown listener now only runs
  while the menu is open; Esc closes and focuses the menu button; Tab/Shift+Tab
  wrap within the header's visible links/buttons.
- **Tests:** unit (focus on open, focus restored on close, Tab wrap, scroll lock,
  aria-live; Esc returns focus to the menu button); E2E `e2e/keyboard.spec.ts`
  covers both flows keyboard-only.

