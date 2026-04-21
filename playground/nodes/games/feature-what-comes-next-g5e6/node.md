---
id: feature-what-comes-next-g5e6
type: feature
title: What Comes Next?
status: draft
domain: games
schemaVersion: 2
priority: 5
tags: [patterns, logic, sequencing, ages-4-7]
parent: feature-game-mechanics-shared-gx00
views:
  dev:
    componentFile: src/games/WhatComesNext.tsx
  product:
    acceptanceCriteria:
      - A row of 4 shapes or colors is shown with a "?" at the end (e.g. circle, square, circle, square, ?)
      - Three answer choices appear below
      - Child taps the shape or color that completes the pattern
      - "Correct: green highlight, explanation shown (e.g. 'circle square circle square'), next round after 2 seconds"
      - Wrong: red border, child retries
      - Patterns progress from AB (2-element repeat) to ABC and AABB as the session continues
      - No levels, no difficulty selector — the game gently increases complexity automatically
---

## user.userGuide

A row of shapes or colors appears with a question mark at the end.
Look at the shapes from left to right. Can you see the pattern?

Three choices appear below. Tap the one that continues the pattern correctly.

When you get it right, the completed pattern is shown for a moment before
the next one appears — so you can see the full sequence and feel the pattern
click into place.

The patterns start simple (two shapes that repeat) and gradually become
more interesting (three shapes, or pairs that repeat).

## product.problem

Patterns are the foundation of mathematical thinking. Before a child can add or
subtract, they need to see that the world has structure — that things repeat,
that sequences have rules, that "what comes next" is a question with a correct answer.

What Comes Next? builds that intuition through play. The child sees a row of shapes
or colors and has to figure out the rule. When they get it right, the game briefly
shows why — not as a lecture, but as a gentle "yes, and here's the pattern you spotted."

## product.successCriteria

A 4-year-old can recognise a simple AB pattern (circle, square, circle, square)
without any explanation — they just feel it. A 7-year-old tackles AABB and ABC
patterns with the satisfaction of a puzzle solved. Both children are building
logical thinking without knowing it.
