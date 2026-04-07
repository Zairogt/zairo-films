import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: '·',
  }

  const colors: Record<ToastType, string> = {
    success: '#c9a227',
    error: '#c0392b',
    info: '#6b6560',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        alignItems: 'center',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#141414',
              border: `1px solid ${colors[t.type]}33`,
              padding: '12px 20px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              color: '#e8e3d9',
              letterSpacing: '0.03em',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              animation: 'toastIn 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: colors[t.type], fontWeight: 600, fontSize: '14px' }}>
              {icons[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
