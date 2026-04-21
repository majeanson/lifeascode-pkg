---
id: decision-no-animation-d2b3
type: decision
title: No flashing or distracting animation
status: active
domain: design
schemaVersion: 2
priority: 2
tags: [accessibility, policy, animation, epilepsy]
references:
  - feature-game-mechanics-shared-gx00
---

## dev.choice

No flashing elements. No rapidly changing colors. No spinning, bouncing, or
pulsing animations that repeat more than once. Transitions between screens may
use a single, slow fade (max 200ms, no repeat). Correct/incorrect feedback
uses color change only — never motion.

## dev.rationale

Flashing content between 3–50 Hz can trigger seizures in children with
photosensitive epilepsy. Even below that threshold, rapid animations are
stimulating and distract from the learning task.

This app should feel calm. The absence of animation is a feature, not a
limitation. When a child gets an answer right, a gentle color change is enough.
They don't need confetti.

## dev.edgeCases

The single-fade transition is permitted because it is slow, one-directional, and
does not repeat. Any animation added in future must be reviewed against WCAG 2.3.1
(Three Flashes) before merging.
