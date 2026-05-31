function EventosPage({ eventos }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Eventos</h2>
          <p className="section-description">
            Gestiona los eventos turísticos y culturales que ocurren en Pelileo.
          </p>
        </div>
      </div>
      {eventos && eventos.length === 0 ? (
        <p className="empty-state">No hay eventos cargados en el sistema.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Fecha Inicio</th>
                <th>Organizador</th>
                <th>Costo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {eventos && eventos.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.categoria || '---'}</td>
                  <td>{item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-ES') : '---'}</td>
                  <td>{item.organizador || '---'}</td>
                  <td>${item.costo ?? '---'}</td>
                  <td>{item.estado_publicacion || 'No definido'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default EventosPage;
