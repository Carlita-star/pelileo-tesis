import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ScrollToTop';

// Envuelve TODAS las pantallas públicas: Header arriba, pantalla en medio, Footer abajo.
function PublicLayout() {
  return (
    <div className="portal-publico flex min-h-screen flex-col bg-white font-sans text-slate-700">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;