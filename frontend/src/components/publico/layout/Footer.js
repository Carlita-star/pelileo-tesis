import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import { CREDITOS_FOOTER } from '../../../data/creditosDesarrolladores';
import InstitutionalLogoMark from '../../InstitutionalLogoMark';
import { SocialIconList } from '../SocialIconLink';

function Footer() {
  const config = useConfiguracion();
  const { footer, menu, redes } = config;
  const menuExplora = menu.filter((e) => {
    if (e.ruta === '/') return false;
    if (!footer.mostrarMapa && e.ruta === '/mapa') return false;
    return true;
  });

  const copyrightLine = footer.copyright || footer.copyrightDefault;

  return (
    <footer className="mt-auto bg-slate-800 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <InstitutionalLogoMark
            imgClassName="footer-logo-img"
            fallbackClassName="footer-logo-fallback"
            className="mb-4"
          />
          <h3 className="text-lg font-bold text-white">{footer.titulo}</h3>
          {footer.descripcion && (
            <p className="mt-2 text-sm text-slate-400">{footer.descripcion}</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-white">Explora</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {menuExplora.map((e) => (
              <li key={e.ruta}>
                <Link to={e.ruta} className="transition hover:text-secundario">{e.etiqueta}</Link>
              </li>
            ))}
          </ul>
        </div>

        {footer.mostrarContacto !== false && (
          <div>
            <h4 className="font-semibold text-white">Contacto</h4>
            {footer.contacto?.ciudad && (
              <p className="mt-3 text-sm text-slate-400">{footer.contacto.ciudad}</p>
            )}
            {footer.contacto?.direccion && (
              <p className="text-sm text-slate-400">{footer.contacto.direccion}</p>
            )}
            {footer.contacto?.telefono && (
              <p className="text-sm text-slate-400">{footer.contacto.telefono}</p>
            )}
            {footer.contacto?.email && (
              <p className="text-sm text-slate-400">{footer.contacto.email}</p>
            )}
            {footer.contacto?.web && (
              <p className="text-sm text-slate-400">{footer.contacto.web}</p>
            )}
            {footer.mostrarRedes !== false && redes?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Síguenos
                </p>
                <SocialIconList redes={redes} size="md" variant="dark" />
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="font-semibold text-white">{CREDITOS_FOOTER.titulo}</h4>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {CREDITOS_FOOTER.descripcion}
          </p>
          <Link
            to="/desarrollado-por"
            className="mt-4 inline-flex items-center text-sm font-semibold text-secundario transition hover:text-amber-300"
          >
            {CREDITOS_FOOTER.enlace}
            <span className="ml-1" aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-500">
        <p>{copyrightLine}</p>
      </div>
    </footer>
  );
}

export default Footer;
