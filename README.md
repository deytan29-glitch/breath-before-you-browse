# Breath Before You Browse

A small digital tool that inserts one conscious breath between impulse and action. Not a blocker. Not a tracker. A moment of pause.

## What it does

Tap to start a breath cycle. The circle expands (inhale), holds, contracts (exhale), then asks: *"still want to continue?"* That's it. Fourteen seconds of deliberate pause.

## How to use

1. Open `index.html` in any browser (works from `file://`)
2. Tap or click the circle to start breathing
3. Follow the prompts: breathe in → hold → breathe out
4. At the end, answer the question honestly
5. Tap the bottom of the screen (in idle) to switch breathing levels

### Breathing Levels

| Level | Pattern | Best for |
|-------|---------|----------|
| Calm | 4-4-6 | Gentle entry |
| Balance | 4-7-8 | Anxiety relief |
| Deep | 5-5-8 | Meditative |

## File map

| File | Purpose |
|------|---------|
| `index.html` | Entry point, script load order |
| `style.css` | Full-bleed black canvas |
| `main.js` | 4 lines of wiring |
| `src/utils/math.js` | Pure math helpers (clamp, lerp, ease, hsl) |
| `src/input/input.js` | Tap/click detection, normalized mouseY |
| `src/canvas/setupCanvas.js` | HiDPI canvas + resize |
| `src/canvas/loop.js` | Breath state machine + all drawing |
| `docs/SYSTEM_CHARTER.md` | Tool Intent Statement |
| `process/changelog.md` | Dated change log |

## Design principles

- **No tracking.** No streaks, no data, no analytics.
- **No shame.** The reflection question is neutral.
- **No dependencies.** Vanilla JS + Canvas. Runs from `file://`.
- **One function.** Breathe. That's it.

## Deploy

Push to GitHub. Enable Pages (Settings → Pages → branch main → / root). No build step needed.
