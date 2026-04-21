---
id: feature-letter-match-g2b3
type: feature
title: Letter Match
status: draft
domain: games
schemaVersion: 2
priority: 2
tags: [alphabet, letters, reading, ages-4-7]
parent: feature-game-mechanics-shared-gx00
views:
  dev:
    componentFile: src/games/LetterMatch.tsx
  product:
    acceptanceCriteria:
      - A large uppercase letter is shown on screen
      - Four cards show pictures of familiar objects (e.g. A shows Apple, Ant, Boat, Car)
      - The child taps the picture whose name starts with the shown letter
      - Correct tap highlights the card green; wrong tap highlights red, child retries
      - All 26 letters included; order is randomized each session
      - Picture labels are always shown in text below the image (supports non-readers learning letter-word connection)
---

## user.userGuide

A big letter appears at the top — like **A** or **B** or **T**.
Four pictures appear below it. Each picture has its name written underneath.

Find the picture whose name starts with the same letter. Tap it.

The name is always written under the picture, so you can look at the first
letter of the word and compare it to the letter at the top.

## product.problem

Learning the alphabet isn't just about reciting A-B-C — it's about understanding
that letters represent sounds, and sounds make words. A child who can sing the
alphabet song might still not connect "A" with "apple."

Letter Match builds that bridge. A big letter, a set of pictures, and the question:
which one starts with this letter? The answer isn't a trick — it's right there in
the word written under the picture. The child just has to notice the first letter.

## product.successCriteria

A 4-year-old who knows a few letters can feel the satisfaction of matching "B" with
the picture of a Ball. A 7-year-old who knows all their letters flies through it
confidently. Both come away having practised the letter-sound connection in a
low-stakes, self-paced way.

## dev.implementation

`LetterMatch.tsx` follows the shared GameEngine contract. State shape:
- `letter: string` — current uppercase letter (A–Z)
- `choices: PictureCard[]` — four cards: one whose name starts with `letter`, three distractors
- `phase: 'playing' | 'correct' | 'advancing'`
- `wrongTaps: Set<string>` — tracks which card ids were tapped incorrectly

`PICTURE_BANK` maps each letter to 3–5 familiar nouns with short, phonetically clear names (e.g. A → Apple, Ant, Axe). Distractors are drawn from other letters, ensuring no accidental matches.

Each card renders: an SVG icon or emoji above the object's name in text. The name text is always visible — it's the scaffold that helps a non-reader cross-reference the first letter. Text is bold and large (24px+) to be legible on a small screen.

`generateQuestion(excludeLetter?)` picks a random letter (never the same as last), selects one correct picture and three random distractors, then shuffles.

## dev.edgeCases

Letters Q, X, Z have fewer common nouns — the picture bank for these may have only 2 options. The distractor pool draws from the full bank excluding the correct letter, so uniqueness is guaranteed. Letter order is fully randomised; there is no A→Z progression.
