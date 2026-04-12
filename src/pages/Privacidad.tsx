import { useNavigate } from 'react-router-dom'
import Footer from '../components/layout/Footer'

const sections = [
  {
    title: 'Información que recopilamos',
    body: 'Al registrarte y usar Zairo Films recopilamos: nombre para mostrar, dirección de correo electrónico, historial de compras y fecha de creación de cuenta. No almacenamos datos de pago — las transacciones son procesadas íntegramente por Stripe o Pagadito.',
  },
  {
    title: 'Uso de la información',
    body: 'Utilizamos tu información exclusivamente para: gestionar tu cuenta y acceso al contenido adquirido, enviarte confirmaciones de compra, y mejorar la experiencia de la plataforma. No vendemos ni compartimos tus datos personales con terceros con fines comerciales.',
  },
  {
    title: 'Autenticación',
    body: 'La autenticación se realiza a través de Supabase, que almacena las credenciales de forma segura. Puedes iniciar sesión con correo y contraseña o mediante tu cuenta de Google (OAuth 2.0). En ningún caso almacenamos contraseñas en texto plano.',
  },
  {
    title: 'Procesadores de pago',
    body: 'Los pagos son procesados por Stripe Inc. (internacional) y Pagadito (Centroamérica). Ambas plataformas cuentan con sus propias políticas de privacidad y estándares de seguridad PCI-DSS. Zairo Films no tiene acceso a tus datos de tarjeta.',
  },
  {
    title: 'Cookies y almacenamiento local',
    body: 'Utilizamos localStorage del navegador para mantener tu sesión activa y guardar preferencias mínimas de navegación. No utilizamos cookies de seguimiento ni publicidad comportamental más allá del servicio de Google AdSense para mostrar anuncios en algunas páginas.',
  },
  {
    title: 'Retención de datos',
    body: 'Conservamos tu información mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y todos los datos asociados escribiendo a Zairofilms@proton.me. Procesaremos tu solicitud en un plazo de 30 días.',
  },
  {
    title: 'Seguridad',
    body: 'Implementamos medidas técnicas razonables para proteger tu información, incluyendo comunicaciones cifradas (HTTPS) y acceso restringido a la base de datos. Sin embargo, ningún sistema es completamente invulnerable.',
  },
  {
    title: 'Cambios a esta política',
    body: 'Podemos actualizar esta política periódicamente. La fecha de última actualización al inicio de este documento refleja los cambios más recientes. Te recomendamos revisarla ocasionalmente.',
  },
  {
    title: 'Contacto',
    body: 'Si tienes preguntas sobre cómo manejamos tus datos personales, escríbenos a Zairofilms@proton.me.',
  },
]

export default function Privacidad() {
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
            Política de privacidad
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
