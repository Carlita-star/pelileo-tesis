function ConfiguracionPage({ configuracion }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Configuración</h2>
          <p className="section-description">
            Ajusta los valores globales de la app, la información de empresa y la apariencia del sitio.
          </p>
        </div>
      </div>

      {!configuracion ? (
        <p className="empty-state">No hay configuración disponible en el backend.</p>
      ) : (
        <>
          <div className="section-group">
            <h3>Empresa</h3>
            <p><strong>Nombre:</strong> {configuracion.empresa.nombre}</p>
            <p><strong>RUC:</strong> {configuracion.empresa.ruc}</p>
            <p><strong>Email:</strong> {configuracion.empresa.email || '---'}</p>
            <p><strong>Teléfono:</strong> {configuracion.empresa.telefono || '---'}</p>
            <p><strong>Dirección:</strong> {configuracion.empresa.direccion || '---'}</p>
          </div>

          <div className="section-group">
            <h3>Apariencia</h3>
            {configuracion.apariencia ? (
              <>
                <p><strong>Color primario:</strong> {configuracion.apariencia.color_primario || '---'}</p>
                <p><strong>Color secundario:</strong> {configuracion.apariencia.color_secundario || '---'}</p>
                <p><strong>Modo oscuro:</strong> {configuracion.apariencia.modo_oscuro ? 'Sí' : 'No'}</p>
              </>
            ) : (
              <p>No hay apariencia configurada.</p>
            )}
          </div>

          <div className="section-group">
            <h3>Configuraciones</h3>
            {configuracion.configuraciones && configuracion.configuraciones.length > 0 ? (
              <ul>
                {configuracion.configuraciones.map((item) => (
                  <li key={item.clave}>
                    <strong>{item.clave}:</strong> {item.valor || '---'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay configuraciones adicionales.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ConfiguracionPage;
