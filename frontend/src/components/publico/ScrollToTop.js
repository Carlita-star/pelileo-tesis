import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cada vez que el visitante navega a otra pantalla, la vista vuelve arriba.
// Sin esto, al entrar a una ficha quedarías a media página (un detalle que
// muchos portales descuidan). No pinta nada en pantalla.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

export default ScrollToTop;