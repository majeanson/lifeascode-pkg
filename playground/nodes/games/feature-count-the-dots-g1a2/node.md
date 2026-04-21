---
id: feature-count-the-dots-g1a2
type: feature
title: Count the Dots
status: draft
domain: games
schemaVersion: 2
priority: 1
tags: [counting, numbers, math, ages-3-6]
parent: epic-quiet-minds-v1x0
views:
  dev:
    componentFile: src/games/CountTheDots.tsx
  product:
    acceptanceCriteria:
      - A card shows between 1 and 10 dots arranged in a simple pattern
      - Four number buttons appear below (one correct, three wrong)
      - Tapping the correct number turns the card green
      - Tapping wrong turns the button red, card stays, child can try again
      - After a correct answer, a new card appears automatically after 1.5 seconds
      - No timer, no score pressure, no game over
---

## product.problem

A young child learns to count by doing it again and again, in their own time,
without anyone rushing them. Most counting apps hurry children along with timers
and "lives" — the opposite of how learning actually works.

Count the Dots gives a child one question at a time. How many dots do you see?
They count. They tap. They're right or they try again. That's the whole game.
No ticking clock. No three strikes. Just a child and their counting.

## product.successCriteria

A 3-year-old who doesn't know any numbers yet can still play this game by
pointing and trying. A 6-year-old who knows their numbers up to 10 finds it
satisfying to get every one right. Both children close the app feeling good.
