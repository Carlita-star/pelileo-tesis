import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';

function Header() {
  const config = useConfiguracion(); // <- toda la marca y el menú salen de aquí
  const [abierto, setAbierto] = useState(false);

  const claseEnlace = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-100 text-primario'
        : 'text-slate-600 hover:bg-slate-100 hover:text-primario'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo / marca (dinámico) */}
        <Link to="/" className="flex items-center gap-2">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.nombreSistema} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primario text-lg font-extrabold text-white">
              {config.nombreSistema?.charAt(0) ?? 'P'}
            </span>
          )}
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-slate-800">{config.nombreSistema}</span>
            <span className="block text-xs text-slate-500">{config.eslogan}</span>
          </span>
        </Link>

        {/* Menú escritorio (dinámico) */}
        <nav className="hidden items-center gap-1 md:flex">
          {config.menu.map((e) => (
            <NavLink key={e.ruta} to={e.ruta} end={e.ruta === '/'} className={claseEnlace}>
              {e.etiqueta}
            </NavLink>
          ))}

          <Link
            to="/admin"
            className="ml-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-oscuro"
          >
            Iniciar sesión
          </Link>
        </nav>

        {/* Botón móvil */}
        <button onClick={() => setAbierto((v) => !v)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Abrir menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Menú móvil */}
      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden">
          {config.menu.map((e) => (
            <NavLink key={e.ruta} to={e.ruta} end={e.ruta === '/'} className={claseEnlace} onClick={() => setAbierto(false)}>
              {e.etiqueta}
            </NavLink>
          ))}

          <Link
            to="/admin"
            className="mt-2 rounded-lg bg-primario px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-primario-oscuro"
            onClick={() => setAbierto(false)}
          >
            Iniciar sesión
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;