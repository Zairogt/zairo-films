import { useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'

const sections = [
  {
    title: 'Objeto del servicio',
    body: 'Zairo Films es una plataforma de distribución digital de cine guatemalteco independiente. A través de este sitio podrás adquirir licencias de visualización y descarga de las obras audiovisuales de Rodolfo Espinosa Orantes.',
  },
  {
    title: 'Licencias de uso',
    body: 'Al completar una compra obtienes una licencia personal, no exclusiva e intransferible para acceder al contenido adquirido. Quedan prohibidas la redistribución, reventa, exhibición pública o cualquier uso comercial sin autorización escrita del titular de derechos.',
  },
  {
    title: 'Pagos y precios',
    body: 'Los precios se muestran en dólares estadounidenses (USD). El procesamiento de pagos se realiza mediante plataformas de terceros (Stripe, Pagadito). Zairo Films no almacena datos de tarjetas de crédito o débito.',
  },
  {
    title: 'Política de reembolsos',
    body: 'Debido a la naturaleza digital del producto, no se realizan reembolsos una vez que el acceso al contenido ha sido entregado. Si experimentas problemas técnicos con tu compra, contáctanos a Zairofilms@proton.me para buscar una solución.',
  },
  {
    title: 'Propiedad intelectual',
    body: 'Todo el contenido disponible en Zairo Films — incluyendo las obras audiovisuales, fotografías, textos, logotipos y diseño — es propiedad de Rodolfo Espinosa Orantes y está protegido por las leyes de propiedad intelectual aplicables.',
  },
  {
    title: 'Cuentas de usuario',
    body: 'Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran en tu cuenta. Notifícanos inmediatamente si sospechas de un uso no autorizado.',
  },
  {
    title: 'Modificaciones',
    body: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor al publicarse en este sitio. El uso continuado del servicio implica la aceptación de los términos actualizados.',
  },
  {
    title: 'Contacto',
    body: 'Para cualquier consulta relacionada con estos términos, escríbenos a Zairofilms@proton.me.',
  },
]

export default function Terminos() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px' }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(40px, 6vw, 72px) clamp(20px, 4vw, 48px) clamp(32px, 4vw, 48px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(to bottom, #0d0d0d, #080808)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6b6560', background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 0, marginBottom: '28px',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
          >
            ← Volver
          </button>

          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#c9a227',
          }}>Legal</span>

          <h1 className="anim anim-d1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 300, color: '#e8e3d9',
            margin: '12px 0 8px',
          }}>
            Términos de servicio
          </h1>

          <p className="anim anim-d2" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            color: '#6b6560', lineHeight: 1.7,
          }}>
            Última actualización: {new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px)' }}>
        {sections.map((s, i) => (
          <div key={s.title} style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '22px', fontWeight: 400, color: '#e8e3d9',
              marginBottom: '12px',
            }}>
              {i + 1}. {s.title}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px',
              fontWeight: 300, color: '#9a948d', lineHeight: 1.8,
            }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}
