---
id: decision-accessible-palette-d3c4
type: decision
title: Accessible color palette — works for colorblind children
status: active
domain: design
schemaVersion: 2
priority: 3
tags: [accessibility, design, color, colorblindness]
---

## dev.choice

All meaningful color distinctions in the app must pass WCAG AA contrast (4.5:1 for
text, 3:1 for UI components) and must never rely on hue alone to convey meaning.
Every color-coded element also uses shape, label, or pattern as a secondary signal.

Palette: soft greens and blues as primary accents (#7ec8a4, #58a6ff), warm
off-white backgrounds (#f9f7f2), dark text (#1a1a2e). No pure red/green pairings.

## dev.rationale

Red-green colorblindness affects roughly 1 in 12 boys. In a color-matching game,
a child who can't distinguish red from green would fail not because they don't know
their colors, but because our design failed them.

Games that teach colors will use labels alongside swatches, and shapes will have
distinct outlines, not just fills. A child who is colorblind should be able to play
every game in this app.

## dev.edgeCases

The Color Corner game (which specifically teaches color names) will be reviewed
separately to ensure it is meaningful for colorblind children — likely by always
showing the color name label alongside the swatch.
