# SYSTEM_CHARTER — Everyday Tools

## Tool Intent Statement: *Breath Before You Browse*

---

### 1. Core Function
Guides the user through one slow breath cycle — inhale (4 s), hold (4 s), exhale (6 s) — then asks a single question: *"Still want to continue?"* Fourteen seconds of deliberate pause between impulse and action.

### 2. Human Context
The compulsive unlock → scroll → regret loop. A person reaches for their phone or opens a tab not because they decided to, but because the impulse fired and nothing interrupted it. This tool inserts a single conscious breath into that gap. It does not block. It does not track. It asks for one breath, then one honest answer.

### 3. Intended User
Someone who has noticed the pattern in themselves — the automatic reach, the mindless refresh — and wants a small anchor. Not someone in crisis. Someone who wants to practice noticing.

### 4. Behavioral Thesis
A single conscious breath, taken voluntarily, creates enough space between impulse and action for awareness to re-enter. The tool does not prevent behavior. It illuminates the moment of choice.

### 5. Dignity Clause
- No usage tracking, no streak counts, no "days since" counters.
- No shame language. The reflection question is neutral, not accusatory.
- No data leaves the page. No analytics. No storage.
- The user can close the tab at any time. The tool makes zero claims on attention beyond the breath it was given.

### 6. Refusal Clause
This tool will NOT become:
- A habit tracker or gamified system.
- A screen-time monitor or blocker.
- A social/comparative tool ("your friends breathed 12 times today").
- A notification sender. It runs only when opened.
- A guilt mechanism. It never says "you should have."

### 7. Atmospheric Tone
Like a quiet room. Like putting your hand on a cool surface. Present but not demanding. Warm but not cozy-cute. The circle breathes; the text whispers. Nothing moves fast. Nothing begs for attention.

---

## Design Contract

| Concept | Value | Where it lives |
|---------|-------|----------------|
| **Signal** | Tap/click (binary trigger) + tap zone (mouseY) for level switching | `input.js` — `isPressed`, `mouseY` |
| **Parameter** | Breath phase progress (0–1 per phase), current level durations | `loop.js` — `phaseTime / duration` |
| **Behavior** | Circle expands/contracts with breath; ring sweeps progress; color shifts per phase | `loop.js` — state machine driving radius, arc, hue |
| **Visual form** | Filled circle + progress ring + phase-colored background gradient | `loop.js` — `ctx.arc()` calls |
| **Readability test** | Tap → circle grows with color shift → ring sweeps → question appears. Legible in < 5 s | Self-evident |

### Breathing Levels
| Level | Inhale | Hold | Exhale | Purpose |
|-------|--------|------|--------|---------|
| Calm | 4 s | 4 s | 6 s | Gentle entry point |
| Balance | 4 s | 7 s | 8 s | Classic 4-7-8 anxiety technique |
| Deep | 5 s | 5 s | 8 s | Extended, meditative |

### Color Language
| Phase | Hue | Feeling |
|-------|-----|---------|
| Idle | Warm neutral (~30°) | Resting, present |
| Inhale | Cool teal (~190°) | Opening, receiving |
| Hold | Emerald-seafoam (~155°) | Stillness, calm |
| Exhale | Warm amber (~30°) | Releasing, grounding |
| Reflect | Soft lavender (~270°) | Honest, quiet |

## Taste Vow
No particle effects, no blending modes, no noise textures. Colors are muted and deliberate — each maps to a breath phase. The progress ring is functional, not decorative. The counter is informational, not gamified. Every visual decision traces to the breath state. If it doesn't serve the breath, remove it.
