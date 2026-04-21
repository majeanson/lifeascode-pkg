---
description: >-
  Children learn at their own pace. A game that rushes a child, punishes mistakes
---

# ⬡ How All Quiet Minds Games Work

> **Feature** · Active · `mechanics` `shared` `base` `all-games`

{% tabs %}
{% tab title="For Players" %}
### How to Play

Every game in Quiet Minds works the same way.

You see something to think about — it might be a number to count, a letter
to match, a shape to find, a color to name, or a pattern to continue.

Below it are a few choices. Tap the one you think is right.

If you're right, it turns green and a new question appears after a moment.
If you're wrong, it turns red and you can try again, as many times as you need.

There's no timer. No score. No game over. Just the question and all the time
in the world to think about it.
{% endtab %}
{% tab title="Developer" %}
### Component File

`src/games/shared/GameEngine.tsx`

### Implementation

All games follow the same state machine, implemented once in GameEngine.tsx:

1. **generate** — create a new question (randomized, never the same as last)
2. **present** — show the question card and N answer choices
3. **await** — wait for a tap, disable after selection
4. **evaluate** — correct → green highlight; wrong → red highlight on tapped choice
5. **advance** — after correct: delay 1.5s → back to generate
6. **retry** — after wrong: re-enable other choices, keep question visible

Individual games implement only the question generator and the renderer.
The engine handles all state transitions, timing, and accessibility.

### Edge Cases

Each child game may override the advance delay (default 1.5s) for their game
feel. Count the Dots uses 1.5s; What Comes Next? uses 2s to let the child see
the completed pattern. Override via the `advanceDelay` prop on GameEngine.
{% endtab %}
{% tab title="Product" %}
### Problem

Children learn at their own pace. A game that rushes a child, punishes mistakes
harshly, or shows a "Game Over" screen is not designed for learning — it's designed
for engagement metrics. Every Quiet Minds game is built on the opposite principles.

The shared mechanics exist so that once a child learns how one game works, they
know how all of them work. No new rules to figure out, no new interface to learn.
Just a new thing to think about.

### Acceptance Criteria

* [ ] One question at a time — never multiple simultaneous
* [ ] Tap to answer — no dragging, no typing, no keyboard
* [ ] Correct answer turns green; wrong answer turns red (retry immediately)
* [ ] No timer — a child can take as long as they need
* [ ] No score — there is nothing to win or lose
* [ ] No game over — the game never ends on its own
* [ ] A correct answer automatically advances after 1.5 seconds
* [ ] Wrong answers never lock the child out — always another try
{% endtab %}
{% endtabs %}


---

## Relationships

**Includes:**
* [⬡ Color Corner](../games/feature-color-corner-g4d5.md)
* [⬡ Count the Dots](../games/feature-count-the-dots-g1a2.md)
* [⬡ Letter Match](../games/feature-letter-match-g2b3.md)
* [⬡ Shape Spotter](../games/feature-shape-spotter-g3c4.md)
* [⬡ What Comes Next?](../games/feature-what-comes-next-g5e6.md)
