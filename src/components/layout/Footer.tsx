import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: 'clamp(32px, 5vw, 48px) clamp(20px, 4vw, 48px)',
      marginTop: 'auto',
    }}>
      <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px', fontWeight: 300,
            letterSpacing: '0.25em', textTransform: 'uppercase', color: '#e8e3d9',
          }}>ZAIRO FILMS</div>
          <div style={{ height: '1px', width: '36px', background: '#c9a227', margin: '12px 0' }} />
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            fontWeight: 300, color: '#6b6560', lineHeight: 1.7,
          }}>
            Cine independiente centroamericano.<br />
            Por Rodolfo Espinosa Orantes.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              fontWeight: 500, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#c9a227', marginBottom: '16px',
            }}>Explorar</p>
            {[['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/login', 'Ingresar']].map(([to, label]) => (
              <Link key={to} to={to} style={{
                display: 'block', fontFamily: 'Inter, sans-serif',
                fontSize: '12px', fontWeight: 300, color: '#6b6560',
                textDecoration: 'none', marginBottom: '10px', letterSpacing: '0.03em',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
              >{label}</Link>
            ))}
          </div>

          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              fontWeight: 500, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#c9a227', marginBottom: '16px',
            }}>Contacto</p>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              fontWeight: 300, color: '#6b6560', lineHeight: 1.8,
            }}>
              rodolfo@zairofilms.com<br />
              Guatemala, C.A.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px', margin: '32px auto 0',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '8px',
      }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35' }}>
          © {new Date().getFullYear()} Rodolfo Espinosa Orantes · Zairo Films
        </p>
      </div>
    </footer>
  )
}
