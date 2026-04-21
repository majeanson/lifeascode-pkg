---
description: Learning the alphabet isn't just about reciting A-B-C — it's about understanding
---

# ⬡ Letter Match

**Type:** Feature · **Status:** Draft · **Domain:** games · **Tags:** alphabet, letters, reading, ages-4-7 · **Priority:** 2

---

## User Guide

### How to Use

A big letter appears at the top — like **A** or **B** or **T**.
Four pictures appear below it. Each picture has its name written underneath.

Find the picture whose name starts with the same letter. Tap it.

The name is always written under the picture, so you can look at the first
letter of the word and compare it to the letter at the top.

## Developer

### Component File

src/games/LetterMatch.tsx

## Product

### Acceptance Criteria

* A large uppercase letter is shown on screen
* Four cards show pictures of familiar objects (e.g. A shows Apple, Ant, Boat, Car)
* The child taps the picture whose name starts with the shown letter
* Correct tap highlights the card green; wrong tap highlights red, child retries
* All 26 letters included; order is randomized each session
* Picture labels are always shown in text below the image (supports non-readers learning letter-word connection)

### Problem

Learning the alphabet isn't just about reciting A-B-C — it's about understanding
that letters represent sounds, and sounds make words. A child who can sing the
alphabet song might still not connect "A" with "apple."

Letter Match builds that bridge. A big letter, a set of pictures, and the question:
which one starts with this letter? The answer isn't a trick — it's right there in
the word written under the picture. The child just has to notice the first letter.

### Success Criteria

A 4-year-old who knows a few letters can feel the satisfaction of matching "B" with
the picture of a Ball. A 7-year-old who knows all their letters flies through it
confidently. Both come away having practised the letter-sound connection in a
low-stakes, self-paced way.

---

## Relationships

**Inherits from:** [How All Quiet Minds Games Work](../games/feature-game-mechanics-shared-gx00.md)
