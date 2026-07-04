function TarjetaInstitucional({ titulo, texto, children, className = '' }) {
  if (!texto?.trim()) return null;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8 ${className}`}
    >
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primario/10 text-primario transition group-hover:bg-primario group-hover:text-white">
          {children}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{titulo}</h3>
      </div>
      <p className="flex-1 text-base leading-relaxed text-slate-600">{texto}</p>
      <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-r from-primario to-secundario opacity-80" />
    </article>
  );
}

function IconoHistoria() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconoMision() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoVision() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function SeccionInstitucional({ nombre, historia, mision, vision }) {
  const tarjetas = [
    { titulo: 'Historia', texto: historia, Icon: IconoHistoria },
    { titulo: 'Misión', texto: mision, Icon: IconoMision },
    { titulo: 'Visión', texto: vision, Icon: IconoVision },
  ].filter((item) => item.texto?.trim());

  if (tarjetas.length === 0) return null;

  const columnas = tarjetas.length === 1
    ? 'max-w-2xl mx-auto'
    : tarjetas.length === 2
      ? 'sm:grid-cols-2'
      : 'lg:grid-cols-3';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-primario/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-secundario/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primario/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primario">
            GAD Municipal
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            {nombre ? `Conoce a ${nombre}` : 'Nuestra identidad institucional'}
          </h2>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            Historia, propósito y proyección del cantón que impulsa el turismo local.
          </p>
        </div>

        <div className={`mt-12 grid gap-6 ${columnas}`}>
          {tarjetas.map(({ titulo, texto, Icon }) => (
            <TarjetaInstitucional key={titulo} titulo={titulo} texto={texto}>
              <Icon />
            </TarjetaInstitucional>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SeccionInstitucional;
