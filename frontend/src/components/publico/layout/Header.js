import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { ADMIN_PATHS } from '../../../routes/adminPaths';
import { SocialIconList } from '../SocialIconLink';

function Header() {
  const config = useConfiguracion();
  const header = config.header || {};
  const [abierto, setAbierto] = useState(false);

  const stickyClass = header.sticky !== false ? 'sticky top-0' : 'relative';

  const claseEnlace = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-100 text-primario'
        : 'text-slate-600 hover:bg-slate-100 hover:text-primario'
    }`;

  return (
    <header className={`${stickyClass} z-50 border-b border-slate-200 bg-white/95 backdrop-blur`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          {header.mostrarLogo !== false && (
            config.logoUrl ? (
              <img src={config.logoUrl} alt={config.nombreSistema} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primario text-lg font-extrabold text-white">
                {config.nombreSistema?.charAt(0) ?? 'P'}
              </span>
            )
          )}
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-extrabold text-slate-800">{config.nombreSistema}</span>
            {config.eslogan && (
              <span className="block truncate text-xs text-slate-500">{config.eslogan}</span>
            )}
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {header.mostrarBuscador && (
            <input
              type="search"
              placeholder="Buscar..."
              className="w-40 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
              aria-label="Buscar en el portal"
            />
          )}

          {header.mostrarMenu !== false && (
            <nav className="flex items-center gap-1">
              {config.menu.map((e) => (
                <NavLink key={e.ruta} to={e.ruta} end={e.ruta === '/'} className={claseEnlace}>
                  {e.etiqueta}
                </NavLink>
              ))}
            </nav>
          )}

          {header.mostrarRedes && config.redes?.length > 0 && (
            <SocialIconList
              redes={config.redes}
              size="sm"
              variant="light"
              className="ml-1 border-l border-slate-200 pl-3"
            />
          )}

          <Link
            to={ADMIN_PATHS.login}
            className="ml-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-oscuro"
          >
            Iniciar sesión
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {abierto && header.mostrarMenu !== false && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden">
          {config.menu.map((e) => (
            <NavLink
              key={e.ruta}
              to={e.ruta}
              end={e.ruta === '/'}
              className={claseEnlace}
              onClick={() => setAbierto(false)}
            >
              {e.etiqueta}
            </NavLink>
          ))}

          <Link
            to={ADMIN_PATHS.login}
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
