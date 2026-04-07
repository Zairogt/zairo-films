import { useEffect, useRef } from 'react'

interface GoogleProfile {
  email: string
  name: string
  picture: string
  sub: string
}

interface Props {
  onSuccess: (profile: GoogleProfile) => void
  label?: string
}

/** Decodifica el JWT que Google devuelve (solo el payload, sin verificar firma) */
function decodeJwt(token: string): GoogleProfile {
  const payload = token.split('.')[1]
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(decoded)
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export default function GoogleButton({ onSuccess, label = 'Continuar con Google' }: Props) {
  const btnRef = useRef<HTMLDivElement>(null)
  const demoMode = !CLIENT_ID

  useEffect(() => {
    if (demoMode || !btnRef.current) return

    const init = () => {
      google.accounts.id.initialize({
        client_id: CLIENT_ID!,
        callback: (res) => {
          const profile = decodeJwt(res.credential)
          onSuccess(profile)
        },
      })
      google.accounts.id.renderButton(btnRef.current!, {
        theme: 'filled_black',
        size: 'large',
        width: btnRef.current!.offsetWidth || 340,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'center',
      })
    }

    // Esperar a que el script de GSI cargue
    if (typeof google !== 'undefined') {
      init()
    } else {
      window.addEventListener('load', init, { once: true })
    }
  }, [demoMode, onSuccess])

  // ── DEMO MODE: sin Client ID real ─────────────────────────
  if (demoMode) {
    const handleDemo = () => {
      onSuccess({
        email: 'usuario.google@gmail.com',
        name: 'Usuario Google',
        picture: '',
        sub: 'demo-google-' + Math.random().toString(36).slice(2),
      })
    }

    return (
      <button
        onClick={handleDemo}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '13px 20px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          transition: 'border-color 0.25s, background 0.25s',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          color: '#e8e3d9',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {/* Google icon SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {label}
      </button>
    )
  }

  // ── PRODUCCIÓN: botón real de Google ──────────────────────
  return (
    <div
      ref={btnRef}
      style={{ width: '100%', minHeight: '44px' }}
    />
  )
}
