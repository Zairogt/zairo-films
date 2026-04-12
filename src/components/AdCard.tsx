import AdUnit from './AdUnit'

/**
 * AdCard — ocupa un slot del catálogo grid.
 * Slot "3719788706" → crear en AdSense como "Catálogo grid — Rectángulo" (300×250).
 */
export default function AdCard() {
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.04)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px 0',
    }}>
      {/* Badge "Publicidad" */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 2,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '3px 8px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '8px',
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#3d3a35',
      }}>
        Publicidad
      </div>

      {/* Rectángulo 300×250 — mejor formato pagador en móvil */}
      <AdUnit
        slot="8098206813"
        format="rectangle"
        style={{ width: 300, height: 250 }}
      />
    </div>
  )
}
