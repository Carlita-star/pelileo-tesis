function TarjetaInstitucional({ titulo, texto, children, indice = 0 }) {
  if (!texto?.trim()) return null;

  const acentos = [
    'from-emerald-500/15 via-teal-400/5 to-transparent',
    'from-sky-500/15 via-blue-400/5 to-transparent',
    'from-amber-500/15 via-orange-400/5 to-transparent',
  ];
  const acento = acentos[indice % acentos.length];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_16px_48px_-20px_rgba(15,47,105,0.18)] ring-1 ring-slate-200/70 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-18px_rgba(29,158,117,0.22)]">
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${acento}`} aria-hidden />
      <div className="absolute left-0 top-8 h-16 w-1 rounded-r-full bg-gradient-to-b from-primario to-secundario opacity-90" aria-hidden />

      <div className="relative flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primario to-emerald-600 text-white shadow-lg shadow-primario/30 transition duration-500 group-hover:scale-105 group-hover:shadow-primario/40">
            {children}
          </div>
          <div className="min-w-0 pt-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primario/80">
              Institucional
            </span>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{titulo}</h3>
          </div>
        </div>

        <p className="flex-1 text-[0.98rem] leading-[1.75] text-slate-600 sm:text-base">
          {texto}
        </p>

        <div className="mt-6 flex items-center gap-2">
          <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-primario to-secundario" />
          <div className="h-1 w-6 rounded-full bg-primario/25" />
        </div>
      </div>
    </article>
  );
}

function IconoHistoria() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconoMision() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoVision() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
      ? 'sm:grid-cols-2 max-w-5xl mx-auto'
      : 'lg:grid-cols-3';

  return (
    <section className="relative overflow-hidden bg-[#f4f8fb] py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(29,158,117,0.08),transparent_55%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primario/8 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-secundario/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primario/20 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primario shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primario" aria-hidden />
            GAD Municipal
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {nombre ? `Conoce a ${nombre}` : 'Nuestra identidad institucional'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Historia, propósito y proyección del cantón que impulsa el turismo local.
          </p>
        </div>

        <div className={`mt-10 grid gap-6 sm:gap-8 ${columnas}`}>
          {tarjetas.map(({ titulo, texto, Icon }, i) => (
            <TarjetaInstitucional key={titulo} titulo={titulo} texto={texto} indice={i}>
              <Icon />
            </TarjetaInstitucional>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SeccionInstitucional;
