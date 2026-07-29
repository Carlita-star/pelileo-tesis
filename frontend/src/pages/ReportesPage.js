import { useCallback, useEffect, useState } from 'react';
import { apiRequest, getApiBase, getAuthHeaders } from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import { useErrorToast } from '../hooks/useErrorToast';

const EMPTY_FILTROS = {
  estado: 'todos',
  categoria_id: '',
  desde: '',
  hasta: '',
  formato: 'pdf',
};

function ReportesPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [tipos, setTipos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [filtrosMeta, setFiltrosMeta] = useState({ estados: [], categorias: [], estados_usuario: [] });
  const [modalTipo, setModalTipo] = useState(null);
  const [filtros, setFiltros] = useState(EMPTY_FILTROS);
  const [ultimoGenerado, setUltimoGenerado] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/api/admin/reportes/?page=${page}&page_size=10`);
      setTipos(data.tipos || []);
      setHistorial(data.results || []);
      setFiltrosMeta(data.filtros || { estados: [], categorias: [], estados_usuario: [] });
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      const msg = err.message || '';
      if (/403|administrador/i.test(msg)) {
        setError('Solo el administrador puede acceder a los reportes.');
      } else {
        setError(msg || 'No se pudieron cargar los reportes.');
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { cargar(); }, [cargar]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: cargar } });

  const abrirModal = (tipo) => {
    setModalTipo(tipo);
    setFiltros({ ...EMPTY_FILTROS });
    setError('');
  };

  const cerrarModal = () => {
    if (generando) return;
    setModalTipo(null);
  };

  const descargar = async (reporteId, nombreArchivo) => {
    try {
      const response = await fetch(`${getApiBase()}/api/admin/reportes/${reporteId}/descargar/`, {
        headers: getAuthHeaders(false),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Error ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo || `reporte_${reporteId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'No se pudo descargar el archivo.');
    }
  };

  const generarReporte = async (e) => {
    e.preventDefault();
    if (!modalTipo) return;

    setGenerando(true);
    setError('');
    try {
      const payload = {
        tipo_reporte: modalTipo.key,
        formato: filtros.formato,
        filtros: {
          estado: filtros.estado,
          desde: filtros.desde || null,
          hasta: filtros.hasta || null,
          categoria_id: filtros.categoria_id ? Number(filtros.categoria_id) : null,
        },
      };
      const result = await apiRequest('/api/admin/reportes/generar/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUltimoGenerado(result);
      toast.success(`Reporte generado correctamente (${result.formato?.toUpperCase()}).`);
      setModalTipo(null);
      cargar();
      if (result.id) {
        await descargar(result.id, result.archivo_generado?.split('/').pop());
      }
    } catch (err) {
      toast.error(err.message || 'Error al generar el reporte.');
    } finally {
      setGenerando(false);
    }
  };

  const tipoModal = tipos.find((t) => t.key === modalTipo?.key) || modalTipo;

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Generación de reportes</h2>
          <p className="section-description">
            Exporte información del sistema en PDF o Excel para control interno y presentación a autoridades.
          </p>
        </div>
      </div>

      {ultimoGenerado && (
        <div className="reporte-descarga-reciente">
          <p>
            Último reporte:
            {' '}
            <strong>{ultimoGenerado.tipo_label || ultimoGenerado.tipo_reporte}</strong>
            {' '}
            (
            {ultimoGenerado.formato?.toUpperCase()}
            )
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => descargar(ultimoGenerado.id, ultimoGenerado.archivo_generado?.split('/').pop())}
          >
            Descargar archivo
          </button>
        </div>
      )}

      <div className="reportes-cards-grid">
        {(tipos.length ? tipos : [
          { key: 'atractivos', nombre: 'Reporte de atractivos', descripcion: '', icono: '🏔️', usa_categoria: true, usa_estado_publicacion: true },
          { key: 'rutas', nombre: 'Reporte de rutas', descripcion: '', icono: '🗺️', usa_categoria: false, usa_estado_publicacion: true },
          { key: 'emprendimientos', nombre: 'Reporte de emprendimientos', descripcion: '', icono: '🏪', usa_categoria: true, usa_estado_publicacion: true },
          { key: 'usuarios', nombre: 'Reporte de usuarios', descripcion: '', icono: '👥', usa_categoria: false, usa_estado_publicacion: false },
        ]).map((tipo) => (
          <article key={tipo.key} className="reporte-card">
            <span className="reporte-card-icono">{tipo.icono}</span>
            <h3>{tipo.nombre}</h3>
            <p>{tipo.descripcion}</p>
            <button type="button" className="primary-button" onClick={() => abrirModal(tipo)}>
              Generar
            </button>
          </article>
        ))}
      </div>

      <h3 className="reportes-historial-titulo">Historial de reportes generados</h3>
      <div className="table-responsive">
        <table className="entity-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Formato</th>
              <th>Fecha de generación</th>
              <th>Generado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="table-spinner"><span className="loader" />Cargando…</div>
                </td>
              </tr>
            ) : historial.length === 0 ? (
              <tr>
                <td colSpan="5"><p className="empty-state">No hay reportes generados aún.</p></td>
              </tr>
            ) : (
              historial.map((item) => (
                <tr key={item.id}>
                  <td>{item.tipo_label || item.tipo_reporte}</td>
                  <td>{(item.formato || '').toUpperCase()}</td>
                  <td>{item.generado_en ? new Date(item.generado_en).toLocaleString('es-ES') : '—'}</td>
                  <td>{item.usuario || '—'}</td>
                  <td>
                    {item.archivo_generado ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => descargar(item.id, item.archivo_generado.split('/').pop())}
                      >
                        Descargar
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-controls">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      </div>

      {modalTipo && tipoModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content catalog-modal" onClick={(ev) => ev.stopPropagation()}>
            <h3>{tipoModal.nombre}</h3>
            <p className="section-description">{tipoModal.descripcion}</p>

            <form className="catalog-form" onSubmit={generarReporte}>
              {tipoModal.usa_estado_publicacion && (
                <label>
                  Estado de publicación
                  <select value={filtros.estado} onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}>
                    <option value="todos">Todos</option>
                    {filtrosMeta.estados.map((est) => (
                      <option key={est.codigo} value={est.codigo}>{est.nombre}</option>
                    ))}
                  </select>
                </label>
              )}

              {tipoModal.key === 'usuarios' && (
                <label>
                  Estado del usuario
                  <select value={filtros.estado} onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value }))}>
                    {(filtrosMeta.estados_usuario || []).map((est) => (
                      <option key={est.codigo} value={est.codigo}>{est.nombre}</option>
                    ))}
                  </select>
                </label>
              )}

              {tipoModal.usa_categoria && (
                <label>
                  Categoría
                  <select value={filtros.categoria_id} onChange={(e) => setFiltros((f) => ({ ...f, categoria_id: e.target.value }))}>
                    <option value="">Todas</option>
                    {filtrosMeta.categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </label>
              )}

              <div className="usuario-form-grid">
                <label>
                  Desde
                  <input type="date" value={filtros.desde} onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))} />
                </label>
                <label>
                  Hasta
                  <input type="date" value={filtros.hasta} onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))} />
                </label>
              </div>

              <label>
                Formato
                <select value={filtros.formato} onChange={(e) => setFiltros((f) => ({ ...f, formato: e.target.value }))}>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel (.xlsx)</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={cerrarModal} disabled={generando}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button" disabled={generando}>
                  {generando ? 'Generando…' : 'Generar y descargar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReportesPage;
