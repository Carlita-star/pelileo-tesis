function PublicacionesPage({ publicaciones }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Publicaciones</h2>
          <p className="section-description">
            Revisión y aprobación de publicaciones en atractivos, rutas y emprendimientos.
          </p>
        </div>
      </div>

      {publicaciones && publicaciones.length === 0 ? (
        <p className="empty-state">No hay registros de publicaciones para mostrar.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entidad</th>
                <th>Estado anterior</th>
                <th>Estado nuevo</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.entidad_tipo || 'N/D'} #{item.entidad_id ?? '---'}</td>
                  <td>{item.estado_anterior || 'N/D'}</td>
                  <td>{item.estado_nuevo || 'N/D'}</td>
                  <td>{item.usuario || 'Anónimo'}</td>
                  <td>{item.cambiado_en ? new Date(item.cambiado_en).toLocaleString('es-ES') : '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PublicacionesPage;
