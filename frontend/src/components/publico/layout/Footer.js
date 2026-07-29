import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { CREDITOS_FOOTER } from '../../../data/creditosDesarrolladores';
import InstitutionalLogoMark from '../../InstitutionalLogoMark';
import { SocialIconList } from '../SocialIconLink';

function esColorOscuro(hex) {
  if (!hex || typeof hex !== 'string') return true;
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

function Footer() {
  const config = useConfiguracion();
  const { footer, menu, redes } = config;
  const menuExplora = menu.filter((e) => {
    if (e.ruta === '/') return false;
    if (!footer.mostrarMapa && e.ruta === '/mapa') return false;
    return true;
  });

  const copyrightLine = footer.copyright || footer.copyrightDefault;
  const colorFondo = footer.colorFondo || '#0f172a';
  const colorTexto = footer.colorTexto || '#e2e8f0';
  const oscuro = esColorOscuro(colorFondo);
  const muted = oscuro ? 'rgba(255,255,255,0.65)' : undefined;
  const border = oscuro ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  return (
    <footer
      className="mt-auto"
      style={{ backgroundColor: colorFondo, color: colorTexto }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <InstitutionalLogoMark
            imgClassName="footer-logo-img"
            fallbackClassName="footer-logo-fallback"
            className="mb-4"
          />
          <h3 className="font-display text-lg font-bold" style={{ color: colorTexto }}>
            {footer.titulo}
          </h3>
          {footer.descripcion && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: muted || undefined, opacity: muted ? 1 : 0.75 }}>
              {footer.descripcion}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: colorTexto }}>
            Explora
          </h4>
          <ul
            className={`mt-3 list-disc space-y-2 pl-5 text-sm ${
              oscuro ? 'marker:text-white/50' : 'marker:text-slate-400'
            }`}
          >
            {menuExplora.map((e) => (
              <li key={e.ruta}>
                <Link
                  to={e.ruta}
                  className={
                    oscuro
                      ? 'text-white/65 transition-colors duration-200 hover:text-primario'
                      : 'text-slate-600 transition-colors duration-200 hover:text-primario'
                  }
                >
                  {e.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {footer.mostrarContacto !== false && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: colorTexto }}>
              Contacto
            </h4>
            <div className="mt-3 space-y-1 text-sm" style={{ color: muted || undefined }}>
              {footer.contacto?.ciudad && <p>{footer.contacto.ciudad}</p>}
              {footer.contacto?.direccion && <p>{footer.contacto.direccion}</p>}
              {footer.contacto?.telefono && <p>{footer.contacto.telefono}</p>}
              {footer.contacto?.email && <p>{footer.contacto.email}</p>}
              {footer.contacto?.web && <p>{footer.contacto.web}</p>}
            </div>
            {footer.mostrarRedes !== false && redes?.length > 0 && (
              <div className="mt-4">
                <p
                  className="mb-2 text-xs font-medium uppercase tracking-wide"
                  style={{ opacity: 0.55 }}
                >
                  Síguenos
                </p>
                <SocialIconList redes={redes} size="md" variant={oscuro ? 'dark' : 'light'} />
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: colorTexto }}>
            {CREDITOS_FOOTER.titulo}
          </h4>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: muted || undefined }}>
            {CREDITOS_FOOTER.descripcion}
          </p>
          <Link
            to="/desarrollado-por"
            className="mt-4 inline-flex items-center text-sm font-semibold text-secundario transition hover:underline"
          >
            {CREDITOS_FOOTER.enlace}
            <span className="ml-1" aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div
        className="py-4 text-center text-xs"
        style={{ borderTop: `1px solid ${border}`, opacity: 0.75 }}
      >
        <p>{copyrightLine}</p>
      </div>
    </footer>
  );
}

export default Footer;
