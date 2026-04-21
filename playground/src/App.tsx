import React, { useState } from 'react'
import {
  LacDataProvider,
  LacAbout,
  LacInheritedHelpButton,
  LacInheritedHelp,
  LacRoleView,
  LacRoleSwitcher,
  type AudienceRole,
} from '@lifeascode/lac'
import CountTheDots from './games/CountTheDots'

// ─── palette (from decision-accessible-palette-d3c4) ─────────────────────────
const C = {
  bg:       '#f9f7f2',
  surface:  '#ffffff',
  border:   '#e0dbd3',
  text:     '#1a1a2e',
  muted:    '#6b6570',
  accent:   '#7ec8a4',
  accentDk: '#4da87e',
}

const LAC_COLORS = { bg: C.bg, surface: C.surface, border: C.border, text: C.text, muted: C.muted, accent: C.accent }

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
  component?: React.FC<{ onBack?: () => void }>
}

const GAMES: GameMeta[] = [
  { id: 'count-the-dots',   title: 'Count the Dots',    emoji: '🔵', tagline: 'How many dots? Count and tap the right number.',        ageRange: '3 – 6', lacNodeId: 'feature-count-the-dots-g1a2',  status: 'ready', component: CountTheDots },
  { id: 'letter-match',     title: 'Letter Match',      emoji: '🔤', tagline: 'Which picture starts with this letter?',                 ageRange: '4 – 7', lacNodeId: 'feature-letter-match-g2b3',    status: 'coming-soon' },
  { id: 'shape-spotter',    title: 'Shape Spotter',     emoji: '🔷', tagline: 'Find the matching shape hidden in the grid.',            ageRange: '3 – 6', lacNodeId: 'feature-shape-spotter-g3c4',  status: 'coming-soon' },
  { id: 'color-corner',     title: 'Color Corner',      emoji: '🎨', tagline: 'A color name appears. Tap the right swatch.',            ageRange: '3 – 5', lacNodeId: 'feature-color-corner-g4d5',   status: 'coming-soon' },
  { id: 'what-comes-next',  title: 'What Comes Next?',  emoji: '❓', tagline: 'Shapes in a row with a pattern. What belongs at the end?', ageRange: '4 – 7', lacNodeId: 'feature-what-comes-next-g5e6', status: 'coming-soon' },
]

// ─── screen types ─────────────────────────────────────────────────────────────
type Screen = { type: 'home' } | { type: 'game'; game: GameMeta } | { type: 'about' } | { type: 'docs' }

// ─── styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page:    { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '"Georgia", serif', margin: 0, padding: 0 },
  header:  { textAlign: 'center', padding: '48px 24px 32px', borderBottom: `1px solid ${C.border}`, background: C.surface },
  grid:    { maxWidth: '640px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  card:    { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px' },
  footer:  { textAlign: 'center', padding: '32px 24px 48px', fontSize: '13px', color: C.muted, borderTop: `1px solid ${C.border}`, marginTop: '24px' },
  link:    { color: C.accentDk, textDecoration: 'none', fontWeight: 500, cursor: 'pointer' },
  backBtn: { background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 16px', fontSize: '14px', color: C.muted, cursor: 'pointer' },
  content: { maxWidth: '640px', margin: '0 auto', padding: '32px 20px' },
}

function Badge({ children, color = C.muted }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {children}
    </span>
  )
}

function NavBar({ onNavigate, screen }: { onNavigate: (s: Screen) => void; screen: Screen }) {
  const active = screen.type
  const items: Array<{ id: Screen['type']; label: string }> = [
    { id: 'home', label: 'Games' },
    { id: 'about', label: 'About' },
    { id: 'docs', label: 'Docs' },
  ]
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span style={{ fontWeight: 700, fontSize: '14px', color: C.text, marginRight: '16px', padding: '14px 0' }}>🌿 Quiet Minds</span>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate({ type: item.id } as Screen)}
          style={{ background: 'none', border: 'none', padding: '14px 12px', fontSize: '14px', cursor: 'pointer', color: active === item.id ? C.accentDk : C.muted, fontWeight: active === item.id ? 600 : 400, borderBottom: active === item.id ? `2px solid ${C.accent}` : '2px solid transparent' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ─── home screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={{ fontSize: '40px', lineHeight: 1, marginBottom: '12px' }}>🌿</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Quiet Minds</h1>
        <p style={{ fontSize: '16px', color: C.muted, margin: 0, fontStyle: 'italic' }}>Calm educational games for curious little minds</p>
      </header>

      <div style={S.grid}>
        {GAMES.map((game) => (
          <div
            key={game.id}
            style={{ ...S.card, cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate({ type: 'game', game })}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate({ type: 'game', game })}
          >
            <div style={{ fontSize: '36px', width: '48px', textAlign: 'center', flexShrink: 0 }}>{game.emoji}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px' }}>{game.title}</h2>
              <p style={{ fontSize: '14px', color: C.muted, margin: '0 0 8px', lineHeight: 1.5 }}>{game.tagline}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Badge color={C.accentDk}>Ages {game.ageRange}</Badge>
                {game.status === 'ready'
                  ? <Badge color={C.accent}>▶ Play</Badge>
                  : <Badge color={C.muted}>Coming soon</Badge>
                }
              </div>
            </div>
            {/* ? button — shows shared rules (parent) + this game's rules (child) */}
            <LacInheritedHelpButton
              nodeId={game.lacNodeId}
              role="user"
              allowRoleSwitch
              label="?"
              position="inline"
              colors={LAC_COLORS}
            />
          </div>
        ))}
      </div>

      <footer style={S.footer}>
        No sound · No flash · No ads · No accounts
        <br />
        <span
          style={S.link}
          onClick={() => onNavigate({ type: 'about' })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate({ type: 'about' })}
        >
          Why we built this →
        </span>
      </footer>
    </div>
  )
}

// ─── game placeholder / actual game screen ────────────────────────────────────
function GameScreen({ game, onBack }: { game: GameMeta; onBack: () => void }) {
  if (game.status === 'ready' && game.component) {
    const GameComponent = game.component
    return <GameComponent onBack={onBack} />
  }
  return (
    <div style={S.page}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <button style={S.backBtn} onClick={onBack}>← Back</button>
      </div>
      <div style={{ ...S.content, textAlign: 'center', paddingTop: '64px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>{game.emoji}</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>{game.title}</h2>
        <p style={{ fontSize: '16px', color: C.muted, maxWidth: '360px', margin: '0 auto 32px', lineHeight: 1.6 }}>{game.tagline}</p>

        {/* Inherited help — shows shared game rules then this game's specifics */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', textAlign: 'left', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: C.muted, marginBottom: '16px' }}>
            How to play
          </div>
          <LacInheritedHelp
            nodeId={game.lacNodeId}
            role="user"
            showRolePicker
            showConnector
            colors={LAC_COLORS}
          />
        </div>

        <p style={{ fontSize: '12px', color: C.border }}>
          <span style={{ color: C.muted }}>Being built openly. Node: </span>
          <code style={{ color: C.muted, fontSize: '11px' }}>{game.lacNodeId}</code>
        </p>
      </div>
    </div>
  )
}

// ─── about screen — full story, role-switchable ───────────────────────────────
function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={S.page}>
      <div style={S.content}>
        <LacAbout
          showRoleSwitcher
          layout="accordion"
          colors={LAC_COLORS}
        />
      </div>
    </div>
  )
}

// ─── docs screen — full role-based docs, all audiences ────────────────────────
function DocsScreen() {
  const [role, setRole] = useState<AudienceRole>('user')
  return (
    <div style={S.page}>
      <div style={S.content}>
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>Documentation</h2>
          <p style={{ fontSize: '14px', color: C.muted, margin: '0 0 20px' }}>
            Everything about Quiet Minds, filtered by who you are.
          </p>
          <LacRoleSwitcher value={role} onChange={setRole} colors={LAC_COLORS} />
        </div>
        <div style={{ marginTop: '32px' }}>
          <LacRoleView role={role} layout="accordion" colors={LAC_COLORS} />
        </div>
      </div>
    </div>
  )
}

// ─── app root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' })

  const navigate = (s: Screen) => setScreen(s)

  return (
    <LacDataProvider dataUrl="/.lac/graph.json" theme="light" themeOverrides={{ accent: C.accent }}>
      <NavBar onNavigate={navigate} screen={screen} />
      {screen.type === 'home'  && <HomeScreen onNavigate={navigate} />}
      {screen.type === 'game'  && <GameScreen game={screen.game} onBack={() => navigate({ type: 'home' })} />}
      {screen.type === 'about' && <AboutScreen onBack={() => navigate({ type: 'home' })} />}
      {screen.type === 'docs'  && <DocsScreen />}
    </LacDataProvider>
  )
}
