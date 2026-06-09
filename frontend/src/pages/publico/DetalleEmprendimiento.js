import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerEmprendimientoPorId } from '../../services/emprendimientos.service';
import { urlImagen } from '../../services/media';
import MiniMapa from '../../components/publico/MiniMapa';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import TarjetaCercano from '../../components/publico/TarjetaCercano';

// P-07 — Detalle de emprendimiento (/emprendimientos/:id)  —  VA EN: src/pages/publico/
function DetalleEmprendimiento() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [imgActiva, setImgActiva] = useState(0);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    // La URL trae "5-hosteria-el-descanso"; parseInt saca el número (5).
    obtenerEmprendimientoPorId(parseInt(id, 10))
      .then((datos) => { if (activo) { setEmp(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, [id]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">No se encontró el emprendimiento</h1>
        <p className="mt-2 text-slate-500">{error || 'Es posible que no exista o no esté publicado.'}</p>
        <Link to="/emprendimientos" className="mt-6 inline-block rounded-lg bg-primario px-5 py-2 font-semibold text-white transition hover:bg-primario-oscuro">
          Volver a emprendimientos
        </Link>
      </div>
    );
  }

  const multimedia = Array.isArray(emp.multimedia) ? emp.multimedia : [];
  const imagenes = multimedia.map((m) => urlImagen(m.archivo)).filter(Boolean);
  const servicios = Array.isArray(emp.servicios) ? emp.servicios : [];
  const redes = Array.isArray(emp.redes_sociales) ? emp.redes_sociales : [];
  const cercanos = Array.isArray(emp.atractivos_cercanos) ? emp.atractivos_cercanos : [];

  const contacto = [
    { etiqueta: 'Teléfono', valor: emp.telefono, href: emp.telefono ? `tel:${emp.telefono}` : null },
    { etiqueta: 'Email', valor: emp.email, href: emp.email ? `mailto:${emp.email}` : null },
    { etiqueta: 'Sitio web', valor: emp.sitio_web, href: emp.sitio_web },
    { etiqueta: 'Horario', valor: emp.horario, href: null },
  ].filter((c) => c.valor);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-5 text-sm text-slate-500">
        <Link to="/" className="hover:text-primario">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/emprendimientos" className="hover:text-primario">Emprendimientos</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{emp.nombre}</span>
      </nav>

      {/* Galería (imagen principal grande + miniaturas) */}
      {imagenes.length > 0 ? (
        <div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <img src={imagenes[imgActiva]} alt={emp.nombre} className="h-80 w-full object-cover" />
          </div>
          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {imagenes.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === imgActiva ? 'ring-primario' : 'ring-transparent hover:ring-slate-300'}`}
                >
                  <img src={src} alt={`${emp.nombre} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">Sin imágenes disponibles</div>
      )}

      {/* Título y badges */}
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold text-slate-800">{emp.nombre}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {emp.categoria && <span className="rounded-full bg-primario/10 px-3 py-1 text-sm font-medium text-primario">{emp.categoria}</span>}
          {emp.parroquia && <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{emp.parroquia}</span>}
        </div>
      </div>

      {emp.descripcion && <p className="mt-5 leading-relaxed text-slate-600">{emp.descripcion}</p>}

      {/* Contacto */}
      {contacto.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Contacto</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {contacto.map((c) => (
              <div key={c.etiqueta} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.etiqueta}</p>
                {c.href ? (
                  <a href={c.href} target="_blank" rel="noreferrer" className="mt-1 block break-words text-sm font-medium text-primario hover:underline">{c.valor}</a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-700">{c.valor}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Servicios */}
      {servicios.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Servicios que ofrece</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {servicios.map((s, i) => (
              <span key={i} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700">{s.nombre}</span>
            ))}
          </div>
        </section>
      )}

      {/* Redes sociales */}
      {redes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Redes sociales</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {redes.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" className="rounded-lg bg-primario/10 px-4 py-2 text-sm font-medium text-primario transition hover:bg-primario/20">
                {r.nombre_red || 'Red social'}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Ubicación + Cómo llegar */}
      {(emp.latitud != null && emp.longitud != null) && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Ubicación</h2>
          {emp.direccion && <p className="mt-1 text-sm text-slate-500">{emp.direccion}</p>}
          <div className="mt-4">
            <MiniMapa lat={emp.latitud} lng={emp.longitud} nombre={emp.nombre} />
          </div>
          <div className="mt-3">
            <BotonComoLlegar lat={emp.latitud} lng={emp.longitud} />
          </div>
        </section>
      )}

      {/* Atractivos cercanos (clicables, con imagen) */}
      {cercanos.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Cerca de estos atractivos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cercanos.map((a, i) => <TarjetaCercano key={i} tipo="atractivo" item={a} />)}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link to="/emprendimientos" className="text-sm font-medium text-primario hover:underline">← Volver a emprendimientos</Link>
      </div>
    </div>
  );
}

export default DetalleEmprendimiento;