function Sidebar({ activePage, onSelectPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'atractivos', label: 'Atractivos' },
    { id: 'rutas', label: 'Rutas' },
    { id: 'emprendimientos', label: 'Emprendimientos' },
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'reportes', label: 'Reportes' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'auditorias', label: 'Auditorías' },
    { id: 'configuracion', label: 'Configuración' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">PT</div>
        <div>
          <div className="brand-name">Pelileo Tourism</div>
          <div className="brand-subtitle">Panel Administrativo</div>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`menu-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onSelectPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
