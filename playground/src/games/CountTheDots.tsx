import React, { useState, useEffect, useCallback } from 'react'

// ─── palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#f9f7f2',
  surface:  '#ffffff',
  border:   '#e0dbd3',
  text:     '#1a1a2e',
  muted:    '#6b6570',
  accent:   '#7ec8a4',
  correct:  '#7ec8a4',
  wrong:    '#e07070',
}

// ─── dot layout maps (1–10) ───────────────────────────────────────────────────
// Each entry is an array of [col, row] positions (0-indexed) in a 4×3 grid
const DOT_LAYOUTS: Record<number, [number, number][]> = {
  1:  [[1, 1]],
  2:  [[0, 0], [2, 2]],
  3:  [[0, 0], [1, 1], [2, 2]],
  4:  [[0, 0], [2, 0], [0, 2], [2, 2]],
  5:  [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6:  [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  7:  [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]],
  8:  [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  9:  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  10: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2]],
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestion(excludeAnswer?: number): { answer: number; choices: number[] } {
  let answer: number
  do {
    answer = Math.floor(Math.random() * 10) + 1
  } while (answer === excludeAnswer)

  const pool = Array.from({ length: 10 }, (_, i) => i + 1).filter((n) => n !== answer)
  const wrong = shuffle(pool).slice(0, 3)
  const choices = shuffle([answer, ...wrong])
  return { answer, choices }
}

// ─── dot card ─────────────────────────────────────────────────────────────────
function DotCard({ count, highlight }: { count: number; highlight: 'none' | 'correct' | 'wrong' }) {
  const layout = DOT_LAYOUTS[count]
  const cols = count === 10 ? 4 : 3
  const rows = 3
  const dotSize = 28
  const gap = 16
  const gridW = cols * dotSize + (cols - 1) * gap
  const gridH = rows * dotSize + (rows - 1) * gap

  const borderColor = highlight === 'correct' ? C.correct : highlight === 'wrong' ? C.wrong : C.border
  const bgColor = highlight === 'correct' ? `${C.correct}18` : highlight === 'wrong' ? `${C.wrong}10` : C.surface

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '20px',
        padding: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.25s ease, border-color 0.25s ease',
        minHeight: '200px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: gridW,
          height: gridH,
        }}
      >
        {layout.map(([col, row], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: col * (dotSize + gap),
              top: row * (dotSize + gap),
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: highlight === 'correct' ? C.correct : C.text,
              transition: 'background 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── choice button ────────────────────────────────────────────────────────────
function ChoiceButton({
  value,
  state,
  disabled,
  onClick,
}: {
  value: number
  state: 'idle' | 'correct' | 'wrong'
  disabled: boolean
  onClick: () => void
}) {
  const bg =
    state === 'correct' ? C.correct :
    state === 'wrong'   ? C.wrong :
    C.surface

  const textColor =
    state === 'correct' ? '#fff' :
    state === 'wrong'   ? '#fff' :
    C.text

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '20px 0',
        fontSize: '26px',
        fontWeight: 700,
        fontFamily: '"Georgia", serif',
        background: bg,
        color: textColor,
        border: `2px solid ${state !== 'idle' ? bg : C.border}`,
        borderRadius: '14px',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        opacity: disabled && state === 'idle' ? 0.4 : 1,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {value}
    </button>
  )
}

// ─── main game ────────────────────────────────────────────────────────────────
export default function CountTheDots({ onBack }: { onBack?: () => void }) {
  const [question, setQuestion] = useState(() => generateQuestion())
  const [phase, setPhase] = useState<'playing' | 'correct' | 'advancing'>('playing')
  const [wrongTaps, setWrongTaps] = useState<Set<number>>(new Set())

  const nextQuestion = useCallback(() => {
    setQuestion((prev) => generateQuestion(prev.answer))
    setPhase('playing')
    setWrongTaps(new Set())
  }, [])

  const handleChoice = useCallback((value: number) => {
    if (phase !== 'playing') return

    if (value === question.answer) {
      setPhase('correct')
    } else {
      setWrongTaps((prev) => new Set(prev).add(value))
    }
  }, [phase, question.answer])

  useEffect(() => {
    if (phase !== 'correct') return
    const id = setTimeout(() => {
      setPhase('advancing')
      setTimeout(nextQuestion, 200)
    }, 1500)
    return () => clearTimeout(id)
  }, [phase, nextQuestion])

  const cardHighlight =
    phase === 'correct' || phase === 'advancing' ? 'correct' : 'none'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 16px', fontSize: '14px', color: C.muted, cursor: 'pointer' }}
          >
            ← Back
          </button>
        )}
        <span style={{ fontWeight: 700, fontSize: '16px', color: C.text }}>🔵 Count the Dots</span>
        <span style={{ fontSize: '13px', color: C.muted, marginLeft: 'auto', fontStyle: 'italic' }}>No timer · No score · No game over</span>
      </div>

      {/* game area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '32px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        {/* prompt */}
        <p style={{ fontSize: '18px', color: C.muted, margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
          How many dots do you see?
        </p>

        {/* dot card */}
        <div style={{ width: '100%' }}>
          <DotCard count={question.answer} highlight={cardHighlight} />
        </div>

        {/* choices */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          {question.choices.map((value) => {
            const isCorrectChoice = value === question.answer
            const isWrongTapped = wrongTaps.has(value)
            const state =
              (phase === 'correct' || phase === 'advancing') && isCorrectChoice ? 'correct' :
              isWrongTapped ? 'wrong' :
              'idle'
            const disabled =
              isWrongTapped ||
              phase === 'correct' ||
              phase === 'advancing'

            return (
              <ChoiceButton
                key={value}
                value={value}
                state={state}
                disabled={disabled}
                onClick={() => handleChoice(value)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
