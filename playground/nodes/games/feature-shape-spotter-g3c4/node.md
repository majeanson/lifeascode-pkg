---
id: feature-shape-spotter-g3c4
type: feature
title: Shape Spotter
status: draft
domain: games
schemaVersion: 2
priority: 3
tags: [shapes, geometry, visual, ages-3-6]
parent: feature-game-mechanics-shared-gx00
views:
  dev:
    componentFile: src/games/ShapeSpotter.tsx
  product:
    acceptanceCriteria:
      - A shape name is shown at the top (e.g. "Triangle")
      - A grid of 6 shapes is shown — one matches the named shape, five do not
      - Child taps the matching shape
      - Correct: gentle green highlight, next round after 1 second
      - Wrong: red highlight on tapped shape, others stay tappable
      - Shapes used: circle, square, triangle, rectangle, oval, star, heart, diamond
      - All shapes are outlined, not filled, so color is not the distinguishing factor
---

## user.userGuide

A shape name appears at the top — like **Triangle** or **Circle**.
Six shapes appear on the screen in a grid.

Find the shape that matches the name and tap it. Only one of the six is correct.

The shapes come in different sizes and orientations — a triangle might be
pointing up, down, or sideways. That's the challenge: recognising a shape
even when it looks a little different.

## product.problem

Young children encounter shapes everywhere — in building blocks, in picture books,
in the world around them. But naming a shape and recognising it in different sizes
and orientations are different skills.

Shape Spotter asks: can you find the triangle in a crowd of shapes? Not just once,
but when it's big, when it's small, when it's pointing left. The child isn't just
memorising a name — they're learning to see.

## product.successCriteria

A 3-year-old who only knows "circle" can still play and feel proud when they spot
the right one. A 6-year-old who knows all eight shapes enjoys the speed of scanning
and finding. The game never tells a child how many they got right — only whether
the current one is right or wrong.
