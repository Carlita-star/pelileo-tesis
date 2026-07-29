import { Fragment, useEffect, useState } from 'react';
import { cambiarEstadoError, listarErrores } from '../../services/erroresAdmin.service';
import ApiErrorDisplay from '../../components/ApiErrorDisplay';

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'solucionado', label: 'Solucionado' },
];

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'validacion', label: 'Validación' },
  { value: 'base_datos', label: 'Base de datos' },
  { value: 'autenticacion', label: 'Autenticación' },
  { value: 'permiso', label: 'Permiso' },
  { value: 'red', label: 'Red' },
  { value: 'archivo', label: 'Archivo' },
  { value: 'servidor', label: 'Servidor' },
  { value: 'cliente', label: 'Cliente' },
];

function ErroresMonitorPage() {
  const [filtros, setFiltros] = useState({ estado: 'pendiente', tipo: '', modulo: '' });
  const [data, setData] = useState({ resumen: {}, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listarErrores(filtros);
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filtros.estado, filtros.tipo, filtros.modulo]);

  const handleEstado = async (id, estado) => {
    try {
      await cambiarEstadoError(id, estado);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const { resumen = {} } = data;

  return (
    <section className="panel-card errores-monitor">
      <div className="panel-header">
        <div>
          <h2>Monitoreo de errores</h2>
          <p className="section-description">
            Bitácora centralizada de fallos del sistema. Revise, clasifique y marque como solucionados.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={load}>Actualizar</button>
      </div>

      <div className="overview-cards errores-summary">
        <article className="overview-card pink">
          <span className="card-label">Pendientes</span>
          <strong>{resumen.pendientes ?? 0}</strong>
        </article>
        <article className="overview-card orange">
          <span className="card-label">En revisión</span>
          <strong>{resumen.en_revision ?? 0}</strong>
        </article>
        <article className="overview-card green">
          <span className="card-label">Solucionados</span>
          <strong>{resumen.solucionados ?? 0}</strong>
        </article>
      </div>

      <div className="errores-filters form-grid">
        <div className="form-group">
          <label>Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}
          >
            {ESTADOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}
          >
            {TIPOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Módulo</label>
          <input
            placeholder="ej: atractivos, auth..."
            value={filtros.modulo}
            onChange={(e) => setFiltros((f) => ({ ...f, modulo: e.target.value }))}
          />
        </div>
      </div>

      {error && <ApiErrorDisplay error={error} title="No se pudo cargar la bitácora" />}

      {loading ? (
        <p>Cargando errores...</p>
      ) : data.results.length === 0 ? (
        <p className="empty-state">No hay errores registrados con estos filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table errores-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Módulo</th>
                <th>HTTP</th>
                <th>Mensaje</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((item) => (
                <Fragment key={item.id}>
                  <tr className={item.estado === 'pendiente' ? 'row-pending' : ''}>
                    <td>{new Date(item.fecha).toLocaleString('es-ES')}</td>
                    <td><span className={`error-badge tipo-${item.tipo}`}>{item.tipo_label}</span></td>
                    <td>{item.modulo}</td>
                    <td>{item.http_status || '—'}</td>
                    <td className="error-msg-cell">{item.mensaje_usuario}</td>
                    <td>{item.usuario}</td>
                    <td><span className={`error-badge estado-${item.estado}`}>{item.estado_label}</span></td>
                    <td className="errores-actions">
                      <button type="button" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                        {expandedId === item.id ? 'Ocultar' : 'Detalle'}
                      </button>
                      {item.estado !== 'en_revision' && (
                        <button type="button" onClick={() => handleEstado(item.id, 'en_revision')}>Revisar</button>
                      )}
                      {item.estado !== 'solucionado' && (
                        <button type="button" onClick={() => handleEstado(item.id, 'solucionado')}>Solucionar</button>
                      )}
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr className="error-detail-row">
                      <td colSpan={8}>
                        <div className="error-detail-panel">
                          <p><strong>Ruta:</strong> {item.metodo} {item.ruta}</p>
                          {item.mensaje_tecnico && (
                            <p><strong>Técnico:</strong> {item.mensaje_tecnico}</p>
                          )}
                          {item.stack_trace && (
                            <pre className="error-stack-trace">{item.stack_trace}</pre>
                          )}
                          {item.metadata && (
                            <pre className="error-metadata">{JSON.stringify(item.metadata, null, 2)}</pre>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ErroresMonitorPage;
