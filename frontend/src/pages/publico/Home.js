import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../context/ConfiguracionContext';
import { listarAtractivos } from '../../services/atractivos.service';
import { listarRutas } from '../../services/rutas.service';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import { listarGaleriaPublica } from '../../services/galeria.service';
import { urlImagen } from '../../services/media';
import HeroInicio from '../../components/publico/HeroInicio';
import GaleriaMasonry from '../../components/publico/GaleriaMasonry';
import TarjetaRuta from '../../components/publico/TarjetaRuta';
import TarjetaEmprendimiento from '../../components/publico/TarjetaEmprendimiento';
import SeccionInstitucional from '../../components/publico/SeccionInstitucional';

const INFO_DEFECTO =
  'Pelileo, conocido como el "Cantón Azul" por su tradición textil, se ubica en la provincia ' +
  'de Tungurahua. Combina paisajes andinos, la cultura ancestral del pueblo Salasaca y la ' +
  'calidez de su gente, ofreciendo a cada visitante una experiencia única entre naturaleza, ' +
  'historia y tradición.';

const ESLOGAN_DEFECTO = 'Tradición, cultura, aventura y naturaleza';

function destacar(lista, n = 6) {
  const marcados = lista.filter((x) => x.destacado);
  return (marcados.length ? marcados : lista).slice(0, n);
}

function imgsPrincipales(atractivos, rutas, emprendimientos) {
  const urls = [
    ...atractivos.map((a) => urlImagen(a.imagen)),
    ...rutas.map((r) => urlImagen(r.imagen)),
    ...emprendimientos.map((e) => urlImagen(e.imagen)),
  ].filter(Boolean);
  return [...new Set(urls)];
}

function Home() {
  const config = useConfiguracion();
  const [atractivos, setAtractivos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [galeriaImgs, setGaleriaImgs] = useState([]);

  useEffect(() => {
    let activo = true;
    Promise.allSettled([listarAtractivos(), listarRutas(), listarEmprendimientos(), listarGaleriaPublica()])
      .then(([at, ru, em, gal]) => {
        if (!activo) return;
        setAtractivos(at.value ?? []);
        setRutas(ru.value ?? []);
        setEmprendimientos(em.value ?? []);
        setGaleriaImgs(gal.value ?? []);
      });
    return () => { activo = false; };
  }, []);

  const poolImgs = [
    ...atractivos.map((a) => urlImagen(a.imagen)),
    ...emprendimientos.map((e) => urlImagen(e.imagen)),
  ].filter(Boolean);

  const carruselImgs = imgsPrincipales(atractivos, rutas, emprendimientos);
  const galeria = galeriaImgs.length ? galeriaImgs : poolImgs;
  const imagenSobrePelileo = config?.imagenSeccionInicioUrl;

  const titulo = 'Descubre Pelileo';
  const eslogan = config?.eslogan && !config.eslogan.includes('GAD Municipal')
    ? config.eslogan
    : ESLOGAN_DEFECTO;
  const infoTexto = config?.descripcion || INFO_DEFECTO;
  const nombreInstitucional = config?.footer?.titulo || config?.nombre || 'Pelileo';
  const destacados = destacar(atractivos, 6);

  return (
    <div className="bg-[#f7f8f6]">
      <HeroInicio imagenes={carruselImgs} titulo={titulo} eslogan={eslogan} />

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:pt-14">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <span className="inline-block rounded-full bg-primario/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primario">
                Conoce el cantón
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Sobre Pelileo
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{infoTexto}</p>
              <Link
                to="/atractivos"
                className="mt-8 inline-flex items-center rounded-full bg-primario px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-primario-oscuro"
              >
                Explorar atractivos
              </Link>
            </div>
            <div className="relative min-h-[280px] bg-gradient-to-br from-emerald-100 via-slate-100 to-amber-50">
              {imagenSobrePelileo ? (
                <img src={imagenSobrePelileo} alt="Pelileo" className="absolute inset-0 h-full w-full object-cover" />
              ) : carruselImgs[0] ? (
                <img src={carruselImgs[0]} alt="Pelileo" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <span className="text-5xl font-black text-primario/25">P</span>
                  <span className="mt-2 text-sm">Imagen institucional próximamente</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SeccionInstitucional
        nombre={nombreInstitucional}
        historia={config?.historia || config?.empresa?.historia}
        mision={config?.mision || config?.empresa?.mision}
        vision={config?.vision || config?.empresa?.vision}
      />

      {destacados.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-terciario">Destinos</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Destinos destacados
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              Cascadas, miradores, cultura y tradición: descubre lo mejor del cantón San Pedro de Pelileo.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((a) => {
              const img = urlImagen(a.imagen);
              return (
                <Link
                  key={a.id}
                  to={`/atractivos/${a.slug ?? a.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    {img ? (
                      <img
                        src={img}
                        alt={a.nombre}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-slate-200" />
                    )}
                  </div>
                  <div className="p-4">
                    {a.categoria && (
                      <span className="text-[11px] font-bold uppercase tracking-wide text-primario">
                        {a.categoria}
                      </span>
                    )}
                    <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-primario">
                      {a.nombre}
                    </h3>
                    {a.parroquia && (
                      <p className="mt-1 text-xs text-slate-500">{a.parroquia}</p>
                    )}
                    {a.descripcion && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{a.descripcion}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/atractivos"
              className="inline-flex rounded-full border-2 border-primario px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-primario transition hover:bg-primario hover:text-white"
            >
              Ver todos los atractivos
            </Link>
          </div>
        </section>
      )}

      {rutas.length > 0 && (
        <section className="border-y border-slate-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-terciario">Recorre</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                  Rutas turísticas
                </h2>
                <p className="mt-2 max-w-xl text-slate-500">
                  Rutas pensadas para vivir Pelileo a tu ritmo: naturaleza, cultura y aventura.
                </p>
              </div>
              <Link to="/rutas" className="text-sm font-semibold text-primario hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacar(rutas, 3).map((r) => <TarjetaRuta key={r.id} ruta={r} />)}
            </div>
          </div>
        </section>
      )}

      {emprendimientos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-terciario">Directorio</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                Emprendimientos locales
              </h2>
              <p className="mt-2 max-w-xl text-slate-500">
                Hospedaje, gastronomía, artesanías y experiencias de la gente de Pelileo.
              </p>
            </div>
            <Link to="/emprendimientos" className="text-sm font-semibold text-primario hover:underline">
              Ver directorio →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacar(emprendimientos, 3).map((e) => (
              <TarjetaEmprendimiento key={e.id} emprendimiento={e} />
            ))}
          </div>
        </section>
      )}

      {galeria.length > 0 && (
        <section className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-terciario">Visual</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Galería
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-slate-500">
                Un recorrido por los paisajes, la cultura y la gente que hacen de Pelileo un destino inolvidable.
              </p>
            </div>
            <GaleriaMasonry imagenes={galeria} />
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
