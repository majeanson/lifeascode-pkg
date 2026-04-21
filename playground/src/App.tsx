import React, { useState } from 'react'

// ─── palette (matches decision-accessible-palette-d3c4) ──────────────────────
const BG      = '#f9f7f2'
const SURFACE = '#ffffff'
const BORDER  = '#e0dbd3'
const TEXT     = '#1a1a2e'
const MUTED    = '#6b6570'
const ACCENT   = '#7ec8a4'
const ACCENT_DK = '#4da87e'
const DANGER   = '#c94040'

// ─── game registry ────────────────────────────────────────────────────────────
type GameId = 'count-the-dots' | 'letter-match' | 'shape-spotter' | 'color-corner' | 'what-comes-next'

interface GameMeta {
  id: GameId
  title: string
  emoji: string
  tagline: string
  ageRange: string
  lacNodeId: string
  status: 'coming-soon' | 'ready'
  component?: React.FC
}

const GAMES: GameMeta[] = [
  {
    id: 'count-the-dots',
    title: 'Count the Dots',
    emoji: '🟦',
    tagline: 'How many dots do you see? Count them and tap the right number.',
    ageRange: '3 – 6',
    lacNodeId: 'feature-count-the-dots-g1a2',
    status: 'coming-soon',
  },
  {
    id: 'letter-match',
    title: 'Letter Match',
    emoji: '🔤',
    tagline: 'A big letter appears. Which picture starts with that letter?',
    ageRange: '4 – 7',
    lacNodeId: 'feature-letter-match-g2b3',
    status: 'coming-soon',
  },
  {
    id: 'shape-spotter',
    title: 'Shape Spotter',
    emoji: '🔷',
    tagline: 'Six shapes on the screen. Can you find the triangle in the crowd?',
    ageRange: '3 – 6',
    lacNodeId: 'feature-shape-spotter-g3c4',
    status: 'coming-soon',
  },
  {
    id: 'color-corner',
    title: 'Color Corner',
    emoji: '🎨',
    tagline: 'A color name at the top. Tap the swatch that matches.',
    ageRange: '3 – 5',
    lacNodeId: 'feature-color-corner-g4d5',
    status: 'coming-soon',
  },
  {
    id: 'what-comes-next',
    title: 'What Comes Next?',
    emoji: '❓',
    tagline: 'Shapes in a row with a pattern. What belongs at the end?',
    ageRange: '4 – 7',
    lacNodeId: 'feature-what-comes-next-g5e6',
    status: 'coming-soon',
  },
]

// ─── styles (inline — no CSS deps per project conventions) ───────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: BG,
    color: TEXT,
    fontFamily: '"Georgia", "Times New Roman", serif',
    padding: '0',
    margin: '0',
  } as React.CSSProperties,

  header: {
    textAlign: 'center' as const,
    padding: '48px 24px 32px',
    borderBottom: `1px solid ${BORDER}`,
    background: SURFACE,
  },

  logo: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '12px',
  },

  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: TEXT,
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },

  subtitle: {
    fontSize: '16px',
    color: MUTED,
    margin: 0,
    fontStyle: 'italic',
    fontWeight: 400,
  },

  grid: {
    maxWidth: '640px',
    margin: '40px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },

  card: (active: boolean): React.CSSProperties => ({
    background: SURFACE,
    border: `1px solid ${active ? ACCENT : BORDER}`,
    borderRadius: '12px',
    padding: '20px 24px',
    cursor: active ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  }),

  cardEmoji: {
    fontSize: '36px',
    flexShrink: 0,
    width: '48px',
    textAlign: 'center' as const,
  },

  cardBody: {
    flex: 1,
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: TEXT,
    margin: '0 0 4px',
  },

  cardTagline: {
    fontSize: '14px',
    color: MUTED,
    margin: '0 0 8px',
    lineHeight: 1.5,
  },

  cardMeta: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },

  badge: (variant: 'age' | 'soon' | 'ready'): React.CSSProperties => ({
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
    background:
      variant === 'age'  ? 'rgba(126,200,164,0.15)' :
      variant === 'ready' ? ACCENT :
      'rgba(0,0,0,0.06)',
    color:
      variant === 'age'   ? ACCENT_DK :
      variant === 'ready' ? '#fff'    :
      MUTED,
    border:
      variant === 'age'   ? `1px solid rgba(126,200,164,0.3)` :
      variant === 'ready' ? 'none' :
      `1px solid ${BORDER}`,
  }),

  footer: {
    textAlign: 'center' as const,
    padding: '32px 24px 48px',
    fontSize: '13px',
    color: MUTED,
    borderTop: `1px solid ${BORDER}`,
    marginTop: '24px',
  },

  footerLink: {
    color: ACCENT_DK,
    textDecoration: 'none',
    fontWeight: 500,
  },

  comingSoonOverlay: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    padding: '40px 24px',
    textAlign: 'center' as const,
  },

  backBtn: {
    background: 'none',
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    color: MUTED,
    cursor: 'pointer',
    marginTop: '8px',
  },
}

// ─── game placeholder screen ──────────────────────────────────────────────────
function GamePlaceholder({ game, onBack }: { game: GameMeta; onBack: () => void }) {
  return (
    <div style={S.page}>
      <div style={{ ...S.header, textAlign: 'left', padding: '20px 24px' }}>
        <button style={S.backBtn} onClick={onBack}>← Back</button>
      </div>
      <div style={S.comingSoonOverlay}>
        <div style={{ fontSize: '56px' }}>{game.emoji}</div>
        <h2 style={{ ...S.title, fontSize: '24px' }}>{game.title}</h2>
        <p style={{ ...S.subtitle, maxWidth: '360px', fontSize: '15px', color: MUTED }}>
          {game.tagline}
        </p>
        <div style={{ marginTop: '8px', padding: '16px 24px', background: SURFACE, borderRadius: '10px', border: `1px solid ${BORDER}`, maxWidth: '360px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
            This game is being built openly.<br />
            <a
              href="#"
              style={S.footerLink}
              onClick={(e) => { e.preventDefault(); window.open('http://localhost:3737', '_blank') }}
            >
              See the story behind it →
            </a>
          </p>
        </div>
        <p style={{ fontSize: '12px', color: BORDER, marginTop: '4px' }}>
          LAC node: <code style={{ color: MUTED }}>{game.lacNodeId}</code>
        </p>
      </div>
    </div>
  )
}

// ─── home screen ──────────────────────────────────────────────────────────────
function Home({ onSelect }: { onSelect: (g: GameMeta) => void }) {
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.logo}>🌿</div>
        <h1 style={S.title}>Quiet Minds</h1>
        <p style={S.subtitle}>Calm educational games for curious little minds</p>
      </header>

      <div style={S.grid}>
        {GAMES.map((game) => (
          <div
            key={game.id}
            style={S.card(game.status === 'ready')}
            onClick={() => onSelect(game)}
            role="button"
            tabIndex={0}
            aria-label={game.title}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(game)}
          >
            <div style={S.cardEmoji}>{game.emoji}</div>
            <div style={S.cardBody}>
              <h2 style={S.cardTitle}>{game.title}</h2>
              <p style={S.cardTagline}>{game.tagline}</p>
              <div style={S.cardMeta}>
                <span style={S.badge('age')}>Ages {game.ageRange}</span>
                {game.status === 'coming-soon'
                  ? <span style={S.badge('soon')}>Coming soon</span>
                  : <span style={S.badge('ready')}>Play</span>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer style={S.footer}>
        No sound. No flash. No ads. No accounts.
        <br />
        <a
          href="http://localhost:3737"
          target="_blank"
          rel="noreferrer"
          style={S.footerLink}
        >
          How this was built →
        </a>
        {' '}(run <code>lac serve .</code> from playground/)
      </footer>
    </div>
  )
}

// ─── app root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selected, setSelected] = useState<GameMeta | null>(null)

  if (selected) {
    if (selected.status === 'ready' && selected.component) {
      const GameComponent = selected.component
      return <GameComponent />
    }
    return <GamePlaceholder game={selected} onBack={() => setSelected(null)} />
  }

  return <Home onSelect={setSelected} />
}
