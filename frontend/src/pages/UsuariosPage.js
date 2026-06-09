import { usePublicList } from '../hooks/usePublicList';

function UsuariosPage() {
  const { items: usuarios, loading, error } = usePublicList('/api/usuarios/');
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Usuarios</h2>
          <p className="section-description">
            Administrar usuarios, roles y permisos de acceso al panel y las entidades.
          </p>
        </div>
      </div>
      {usuarios && usuarios.length === 0 ? (
        <p className="empty-state">No hay usuarios en el sistema.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Creado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios && usuarios.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre_completo}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>{item.telefono || '---'}</td>
                  <td>{item.creado_en ? new Date(item.creado_en).toLocaleDateString('es-ES') : '---'}</td>
                  <td>{item.activo ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default UsuariosPage;
