import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../context/ConfiguracionContext';
import { listarAtractivos } from '../../services/atractivos.service';
import { listarRutas } from '../../services/rutas.service';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import { listarGaleriaPublica } from '../../services/galeria.service';
import { urlImagen } from '../../services/media';
import HeroInicio from '../../components/publico/HeroInicio';
import GaleriaInicio from '../../components/publico/GaleriaInicio';
import TarjetaRuta from '../../components/publico/TarjetaRuta';
import TarjetaEmprendimiento from '../../components/publico/TarjetaEmprendimiento';
import SeccionSobrePelileo from '../../components/publico/SeccionSobrePelileo';
import SeccionAutoridades from '../../components/publico/SeccionAutoridades';
import SeccionGuiasTuristicos from '../../components/publico/SeccionGuiasTuristicos';

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
    Promise.allSettled([
      listarAtractivos(),
      listarRutas(),
      listarEmprendimientos(),
      // Solo las 7 más recientes para el mosaico del inicio
      listarGaleriaPublica({ limite: 7 }),
    ]).then(([at, ru, em, gal]) => {
      if (!activo) return;
      setAtractivos(at.value ?? []);
      setRutas(ru.value ?? []);
      setEmprendimientos(em.value ?? []);
      setGaleriaImgs(gal.value ?? []);
    });
    return () => { activo = false; };
  }, []);

  const carruselImgs = imgsPrincipales(atractivos, rutas, emprendimientos);
  // Inicio: solo recientes de la API (sin fallback estático que deja fotos viejas/duplicadas)
  const galeria = galeriaImgs;
  const imagenSobrePelileo = config?.imagenSeccionInicioUrl;

  const titulo = 'Descubre Pelileo';
  const eslogan = config?.eslogan && !config.eslogan.includes('GAD Municipal')
    ? config.eslogan
    : ESLOGAN_DEFECTO;
  const destacados = destacar(atractivos, 6);

  return (
    <div className="bg-[#f7f8f6]">
      <HeroInicio imagenes={carruselImgs} titulo={titulo} eslogan={eslogan} />

      <SeccionSobrePelileo
        imagen={imagenSobrePelileo || null}
        intro={config?.sobrePelileoIntro}
        datos={config?.sobrePelileoDatos}
      />

      <SeccionAutoridades
        autoridades={config?.autoridades || []}
        intro={config?.autoridadesIntro}
        fondoUrl={imagenSobrePelileo || null}
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

      <SeccionGuiasTuristicos
        guias={config?.guias || []}
        intro={config?.guiasIntro}
        fondoUrl={imagenSobrePelileo || null}
      />

      {galeria.length > 0 && (
        <GaleriaInicio imagenes={galeria} />
      )}
    </div>
  );
}

export default Home;
