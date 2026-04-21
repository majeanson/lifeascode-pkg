---
description: >-
  Patterns are the foundation of mathematical thinking. Before a child can add or
---

# ⬡ What Comes Next?

> **Feature** · Draft · `patterns` `logic` `sequencing` `ages-4-7`

![](<../.gitbook/assets/feature-what-comes-next-g5e6.png>)

{% tabs %}
{% tab title="For Players" %}
### How to Play

A row of shapes or colors appears with a question mark at the end.
Look at the shapes from left to right. Can you see the pattern?

Three choices appear below. Tap the one that continues the pattern correctly.

When you get it right, the completed pattern is shown for a moment before
the next one appears — so you can see the full sequence and feel the pattern
click into place.

The patterns start simple (two shapes that repeat) and gradually become
more interesting (three shapes, or pairs that repeat).
{% endtab %}
{% tab title="Developer" %}
### Component File

`src/games/WhatComesNext.tsx`

### Implementation

`WhatComesNext.tsx` follows the shared GameEngine contract with a custom advance delay of 2 seconds (to let the child see the completed pattern).

Patterns are defined by a `PatternTemplate`: a rule like `AB`, `ABC`, or `AABB` applied to a randomly chosen set of distinct shapes or colors. A pattern with rule `AB` over `[circle, square]` produces `[circle, square, circle, square, ?]`.

State shape:
- `pattern: PatternTemplate` — defines the rule and elements
- `sequence: PatternItem[]` — the 4 visible items before `?`
- `correctAnswer: PatternItem` — the item that fills position 5
- `choices: PatternItem[]` — 3 options (correct + 2 plausible wrong answers)
- `phase` + `wrongTaps` — per GameEngine contract

`sessionComplexity` is a session-level counter (not persisted) that starts at 0 and increments by 1 every 3 correct answers, capped at 2. It maps to: 0 → AB only, 1 → AB + AABB, 2 → AB + AABB + ABC. This creates a gentle, automatic difficulty ramp with no UI controls.

Wrong answer choices are other shapes/colors that appear in the visible sequence (plausible) rather than completely random distractors, making the game cognitively honest.

### Edge Cases

Advancing complexity is session-scoped and resets on page reload — intentional. There is no "level" to unlock or persist. A child who plays every day will naturally pace themselves.
{% endtab %}
{% tab title="Product" %}
### Acceptance Criteria

* [ ] A row of 4 shapes or colors is shown with a "?" at the end (e.g. circle, square, circle, square, ?)
* [ ] Three answer choices appear below
* [ ] Child taps the shape or color that completes the pattern
* [ ] Correct: green highlight, explanation shown (e.g. 'circle square circle square'), next round after 2 seconds
* [ ] [object Object]
* [ ] Patterns progress from AB (2-element repeat) to ABC and AABB as the session continues
* [ ] No levels, no difficulty selector — the game gently increases complexity automatically

### Problem

Patterns are the foundation of mathematical thinking. Before a child can add or
subtract, they need to see that the world has structure — that things repeat,
that sequences have rules, that "what comes next" is a question with a correct answer.

What Comes Next? builds that intuition through play. The child sees a row of shapes
or colors and has to figure out the rule. When they get it right, the game briefly
shows why — not as a lecture, but as a gentle "yes, and here's the pattern you spotted."

### Success Criteria

{% hint style="success" %}
A 4-year-old can recognise a simple AB pattern (circle, square, circle, square)
without any explanation — they just feel it. A 7-year-old tackles AABB and ABC
patterns with the satisfaction of a puzzle solved. Both children are building
logical thinking without knowing it.
{% endhint %}
{% endtab %}
{% endtabs %}


---

## Relationships

**Part of:** [⬡ How All Quiet Minds Games Work](../games/feature-game-mechanics-shared-gx00.md)
