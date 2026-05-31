function AtractivosPage({ atractivos }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Atractivos</h2>
          <p className="section-description">
            Gestiona los atractivos turísticos con su categoría, parroquia y estado.
          </p>
        </div>
      </div>
      {atractivos.length === 0 ? (
        <p className="empty-state">No hay atractivos cargados en el backend.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Parroquia</th>
                <th>Visitas</th>
                <th>Destacado</th>
              </tr>
            </thead>
            <tbody>
              {atractivos.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.categoria || 'Sin categoría'}</td>
                  <td>{item.parroquia || 'Sin parroquia'}</td>
                  <td>{item.visitas ?? '---'}</td>
                  <td>{item.destacado ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AtractivosPage;
