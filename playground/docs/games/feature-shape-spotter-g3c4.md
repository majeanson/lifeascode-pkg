---
description: >-
  Young children encounter shapes everywhere — in building blocks, in picture books,
---

# ⬡ Shape Spotter

> **Feature** · Draft · `shapes` `geometry` `visual` `ages-3-6`

![](<../.gitbook/assets/feature-shape-spotter-g3c4.png>)

{% tabs %}
{% tab title="For Players" %}
### How to Play

A shape name appears at the top — like **Triangle** or **Circle**.
Six shapes appear on the screen in a grid.

Find the shape that matches the name and tap it. Only one of the six is correct.

The shapes come in different sizes and orientations — a triangle might be
pointing up, down, or sideways. That's the challenge: recognising a shape
even when it looks a little different.
{% endtab %}
{% tab title="Developer" %}
### Component File

`src/games/ShapeSpotter.tsx`

### Implementation

`ShapeSpotter.tsx` follows the shared GameEngine contract. State shape:
- `targetShape: ShapeName` — the shape to find (shown as text at the top)
- `grid: ShapeCard[]` — 6 items: 1 correct + 5 distractors
- `phase: 'playing' | 'correct' | 'advancing'`
- `wrongTaps: Set<number>` — index of incorrectly tapped cells

Shapes are rendered as inline SVGs, not images, so they scale cleanly and are themeable. Each shape has 3–5 pre-defined size/rotation variants — `ShapeSpotter` picks one at random per round so the same shape never looks identical twice. This teaches generalisation: a rotated triangle is still a triangle.

All shapes are **outlined only** (stroke, no fill) per the accessible-palette decision (decision-accessible-palette-d3c4). Colorblind children identify shapes by outline, never by fill color.

`generateQuestion(excludeShape?)` picks a random target shape, selects a random variant for the correct card, and fills the remaining 5 cells with distinct shape types (no two identical shapes in the same grid).

### Edge Cases

With 8 shape types and a 6-cell grid, there are always enough distinct distractors. The target shape's variant is excluded from the distractor pool to avoid the edge case where a child taps the "wrong" instance of the correct shape.
{% endtab %}
{% tab title="Product" %}
### Acceptance Criteria

* [ ] A shape name is shown at the top (e.g. "Triangle")
* [ ] A grid of 6 shapes is shown — one matches the named shape, five do not
* [ ] Child taps the matching shape
* [ ] [object Object]
* [ ] [object Object]
* [ ] [object Object]
* [ ] All shapes are outlined, not filled, so color is not the distinguishing factor

### Problem

Young children encounter shapes everywhere — in building blocks, in picture books,
in the world around them. But naming a shape and recognising it in different sizes
and orientations are different skills.

Shape Spotter asks: can you find the triangle in a crowd of shapes? Not just once,
but when it's big, when it's small, when it's pointing left. The child isn't just
memorising a name — they're learning to see.

### Success Criteria

{% hint style="success" %}
A 3-year-old who only knows "circle" can still play and feel proud when they spot
the right one. A 6-year-old who knows all eight shapes enjoys the speed of scanning
and finding. The game never tells a child how many they got right — only whether
the current one is right or wrong.
{% endhint %}
{% endtab %}
{% endtabs %}


---

## Relationships

**Part of:** [⬡ How All Quiet Minds Games Work](../games/feature-game-mechanics-shared-gx00.md)
