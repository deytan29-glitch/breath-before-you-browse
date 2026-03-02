# SYSTEM_CHARTER — Everyday Tools

## Tool Intent Statement: *Bloom — Your Focus Companion*

---

### 1. Core Function
A gamified companion that rewards the user each time they consciously resist a digital distraction or pause for a breath. A small plant grows alongside the user's practice — gaining XP, leveling up, sprouting leaves and eventually blooming — making each mindful choice feel tangible.

### 2. Human Context
The pull of notifications, feeds, and infinite scroll is constant. Most tools that fight distraction use restriction (blockers, timers, shame). Bloom takes the opposite approach: positive reinforcement. Instead of punishing the scroll, it celebrates the moment you chose not to. The plant is a living metaphor — your attention is soil; each resisted impulse is water.

### 3. Intended User
Someone who recognizes compulsive browsing in themselves and wants gentle encouragement — not surveillance. A student, a remote worker, anyone who has caught themselves mid-scroll and thought *"I didn't decide to do this."* They want a small ally, not a warden.

### 4. Behavioral Thesis
Positive reinforcement of the *decision not to act* can, over time, strengthen the pause between impulse and action. By making each conscious choice visible (XP, a growing plant, a streak), the user builds a sense of agency. The companion reframes restraint as care rather than deprivation.

### 5. Dignity Clause
- The user self-reports. Bloom never monitors, intercepts, or tracks app usage.
- No guilt language. Missing a day resets the streak quietly — no "you failed" message.
- All data stays in localStorage on the user's machine. Nothing is transmitted.
- The plant never dies or wilts. Progress pauses; it does not reverse.
- The user can reset at any time. The tool makes zero claims on permanence.

### 6. Refusal Clause
This tool will NOT become:
- A screen-time monitor, app blocker, or usage tracker.
- A social/competitive leaderboard ("your friends are Level 8").
- A notification sender. It runs only when the user opens it.
- A data collector. No analytics, no accounts, no server.
- A punishment system. The plant does not shrink or die.

### 7. Atmospheric Tone
Like watering a windowsill plant. Quiet satisfaction. The dark-green palette feels like a garden at dusk — alive but calm. Feedback is warm (+XP toast, gentle level-up), never loud. The companion smiles; it never demands. Growth is slow and honest.

---

## Design Contract

| Concept | Value | Where it lives |
|---------|-------|----------------|
| **Signal** | Button tap: "I resisted" / "Take a breath" | `app.js` — click handlers |
| **Parameter** | XP accumulation, level thresholds | `app.js` — `addXP()`, `xpForLevel()` |
| **Behavior** | Plant grows taller, gains leaves, blooms; XP bar fills; streak increments | `app.js` — `drawPlant()`, `render()` |
| **Visual form** | Canvas plant + progress ring; HTML XP bar, day row, streak | `app.js` + `index.html` |
| **Readability test** | Tap "I resisted" → toast appears, XP bar grows, plant visibly changes | Self-evident |

### Progression System
| Level | XP Required | Plant State |
|-------|-------------|-------------|
| 1 | 100 | Small bud, short stem |
| 2–4 | 140–274 | Taller stem, leaves appear |
| 5+ | 384+ | Flower blooms, petals grow |

### Companion Personality
| Moment | Response |
|--------|----------|
| Resist distraction | Random encouraging toast (+10 XP) |
| Take a breath | Calm acknowledgment (+5 XP) |
| Level up | "🌱 Level N! Your plant grew!" |
| Reset | "Fresh start! 🌱" (no guilt) |

## Taste Vow
No punishment, no withering, no shame. The plant only grows — never shrinks. Colors are earthy greens, not neon gamification. The XP bar is honest, not manipulative (no "almost there!" nudges). Toasts disappear quietly. The companion celebrates; it never nags.
