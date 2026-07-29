import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerEmprendimientoPorId } from '../../services/emprendimientos.service';
import GaleriaDetalle from '../../components/publico/GaleriaDetalle';
import { urlImagen } from '../../services/media';
import MiniMapa from '../../components/publico/MiniMapa';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import TarjetaCercano from '../../components/publico/TarjetaCercano';
import SeccionResenas from '../../components/publico/SeccionResenas';
import '../../components/publico/resenas-publico.css';

// P-07 — Detalle de emprendimiento (/emprendimientos/:id)  —  VA EN: src/pages/publico/
function DetalleEmprendimiento() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    // La URL trae "5-hosteria-el-descanso"; parseInt saca el número (5).
    obtenerEmprendimientoPorId(parseInt(String(id).split('-')[0], 10))
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
  const recomendados = Array.isArray(emp.emprendimientos_recomendados) ? emp.emprendimientos_recomendados : [];

  const contacto = [
    { etiqueta: 'Teléfono', valor: emp.telefono, href: emp.telefono ? `tel:${emp.telefono}` : null },
    { etiqueta: 'Email', valor: emp.email, href: emp.email ? `mailto:${emp.email}` : null },
    { etiqueta: 'Sitio web', valor: emp.sitio_web, href: emp.sitio_web },
    { etiqueta: 'Horario', valor: emp.horario, href: null },
  ].filter((c) => c.valor);

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link to="/" className="hover:text-primario">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/emprendimientos" className="hover:text-primario">Directorio</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{emp.nombre}</span>
        </nav>

        <GaleriaDetalle
          imagenes={imagenes}
          titulo={emp.nombre}
          vacio={(
            <div className="flex h-56 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 text-slate-400">
              <span className="text-4xl font-black text-primario/20">{emp.nombre?.charAt(0) ?? 'E'}</span>
              <span className="mt-2 text-sm">Fotos próximamente</span>
            </div>
          )}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {emp.categoria && (
                <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primario">
                  {emp.categoria}
                </span>
              )}
              {emp.parroquia && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {emp.parroquia}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {emp.nombre}
            </h1>
            {emp.descripcion && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-slate-600">{emp.descripcion}</p>
            )}

            {servicios.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Servicios</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {servicios.map((s, i) => (
                    <span key={i} className="rounded-full bg-primario/10 px-4 py-2 text-sm font-semibold text-primario">
                      {s.nombre}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {redes.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Redes</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {redes.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-primario/10 hover:text-primario"
                    >
                      {r.nombre_red || 'Red social'}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Contacto</p>
              <div className="mt-3 space-y-3">
                {contacto.map((c) => (
                  <div key={c.etiqueta}>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">{c.etiqueta}</p>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer" className="break-words text-sm font-semibold text-primario hover:underline">
                        {c.valor}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-slate-800">{c.valor}</p>
                    )}
                  </div>
                ))}
                {emp.direccion && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Dirección</p>
                    <p className="text-sm text-slate-700">{emp.direccion}</p>
                  </div>
                )}
              </div>
              {(emp.latitud != null && emp.longitud != null) && (
                <div className="mt-4">
                  <MiniMapa lat={emp.latitud} lng={emp.longitud} nombre={emp.nombre} />
                  <div className="mt-3">
                    <BotonComoLlegar lat={emp.latitud} lng={emp.longitud} />
                  </div>
                </div>
              )}
              {emp.telefono && (
                <a
                  href={`tel:${emp.telefono}`}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-primario px-4 py-3 text-sm font-bold text-white transition hover:bg-primario-oscuro"
                >
                  Contactar
                </a>
              )}
            </div>
          </aside>
        </div>

        {recomendados.length > 0 && (
          <section className="mt-12 rounded-3xl bg-primario/5 px-4 py-10 sm:px-8">
            <h2 className="font-display text-2xl font-extrabold text-slate-900">También te puede interesar</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recomendados.map((item) => (
                <TarjetaCercano key={item.id ?? item.nombre} tipo="emprendimiento" item={item} />
              ))}
            </div>
          </section>
        )}

        {emp.id && (
          <SeccionResenas entidadTipo="emprendimiento" entidadId={emp.id} />
        )}

        <div className="detalle-volver-bar mt-8">
          <Link to="/emprendimientos" className="text-sm font-medium text-primario hover:underline">
            ← Volver al directorio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DetalleEmprendimiento;