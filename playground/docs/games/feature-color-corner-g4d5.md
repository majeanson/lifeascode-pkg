---
description: >-
  Colors are one of the first things children learn to name — but confusing blue and
---

# ⬡ Color Corner

> **Feature** · Draft · `colors` `visual` `ages-3-5`

![](<../.gitbook/assets/feature-color-corner-g4d5.png>)

{% tabs %}
{% tab title="For Players" %}
### How to Play

A color name appears at the top — like **Blue** or **Orange**.
Four big color swatches appear below it, each with its name written inside.

Tap the swatch that matches the color named at the top.

Because the name is written inside every swatch, you can always double-check:
find the swatch whose name matches the word at the top. This helps children
connect the word they see with the color they're learning to recognise.
{% endtab %}
{% tab title="Developer" %}
### Component File

`src/games/ColorCorner.tsx`

### Implementation

`ColorCorner.tsx` follows the shared GameEngine contract. State shape:
- `targetColor: ColorEntry` — `{ name: string, hex: string, textColor: '#1a1a2e' | '#ffffff' }`
- `choices: ColorEntry[]` — 4 swatches including the correct one, shuffled
- `phase: 'playing' | 'correct' | 'advancing'`
- `wrongTaps: Set<string>` — color names that were tapped incorrectly

`COLOR_BANK` defines 10 colors: red, orange, yellow, green, blue, purple, pink, brown, black, white. Each entry includes a perceptually clear hex value and the text color that gives sufficient WCAG contrast against that background.

Each swatch is a large rounded rectangle (full-width on mobile, ~2:1 aspect) filled with the color. The color name is always printed in large text inside the swatch — this is the key accessibility feature per decision-accessible-palette-d3c4. The target color name is shown in larger text above all swatches.

`generateQuestion(excludeColor?)` picks a random target color (never the same as last) and 3 random distractors from the remaining pool.

### Edge Cases

Black and white swatches need careful text contrast — white text on black, black text on white. The `textColor` field on each `ColorEntry` handles this explicitly rather than computing contrast at runtime.
{% endtab %}
{% tab title="Product" %}
### Acceptance Criteria

* [ ] A color name is shown at the top (e.g. "Blue")
* [ ] Four large color swatches appear, each with the color name written inside
* [ ] Child taps the swatch that matches the named color
* [ ] [object Object]
* [ ] [object Object]
* [ ] [object Object]
* [ ] Color name is always shown in the swatch (accessible for colorblind children per decision-accessible-palette-d3c4)

### Problem

Colors are one of the first things children learn to name — but confusing blue and
purple, or orange and red, is completely normal at age 3 or 4. The only way to
get it right is practice with feedback.

Color Corner is that practice. A color name, four swatches, one right answer.
Because the name is written inside every swatch, a child who can read a little
can double-check themselves. A child who can't yet read learns by the process of
elimination and memory.

### Success Criteria

{% hint style="success" %}
A 3-year-old who knows red and blue can play confidently and learn the others
over time. The game never hides the color name — it's always right there, so the
child is never guessing blindly. They're building a real connection between the
word and the color.
{% endhint %}
{% endtab %}
{% endtabs %}


---

## Relationships

**Part of:** [⬡ How All Quiet Minds Games Work](../games/feature-game-mechanics-shared-gx00.md)
