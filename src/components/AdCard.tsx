/**
 * AdCard — ocupa un slot del catálogo grid.
 * En producción: reemplazar el interior con el script de Google AdSense.
 * El contenedor mantiene la misma estructura que MovieCard para no romper el grid.
 */
export default function AdCard() {
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.04)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Badge "Publicidad" */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 2,
        background: 'rgba(0,0,0,0.7)',
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

      {/* Área del anuncio — reemplazar con AdSense unit */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',  /* mismo ratio que los thumbnails */
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        position: 'relative',
      }}>
        {/* Patrón sutil de fondo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.01) 41px)',
        }} />

        {/* Placeholder AdSense */}
        {/* PRODUCCIÓN: <ins className="adsbygoogle" ... /> */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            margin: '0 auto 12px',
          }} />
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#2e2b26',
          }}>
            Google AdSense
          </p>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '13px',
            fontStyle: 'italic',
            color: '#2e2b26',
            marginTop: '4px',
          }}>
            Espacio publicitario
          </p>
        </div>
      </div>

      {/* Barra inferior — misma altura que MovieCard info */}
      <div style={{
        padding: '14px 16px 12px',
        borderTop: '2px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#2e2b26',
        }} />
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          color: '#2e2b26',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Anuncio
        </span>
      </div>
    </div>
  )
}
