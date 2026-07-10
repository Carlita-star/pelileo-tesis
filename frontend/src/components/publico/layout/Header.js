import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { SocialIconList } from '../SocialIconLink';
import PublicProfileMenu from '../PublicProfileMenu';

function claseEnlace({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-100 text-primario'
      : 'text-slate-600 hover:bg-slate-100 hover:text-primario'
  }`;
}

function claseSubEnlace({ isActive }) {
  return `block rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-50 text-primario'
      : 'text-slate-600 hover:bg-slate-50 hover:text-primario'
  }`;
}

function IconoChevron({ abierto, className = 'h-4 w-4' }) {
  return (
    <svg
      className={`${className} shrink-0 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ItemMenuDesktop({ item }) {
  const [abierto, setAbierto] = useState(false);
  const tieneSub = item.submenus?.length > 0;

  if (!tieneSub) {
    return (
      <NavLink to={item.ruta} end={item.ruta === '/'} className={claseEnlace}>
        {item.etiqueta}
      </NavLink>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
      onFocus={() => setAbierto(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setAbierto(false);
      }}
    >
      <NavLink
        to={item.ruta}
        end={item.ruta === '/'}
        className={({ isActive }) =>
          `${claseEnlace({ isActive })} inline-flex items-center gap-1`
        }
        aria-haspopup="true"
        aria-expanded={abierto}
      >
        {item.etiqueta}
        <IconoChevron abierto={abierto} className="h-3.5 w-3.5 opacity-70" />
      </NavLink>

      {abierto && (
        <div className="nav-submenu-panel absolute left-0 top-full z-[60] min-w-[12rem] pt-1">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-100">
            {item.submenus.map((sub) => (
              <NavLink
                key={`${item.ruta}-${sub.ruta}`}
                to={sub.ruta}
                className={claseSubEnlace}
                onClick={() => setAbierto(false)}
              >
                {sub.etiqueta}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemMenuMobile({ item, onNavigate }) {
  const [expandido, setExpandido] = useState(false);
  const tieneSub = item.submenus?.length > 0;

  if (!tieneSub) {
    return (
      <NavLink
        to={item.ruta}
        end={item.ruta === '/'}
        className={claseEnlace}
        onClick={onNavigate}
      >
        {item.etiqueta}
      </NavLink>
    );
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
      >
        <span>{item.etiqueta}</span>
        <IconoChevron abierto={expandido} />
      </button>

      {expandido && (
        <div className="flex flex-col gap-0.5 border-t border-slate-200 px-2 py-2">
          <NavLink
            to={item.ruta}
            end={item.ruta === '/'}
            className={claseEnlace}
            onClick={onNavigate}
          >
            Ir a {item.etiqueta}
          </NavLink>
          {item.submenus.map((sub) => (
            <NavLink
              key={`${item.ruta}-${sub.ruta}`}
              to={sub.ruta}
              className={`${claseEnlace} ml-2 border-l-2 border-primario/30 pl-3`}
              onClick={onNavigate}
            >
              {sub.etiqueta}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const config = useConfiguracion();
  const header = config.header || {};
  const [abierto, setAbierto] = useState(false);

  const stickyClass = header.sticky !== false ? 'sticky top-0' : 'relative';
  const cerrarMenu = () => setAbierto(false);

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
              {config.menu.map((item) => (
                <ItemMenuDesktop key={`${item.ruta}-${item.etiqueta}`} item={item} />
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

          <PublicProfileMenu />
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {abierto && header.mostrarMenu !== false && (
        <nav className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 md:hidden">
          {config.menu.map((item) => (
            <ItemMenuMobile
              key={`${item.ruta}-${item.etiqueta}`}
              item={item}
              onNavigate={cerrarMenu}
            />
          ))}

          <div className="mt-2 md:hidden">
            <PublicProfileMenu />
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
