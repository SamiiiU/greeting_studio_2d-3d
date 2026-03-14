/**
 * Toolbar.jsx
 * Floating toolbar that lets the user pick between Circle and Square tools.
 * Styled with a luxe dark-gold aesthetic to match the Eid theme.
 */
import React from 'react'

const TOOLS = [
  {
    id: 'square',
    label: 'Cube',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="2" width="18" height="18" rx="2" />
        <line x1="2" y1="7" x2="20" y2="7" strokeOpacity="0.5" />
        <line x1="7" y1="2" x2="7" y2="20" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'circle',
    label: 'Sphere',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="9" />
        <ellipse cx="11" cy="11" rx="9" ry="4" strokeOpacity="0.5" />
        <line x1="11" y1="2" x2="11" y2="20" strokeOpacity="0.5" />
      </svg>
    ),
  },
]

export default function Toolbar({ activeTool, onToolChange, objectCount, onClear }) {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '0',
        padding: isMobile ? '10px 12px' : '12px 24px',
        background: 'linear-gradient(to bottom, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.6) 100%)',
        borderBottom: '1px solid rgba(251,191,36,0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Branding */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: '"Cinzel Decorative", serif',
          fontSize: isMobile ? '11px' : '13px',
          color: '#fbbf24',
          letterSpacing: '0.08em',
          textShadow: '0 0 20px rgba(251,191,36,0.5)',
        }}>
          ✦ Eid Greeting Studio
        </span>
        <span style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: isMobile ? '10px' : '11px',
          color: 'rgba(232,228,240,0.4)',
          letterSpacing: '0.12em',
          marginTop: '2px',
        }}>
          Draw a shape · Click to reveal
        </span>
      </div>

      {/* Tool buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          width: isMobile ? '100%' : 'auto',
        }}
      >
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn${activeTool === tool.id ? ' active' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={`Draw ${tool.label}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              justifyContent: 'center',
              minHeight: isMobile ? '44px' : 'auto',
              minWidth: isMobile ? '0' : 'auto',
              flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto',
              padding: isMobile ? '10px 12px' : '8px 16px',
              background: activeTool === tool.id
                ? 'rgba(251,191,36,0.08)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeTool === tool.id ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              color: activeTool === tool.id ? '#fbbf24' : 'rgba(232,228,240,0.55)',
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: isMobile ? '14px' : '13px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              fontWeight: activeTool === tool.id ? 600 : 400,
            }}
          >
            {tool.icon}
            {tool.label}
          </button>
        ))}

        {/* Divider */}
        {objectCount > 0 && (
          <>
            {!isMobile && <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />}
            <button
              onClick={onClear}
              title="Clear scene"
              style={{
                minHeight: isMobile ? '44px' : 'auto',
                width: isMobile ? '100%' : 'auto',
                padding: isMobile ? '10px 14px' : '8px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: 'rgba(232,228,240,0.35)',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: isMobile ? '13px' : '12px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f87171'
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(232,228,240,0.35)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              ✕ Clear ({objectCount})
            </button>
          </>
        )}
      </div>

      {/* Hint */}
      {!isMobile && (
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '12px',
          color: 'rgba(232,228,240,0.3)',
          letterSpacing: '0.1em',
          fontStyle: 'italic',
        }}>
          Click objects to open them ✦
        </div>
      )}
    </div>
  )
}
