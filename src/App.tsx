import { HashRouter as BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Catalogo from './pages/Catalogo'
import MovieDetail from './pages/MovieDetail'
import Checkout from './pages/Checkout'
import MiCuenta from './pages/MiCuenta'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Observa recoveryMode en AuthContext y redirige a /reset-password.
// Vive dentro del Router para poder usar useNavigate.
function RecoveryRedirect() {
  const { recoveryMode } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (recoveryMode) navigate('/reset-password', { replace: true })
  }, [recoveryMode, navigate])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <RecoveryRedirect />
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/pelicula/:id" element={<MovieDetail />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
