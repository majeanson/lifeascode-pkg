# ⚖ No audio — ever

**Type:** Decision · **Status:** Active · **Domain:** design · **Tags:** accessibility, policy, audio · **Priority:** 1

---

## Developer

### Decision

Zero audio output across the entire app. No sound effects, no background music,
no text-to-speech, no feedback beeps. The app is permanently silent.

### Rationale

Children use tablets in libraries, in cars, in bedrooms while siblings sleep,
in waiting rooms. A parent or grandparent should never need to reach for a volume
button. The app should be safe to open anywhere, any time, without warning.

Beyond convenience: children with sensory sensitivities or hearing aids often
have a worse experience with apps that rely on audio cues. Removing audio entirely
levels the field — every child gets the same experience.

This decision is permanent and non-negotiable. Any future feature proposal that
requires audio will be rejected or redesigned.

### Edge Cases

If a future accessibility review recommends optional audio (e.g. read-aloud for
non-readers), we will revisit this as a separate decision node before implementing.
The default remains: silent.
