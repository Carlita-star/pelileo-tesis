import { useState, useEffect, useCallback } from 'react';
import { apiRequest, getApiBase, getAuthHeaders } from '../services/apiClient';

const ACCIONES = ['CREAR', 'EDITAR', 'ELIMINAR', 'LOGIN', 'PUBLICAR'];
const MODULOS = ['atractivos', 'rutas', 'emprendimientos', 'usuarios', 'eventos', 'configuracion'];

function AuditoriasPage() {
  const [auditorias, setAuditorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const [filtros, setFiltros] = useState({
    accion: '',
    tabla: '',
    usuario_id: '',
    desde: '',
    hasta: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    apiRequest('/api/usuarios/')
      .then((data) => setUsuarios(data.results || []))
      .catch(() => setUsuarios([]));
  }, []);

  const buildParams = useCallback((pageNum, size) => {
    const params = new URLSearchParams();
    if (filtros.accion) params.append('accion', filtros.accion);
    if (filtros.tabla) params.append('tabla', filtros.tabla);
    if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    params.append('page', pageNum);
    params.append('page_size', size);
    return params;
  }, [filtros]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/api/auditorias/?${buildParams(page, pageSize).toString()}`);
      setAuditorias(data.results || []);
      setTotal(data.count || 0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las auditorías.');
    } finally {
      setLoading(false);
    }
  }, [buildParams, page]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));

  const onFiltroChange = (campo, valor) => {
    setPage(1);
    setFiltros((f) => ({ ...f, [campo]: valor }));
  };

  const exportarCsv = async () => {
    setExportando(true);
    setError(null);
    try {
      const params = buildParams(1, 100);
      params.set('format', 'csv');
      const response = await fetch(`${getApiBase()}/api/auditorias/?${params.toString()}`, {
        headers: getAuthHeaders(false),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Error ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'No se pudo exportar el CSV.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Log de auditoría</h2>
          <p className="section-description">
            Revisa el historial de operaciones críticas: quién hizo qué, cuándo y sobre qué registro.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={exportarCsv}
          disabled={exportando || loading}
        >
          {exportando ? 'Exportando…' : 'Exportar'}
        </button>
      </div>

      <div className="filter-bar">
        <select value={filtros.tabla} onChange={(e) => onFiltroChange('tabla', e.target.value)}>
          <option value="">Todos los módulos</option>
          {MODULOS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filtros.accion} onChange={(e) => onFiltroChange('accion', e.target.value)}>
          <option value="">Todas las acciones</option>
          {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filtros.usuario_id} onChange={(e) => onFiltroChange('usuario_id', e.target.value)}>
          <option value="">Todos los usuarios</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>{u.nombre_completo || u.username}</option>
          ))}
        </select>
        <input type="date" value={filtros.desde} onChange={(e) => onFiltroChange('desde', e.target.value)} />
        <input type="date" value={filtros.hasta} onChange={(e) => onFiltroChange('hasta', e.target.value)} />
      </div>

      {loading && (
        <div className="table-spinner"><span className="loader" /> Cargando auditorías…</div>
      )}
      {error && <p className="empty-state" style={{ color: '#d65e5e' }}>{error}</p>}

      {!loading && !error && auditorias.length === 0 && (
        <p className="empty-state">No hay auditorías que coincidan con los filtros.</p>
      )}

      {!loading && !error && auditorias.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>ID registro</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {auditorias.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fecha ? new Date(item.fecha).toLocaleString('es-ES') : '---'}</td>
                    <td>{item.usuario || 'Sistema'}</td>
                    <td>
                      <span className={`status-badge accion-${item.accion}`}>
                        {item.accion || '---'}
                      </span>
                    </td>
                    <td>{item.tabla_afectada || 'Sin módulo'}</td>
                    <td>{item.entidad_id ?? '---'}</td>
                    <td className="actions-cell">
                      <button type="button" onClick={() => setDetalle(item)}>Ver detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="empty-state">{total} registros</span>
            <div className="pagination-controls">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <span>Página {page} de {totalPaginas}</span>
              <button type="button" disabled={page >= totalPaginas} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          </div>
        </>
      )}

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle de auditoría #{detalle.id}</h3>
            <p><strong>Acción:</strong> {detalle.accion} &nbsp;|&nbsp; <strong>Módulo:</strong> {detalle.tabla_afectada || '---'}</p>
            <p><strong>Usuario:</strong> {detalle.usuario || 'Sistema'} &nbsp;|&nbsp; <strong>IP:</strong> {detalle.ip_address || '---'}</p>
            <div className="modal-json-grid">
              <div>
                <h4>Datos anteriores</h4>
                <pre>{detalle.datos_anteriores ? JSON.stringify(detalle.datos_anteriores, null, 2) : 'Sin datos'}</pre>
              </div>
              <div>
                <h4>Datos nuevos</h4>
                <pre>{detalle.datos_nuevos ? JSON.stringify(detalle.datos_nuevos, null, 2) : 'Sin datos'}</pre>
              </div>
            </div>
            <button type="button" className="primary-button" onClick={() => setDetalle(null)} style={{ marginTop: '18px' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AuditoriasPage;
