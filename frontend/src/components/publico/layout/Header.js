import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { SocialIconList } from '../SocialIconLink';
import PublicProfileMenu from '../PublicProfileMenu';

/** Detecta si un color hex es oscuro (para invertir contraste del menú). */
function esColorOscuro(hex) {
  if (!hex || typeof hex !== 'string') return true;
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

function claseEnlace(oscuro) {
  return ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition ${
      isActive
        ? oscuro
          ? 'bg-white/15 text-white'
          : 'bg-primario/10 text-primario'
        : oscuro
          ? 'text-white/85 hover:bg-white/10 hover:text-white'
          : 'text-slate-600 hover:bg-slate-50 hover:text-primario'
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

function IconoMapa({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" strokeLinecap="round" />
    </svg>
  );
}

function ItemMenuDesktop({ item, oscuro }) {
  const [abierto, setAbierto] = useState(false);
  const tieneSub = item.submenus?.length > 0;
  const linkClass = claseEnlace(oscuro);

  if (!tieneSub) {
    return (
      <NavLink to={item.ruta} end={item.ruta === '/'} className={linkClass}>
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
        className={({ isActive }) => `${linkClass({ isActive })} inline-flex items-center gap-1`}
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

function ItemMenuMobile({ item, onNavigate, oscuro }) {
  const [expandido, setExpandido] = useState(false);
  const tieneSub = item.submenus?.length > 0;
  const linkClass = claseEnlace(oscuro);

  if (!tieneSub) {
    return (
      <NavLink
        to={item.ruta}
        end={item.ruta === '/'}
        className={linkClass}
        onClick={onNavigate}
      >
        {item.etiqueta}
      </NavLink>
    );
  }

  return (
    <div className={`rounded-lg ${oscuro ? 'border border-white/10 bg-white/5' : 'border border-slate-100 bg-slate-50/80'}`}>
      <button
        type="button"
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          oscuro ? 'text-white/90 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
        }`}
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
      >
        <span>{item.etiqueta}</span>
        <IconoChevron abierto={expandido} />
      </button>

      {expandido && (
        <div className={`flex flex-col gap-0.5 border-t px-2 py-2 ${oscuro ? 'border-white/10' : 'border-slate-200'}`}>
          <NavLink
            to={item.ruta}
            end={item.ruta === '/'}
            className={linkClass}
            onClick={onNavigate}
          >
            Ir a {item.etiqueta}
          </NavLink>
          {item.submenus.map((sub) => (
            <NavLink
              key={`${item.ruta}-${sub.ruta}`}
              to={sub.ruta}
              className={`${linkClass({ isActive: false })} ml-2 border-l-2 border-primario/40 pl-3`}
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

  const colorFondo = header.colorFondo || '#0f172a';
  const colorTexto = header.colorTexto || '#ffffff';
  const oscuro = esColorOscuro(colorFondo);

  return (
    <header
      className={`${stickyClass} z-50 shadow-lg`}
      style={{ backgroundColor: colorFondo, color: colorTexto }}
    >
      {header.textoSuperior && (
        <div
          className="border-b px-4 py-1.5 text-center text-[11px] font-medium tracking-wide"
          style={{
            borderColor: oscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            opacity: 0.9,
          }}
        >
          {header.textoSuperior}
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
        <Link to="/" className="flex min-w-0 items-center gap-3" style={{ color: colorTexto }}>
          {header.mostrarLogo !== false && (
            config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.nombreSistema}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/25"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primario text-lg font-extrabold text-white shadow-md">
                {config.nombreSistema?.charAt(0) ?? 'P'}
              </span>
            )
          )}
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-lg font-extrabold tracking-tight">
              {config.nombreSistema}
            </span>
            {config.eslogan && (
              <span
                className="block truncate text-[11px] font-medium uppercase tracking-wide"
                style={{ opacity: 0.7 }}
              >
                {config.eslogan}
              </span>
            )}
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {header.mostrarBuscador && (
            <input
              type="search"
              placeholder="Buscar..."
              className={`w-40 rounded-lg px-3 py-1.5 text-sm outline-none ${
                oscuro
                  ? 'border border-white/20 bg-white/10 text-white placeholder:text-white/50'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
              aria-label="Buscar en el portal"
            />
          )}

          {header.mostrarMenu !== false && (
            <nav className="flex items-center gap-1">
              {config.menu
                .filter((item) => item.ruta !== '/mapa')
                .map((item) => (
                <ItemMenuDesktop
                  key={`${item.ruta}-${item.etiqueta}`}
                  item={item}
                  oscuro={oscuro}
                />
              ))}
            </nav>
          )}

          {header.mostrarRedes && config.redes?.length > 0 && (
            <SocialIconList
              redes={config.redes}
              size="sm"
              variant={oscuro ? 'dark' : 'light'}
              className={`ml-1 border-l pl-3 ${oscuro ? 'border-white/15' : 'border-slate-200'}`}
            />
          )}

          <Link
            to="/mapa"
            className="ml-1 inline-flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-primario-oscuro"
          >
            <IconoMapa />
            Mapa
          </Link>

          <PublicProfileMenu />
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className={`rounded-lg p-2 md:hidden ${oscuro ? 'hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          style={{ color: colorTexto }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {abierto && header.mostrarMenu !== false && (
        <nav
          className={`flex flex-col gap-2 border-t px-4 py-3 md:hidden ${oscuro ? 'border-white/10' : 'border-slate-200'}`}
        >
          {config.menu
            .filter((item) => item.ruta !== '/mapa')
            .map((item) => (
            <ItemMenuMobile
              key={`${item.ruta}-${item.etiqueta}`}
              item={item}
              onNavigate={cerrarMenu}
              oscuro={oscuro}
            />
          ))}

          <Link
            to="/mapa"
            onClick={cerrarMenu}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primario px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white"
          >
            <IconoMapa />
            Mapa
          </Link>

          <div className="mt-2 md:hidden">
            <PublicProfileMenu />
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
