import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../context/ConfiguracionContext';
import { listarAtractivos } from '../../services/atractivos.service';
import { listarRutas } from '../../services/rutas.service';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import { urlImagen } from '../../services/media';
import CarruselInicio from '../../components/publico/CarruselInicio';
import GaleriaCarrusel from '../../components/publico/GaleriaCarrusel';
import TarjetaRuta from '../../components/publico/TarjetaRuta';
import TarjetaEmprendimiento from '../../components/publico/TarjetaEmprendimiento';

const INFO_DEFECTO =
  'Pelileo, conocido como el "Cantón Azul" por su tradición textil, se ubica en la provincia ' +
  'de Tungurahua. Combina paisajes andinos, la cultura ancestral del pueblo Salasaca y la ' +
  'calidez de su gente, ofreciendo a cada visitante una experiencia única entre naturaleza, ' +
  'historia y tradición.';

function destacar(lista, n = 3) {
  const marcados = lista.filter((x) => x.destacado);
  return (marcados.length ? marcados : lista).slice(0, n);
}

function Home() {
  const config = useConfiguracion();
  const [atractivos, setAtractivos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);

  useEffect(() => {
    let activo = true;
    Promise.allSettled([listarAtractivos(), listarRutas(), listarEmprendimientos()])
      .then(([at, ru, em]) => {
        if (!activo) return;
        setAtractivos(at.value ?? []);
        setRutas(ru.value ?? []);
        setEmprendimientos(em.value ?? []);
      });
    return () => { activo = false; };
  }, []);

  const poolImgs = [
    ...atractivos.map((a) => urlImagen(a.imagen)),
    ...emprendimientos.map((e) => urlImagen(e.imagen)),
  ].filter(Boolean);

  // La galería usa SOLO las fotos de los atractivos destacados (no todas).
  const destImgs = destacar(atractivos, 6).map((a) => urlImagen(a.imagen)).filter(Boolean);
  const galeria = (destImgs.length ? destImgs : poolImgs).slice(0, 6);

  const titulo = config?.nombre ? `Descubre ${config.nombre}` : 'Descubre Pelileo';
  const eslogan = config?.eslogan || 'Naturaleza, cultura y tradición en el corazón de Tungurahua';
  const infoTexto = config?.descripcion || config?.historia || INFO_DEFECTO;

  return (
    <div>
      {/* 1. CARRUSEL */}
      <CarruselInicio imagenes={poolImgs.slice(0, 5)} titulo={titulo} eslogan={eslogan} />

      {/* 2. SOBRE PELILEO (en tarjeta) */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <span className="inline-block rounded-full bg-primario/10 px-3 py-1 text-xs font-semibold text-primario">Conoce el cantón</span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-800">Sobre Pelileo</h2>
              <p className="mt-4 leading-relaxed text-slate-600">{infoTexto}</p>
              <Link to="/atractivos" className="mt-6 inline-block rounded-lg bg-primario px-6 py-3 font-semibold text-white transition hover:bg-primario-oscuro">
                Conoce sus atractivos
              </Link>
            </div>
            <div className="min-h-[260px] bg-slate-100">
              {galeria[0] && <img src={galeria[0]} alt="Pelileo" className="h-full w-full object-cover" />}
            </div>
          </div>
        </div>
      </section>

      {/* 3. ATRACTIVOS DESTACADOS */}
      {atractivos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-slate-800">Atractivos destacados</h2>
            <Link to="/atractivos" className="text-sm font-medium text-primario hover:underline">Ver todos →</Link>
          </div>
          <p className="mt-3 max-w-2xl text-slate-500">
            Desde cascadas escondidas hasta miradores con historia: cada rincón de Pelileo guarda una aventura esperando por ti.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacar(atractivos).map((a) => {
              const img = urlImagen(a.imagen);
              return (
                <Link key={a.id} to={`/atractivos/${a.slug ?? a.id}`}
                  className="group relative block h-72 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                  {img ? (
                    <img src={img} alt={a.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/25 to-transparent" />
                  {a.categoria && (
                    <span className="absolute left-4 top-4 rounded-full bg-primario px-3 py-1 text-xs font-semibold text-white">{a.categoria}</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-xl font-bold drop-shadow">{a.nombre}</h3>
                    {a.descripcion && <p className="mt-1 line-clamp-2 text-sm text-white/85">{a.descripcion}</p>}
                    <span className="mt-2 inline-block text-sm font-semibold text-secundario">Ver más →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. RUTAS */}
      {rutas.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-extrabold text-slate-800">Rutas para recorrer</h2>
              <Link to="/rutas" className="text-sm font-medium text-primario hover:underline">Ver todas →</Link>
            </div>
            <p className="mt-3 max-w-2xl text-slate-500">
              Recorre el cantón a tu ritmo siguiendo rutas pensadas para vivir la aventura paso a paso.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacar(rutas).map((r) => <TarjetaRuta key={r.id} ruta={r} />)}
            </div>
          </div>
        </section>
      )}

      {/* 5. EMPRENDIMIENTOS */}
      {emprendimientos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-slate-800">Emprendimientos locales</h2>
            <Link to="/emprendimientos" className="text-sm font-medium text-primario hover:underline">Ver todos →</Link>
          </div>
          <p className="mt-3 max-w-2xl text-slate-500">
            Apoya a quienes hacen de Pelileo un destino único: su gente, sus sabores y sus negocios.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacar(emprendimientos).map((e) => <TarjetaEmprendimiento key={e.id} emprendimiento={e} />)}
          </div>
        </section>
      )}

      {/* 6. GALERÍA (carrusel coverflow) */}
      {galeria.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-center text-3xl font-extrabold text-slate-800">Galería de Pelileo</h2>
            <p className="mx-auto mb-12 mt-3 max-w-2xl text-center text-slate-500">
              Un recorrido visual por los rincones que hacen de Pelileo un lugar inolvidable.
            </p>
            <GaleriaCarrusel imagenes={galeria} />
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;