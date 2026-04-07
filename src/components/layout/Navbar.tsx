import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    showToast('Sesión cerrada. ¡Hasta pronto!')
    navigate('/')
    setMenuOpen(false)
    setMobileOpen(false)
  }

  const navLinkStyle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '11px',
    fontWeight: 400,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#9e9890',
    textDecoration: 'none',
    transition: 'color 0.2s',
  }

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div style={{
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.98), rgba(8,8,8,0))',
        padding: '0 clamp(20px, 4vw, 48px)',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '22px',
              fontWeight: 300,
              color: '#e8e3d9',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}>ZAIRO</span>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '8px',
              fontWeight: 500,
              color: '#c9a227',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}>FILMS</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-links" style={{ alignItems: 'center', gap: '32px' }}>
          <Link
            to="/catalogo"
            style={navLinkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9e9890')}
          >
            Catálogo
          </Link>

          {user?.isAdmin && (
            <Link to="/admin" style={{ ...navLinkStyle, color: '#c9a227' }}>
              Admin
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e8e3d9',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '8px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'rgba(201,162,39,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', color: '#c9a227',
                }}>
                  {user.name[0].toUpperCase()}
                </span>
                {user.name}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                  minWidth: '160px', padding: '4px 0',
                }}>
                  <Link
                    to="/mi-cuenta"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '10px 18px',
                      ...navLinkStyle, color: '#9e9890',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9e9890')}
                  >
                    Mi Cuenta
                  </Link>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', padding: '10px 18px',
                      ...navLinkStyle, color: '#9e9890',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9e9890')}
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login">
                <button className="btn-ghost" style={{ padding: '8px 20px' }}>Ingresar</button>
              </Link>
              <Link to="/signup">
                <button className="btn-primary" style={{ padding: '8px 20px' }}>Registro</button>
              </Link>
            </div>
          )}
        </nav>

        {/* Hamburger button (mobile only) */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            padding: '4px',
          }}
        >
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#e8e3d9' }} />
          <span style={{ display: 'block', width: '16px', height: '1px', background: '#c9a227' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#e8e3d9' }} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,8,8,0.97)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {/* Close */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'transparent', border: 'none',
              color: '#9e9890', fontSize: '24px', cursor: 'pointer',
            }}
          >✕</button>

          {/* Logo */}
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px', fontWeight: 300,
            color: '#e8e3d9', letterSpacing: '0.3em',
            marginBottom: '32px',
          }}>ZAIRO FILMS</div>

          {[
            ['/', 'Inicio'],
            ['/catalogo', 'Catálogo'],
            ...(user ? [
              ['/mi-cuenta', 'Mi Cuenta'],
              ...(user.isAdmin ? [['/admin', 'Admin']] : []),
            ] : [
              ['/login', 'Ingresar'],
              ['/signup', 'Registro'],
            ]),
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '32px',
                fontWeight: 300,
                color: label === 'Admin' ? '#c9a227' : '#e8e3d9',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                padding: '10px 0',
                transition: 'color 0.2s',
              }}
            >
              {label}
            </Link>
          ))}

          {user && (
            <>
              <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: '11px',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#6b6560', cursor: 'pointer',
                }}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
