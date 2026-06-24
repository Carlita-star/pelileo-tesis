import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../../context/ConfiguracionContext';
import InstitutionalLogoMark from '../../InstitutionalLogoMark';

function Footer() {
  const config = useConfiguracion();
  const { footer, menu, redes } = config;

  return (
    <footer className="mt-auto bg-slate-800 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <InstitutionalLogoMark
            imgClassName="footer-logo-img"
            fallbackClassName="footer-logo-fallback"
            className="mb-4"
          />
          <h3 className="text-lg font-bold text-white">{footer.titulo}</h3>
          <p className="mt-2 text-sm text-slate-400">{footer.descripcion}</p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Explora</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {menu.filter((e) => e.ruta !== '/').map((e) => (
              <li key={e.ruta}>
                <Link to={e.ruta} className="transition hover:text-secundario">{e.etiqueta}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contacto</h4>
          <p className="mt-3 text-sm text-slate-400">{footer.contacto?.ciudad}</p>
          <p className="text-sm text-slate-400">{footer.contacto?.web}</p>
          {redes?.length > 0 && (
            <div className="mt-3 flex gap-3">
              {redes.map((r) => (
                <a key={r.nombre} href={r.url} target="_blank" rel="noreferrer" className="text-sm text-slate-400 transition hover:text-secundario">
                  {r.nombre}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {footer.titulo}. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;