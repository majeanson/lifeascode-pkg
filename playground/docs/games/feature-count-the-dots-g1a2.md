---
description: >-
  A young child learns to count by doing it again and again, in their own time,
---

# ⬡ Count the Dots

> **Feature** · Active · `counting` `numbers` `math` `ages-3-6`

![](<../.gitbook/assets/feature-count-the-dots-g1a2.png>)

{% tabs %}
{% tab title="For Players" %}
### How to Play

A card appears with dots on it — anywhere from one to ten.
Count the dots out loud or with your finger. When you know how many, tap
that number at the bottom of the screen.

The dots are big and easy to see. If you lose count, start again from the
beginning — the card stays until you answer.
{% endtab %}
{% tab title="Developer" %}
### Component File

`src/games/CountTheDots.tsx`

### Implementation

`CountTheDots.tsx` is a self-contained React component. State machine follows the shared GameEngine contract:
- `phase: 'playing' | 'correct' | 'advancing'`
- `wrongTaps: Set<number>` — tracks which wrong choices were tapped (stay red, stay disabled)
- On correct: phase → `'correct'`, card turns green, 1.5s timer → `'advancing'` → next question
- On wrong: adds to `wrongTaps`, choice goes red; other untapped choices remain active

Dots are rendered using a fixed `DOT_LAYOUTS` map (1–10) — each entry is `[col, row]` positions in a 3×3 or 4×3 grid, positioned absolutely inside a sized container.

`generateQuestion(excludeAnswer?)` picks a random answer 1–10 (never the same as last), then picks 3 random wrong choices from the remaining pool and shuffles all 4.
{% endtab %}
{% tab title="Product" %}
### Acceptance Criteria

* [ ] A card shows between 1 and 10 dots arranged in a simple pattern
* [ ] Four number buttons appear below (one correct, three wrong)
* [ ] Tapping the correct number turns the card green
* [ ] Tapping wrong turns the button red, card stays, child can try again
* [ ] After a correct answer, a new card appears automatically after 1.5 seconds
* [ ] No timer, no score pressure, no game over

### Problem

A young child learns to count by doing it again and again, in their own time,
without anyone rushing them. Most counting apps hurry children along with timers
and "lives" — the opposite of how learning actually works.

Count the Dots gives a child one question at a time. How many dots do you see?
They count. They tap. They're right or they try again. That's the whole game.
No ticking clock. No three strikes. Just a child and their counting.

### Success Criteria

{% hint style="success" %}
A 3-year-old who doesn't know any numbers yet can still play this game by
pointing and trying. A 6-year-old who knows their numbers up to 10 finds it
satisfying to get every one right. Both children close the app feeling good.
{% endhint %}
{% endtab %}
{% endtabs %}


---

## Relationships

**Part of:** [⬡ How All Quiet Minds Games Work](../games/feature-game-mechanics-shared-gx00.md)
