---
id: feature-color-corner-g4d5
type: feature
title: Color Corner
status: draft
domain: games
schemaVersion: 2
priority: 4
tags: [colors, visual, ages-3-5]
parent: epic-quiet-minds-v1x0
views:
  dev:
    componentFile: src/games/ColorCorner.tsx
  product:
    acceptanceCriteria:
      - A color name is shown at the top (e.g. "Blue")
      - Four large color swatches appear, each with the color name written inside
      - Child taps the swatch that matches the named color
      - Correct: green border appears, next round after 1 second
      - Wrong: red border on tapped swatch, others stay tappable
      - Colors included: red, orange, yellow, green, blue, purple, pink, brown, black, white
      - Color name is always shown in the swatch (accessible for colorblind children per decision-accessible-palette-d3c4)
---

## product.problem

Colors are one of the first things children learn to name — but confusing blue and
purple, or orange and red, is completely normal at age 3 or 4. The only way to
get it right is practice with feedback.

Color Corner is that practice. A color name, four swatches, one right answer.
Because the name is written inside every swatch, a child who can read a little
can double-check themselves. A child who can't yet read learns by the process of
elimination and memory.

## product.successCriteria

A 3-year-old who knows red and blue can play confidently and learn the others
over time. The game never hides the color name — it's always right there, so the
child is never guessing blindly. They're building a real connection between the
word and the color.
