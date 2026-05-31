function EmprendimientosPage({ emprendimientos }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Emprendimientos</h2>
          <p className="section-description">
            Pantalla para gestionar los emprendimientos locales y sus servicios.
          </p>
        </div>
      </div>
      {emprendimientos && emprendimientos.length === 0 ? (
        <p className="empty-state">No hay emprendimientos cargados en el backend.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Parroquia</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {emprendimientos && emprendimientos.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.categoria || 'Sin categoría'}</td>
                  <td>{item.parroquia || 'Sin parroquia'}</td>
                  <td>{item.telefono || '---'}</td>
                  <td>{item.email || '---'}</td>
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

export default EmprendimientosPage;
