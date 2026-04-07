import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
