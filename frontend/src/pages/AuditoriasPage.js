function AuditoriasPage({ auditorias }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Auditorías</h2>
          <p className="section-description">
            Revisa el historial de cambios y publicaciones del sistema.
          </p>
        </div>
      </div>

      {auditorias && auditorias.length === 0 ? (
        <p className="empty-state">No hay auditorías disponibles en este momento.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Tabla</th>
                <th>Acción</th>
                <th>IP</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {auditorias.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.usuario || 'Sistema'}</td>
                  <td>{item.tabla_afectada || 'Sin tabla'}</td>
                  <td>{item.accion || '---'}</td>
                  <td>{item.ip_address || '---'}</td>
                  <td>{item.fecha ? new Date(item.fecha).toLocaleString('es-ES') : '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AuditoriasPage;
