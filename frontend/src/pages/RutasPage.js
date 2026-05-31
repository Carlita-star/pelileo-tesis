function RutasPage({ rutas }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Rutas</h2>
          <p className="section-description">
            Controla rutas turísticas, dificultad, duración estimada y distancia.
          </p>
        </div>
      </div>
      {rutas.length === 0 ? (
        <p className="empty-state">No hay rutas disponibles para mostrar.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dificultad</th>
                <th>Duración</th>
                <th>Distancia (km)</th>
                <th>Destacado</th>
              </tr>
            </thead>
            <tbody>
              {rutas.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.dificultad || 'No definida'}</td>
                  <td>{item.duracion_estimada || 'Sin dato'}</td>
                  <td>{item.distancia_km ?? '---'}</td>
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

export default RutasPage;
