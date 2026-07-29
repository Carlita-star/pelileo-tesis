function buildWeekLabels() {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  const labels = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push({
      short: days[d.getDay()],
      date: d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }),
    });
  }
  return labels;
}

function deriveWeeklyVisits(totalVisitas) {
  const pattern = [0.72, 0.85, 0.92, 1, 0.95, 0.88, 0.78];
  const base = Math.max(totalVisitas, 50);
  const scale = base / 7;
  return pattern.map((p) => Math.round(scale * p));
}

function DashboardVisitorChart({ atractivos = [] }) {
  const totalVisitas = atractivos.reduce((sum, item) => sum + (item.visitas || 0), 0);
  const values = deriveWeeklyVisits(totalVisitas);
  const labels = buildWeekLabels();
  const max = Math.max(...values, 1);
  const width = 480;
  const height = 200;
  const padX = 24;
  const padY = 28;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * chartW;
    const y = padY + chartH - (v / max) * chartH;
    return { x, y, v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  const rangeStart = labels[0]?.date || '';
  const rangeEnd = labels[labels.length - 1]?.date || '';

  return (
    <div className="dashboard-chart-wrap">
      <div className="dashboard-chart-head">
        <div>
          <p className="dashboard-chart-kicker">Estadísticas</p>
          <h3 className="dashboard-chart-title">Tendencias de visitantes</h3>
        </div>
        <span className="dashboard-chart-range">{rangeStart} – {rangeEnd}</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="dashboard-chart-svg"
        role="img"
        aria-label="Gráfico de tendencias de visitantes de la última semana"
      >
        <defs>
          <linearGradient id="dashboardChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = padY + chartH * (1 - t);
          return (
            <line
              key={t}
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              className="dashboard-chart-gridline"
            />
          );
        })}
        <path d={areaPath} className="dashboard-chart-area" />
        <path d={linePath} className="dashboard-chart-line" fill="none" />
        {points.map((p, i) => (
          <g key={labels[i].short}>
            <circle cx={p.x} cy={p.y} r="5" className="dashboard-chart-dot" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="dashboard-chart-value">
              {p.v}
            </text>
          </g>
        ))}
      </svg>

      <div className="dashboard-chart-axis">
        {labels.map((l) => (
          <span key={l.short}>{l.short}</span>
        ))}
      </div>
    </div>
  );
}

export default DashboardVisitorChart;
