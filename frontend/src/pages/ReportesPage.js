import { usePublicList } from '../hooks/usePublicList';

function ReportesPage() {
  const { items: reportes, loading, error } = usePublicList('/api/reportes/');
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Reportes</h2>
          <p className="section-description">
            Genera reportes de visitas, uso y estadísticas del sistema.
          </p>
        </div>
      </div>

      {reportes && reportes.length === 0 ? (
        <p className="empty-state">No se encontraron reportes generados.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>Usuario</th>
                <th>Generado</th>
                <th>Archivo</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.tipo_reporte || 'Sin tipo'}</td>
                  <td>{item.formato || '---'}</td>
                  <td>{item.usuario || 'Desconocido'}</td>
                  <td>{item.generado_en ? new Date(item.generado_en).toLocaleString('es-ES') : '---'}</td>
                  <td>{item.archivo_generado || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ReportesPage;
