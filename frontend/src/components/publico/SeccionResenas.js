import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../../services/authStorage';
import { crearResena, actualizarResena, listarResenas } from '../../services/resenas.service';
import { ResumenEstrellas, SelectorEstrellas } from './EstrellasCalificacion';
import './resenas-publico.css';

function SeccionResenas({ entidadTipo, entidadId }) {
  const [miResena, setMiResena] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formExpandido, setFormExpandido] = useState(true);
  const logueado = isAuthenticated();

  const cargar = useCallback(async () => {
    if (!entidadId) return;
    setCargando(true);
    setError(null);
    try {
      const datos = await listarResenas(entidadTipo, entidadId);
      setMiResena(datos.mi_resena || null);
      if (datos.mi_resena) {
        setCalificacion(datos.mi_resena.calificacion);
        setComentario(datos.mi_resena.comentario || '');
        setFormExpandido(false);
      } else {
        setCalificacion(0);
        setComentario('');
        setFormExpandido(true);
      }
    } catch (e) {
      setError(e.message || 'No se pudo verificar tu reseña.');
    } finally {
      setCargando(false);
    }
  }, [entidadTipo, entidadId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function enviar(e) {
    e.preventDefault();
    setMensaje(null);

    if (!logueado) {
      setMensaje({ tipo: 'info', texto: 'Debes iniciar sesión para dejar una reseña.' });
      return;
    }
    if (calificacion < 1 || calificacion > 5) {
      setMensaje({ tipo: 'error', texto: 'Debes tocar las estrellas y elegir una calificación del 1 al 5.' });
      return;
    }

    setEnviando(true);
    const eraEdicion = Boolean(miResena && modoEdicion);
    try {
      const payload = {
        entidad_tipo: entidadTipo,
        entidad_id: entidadId,
        calificacion,
        comentario: comentario.trim(),
      };

      let respuesta;
      if (miResena && modoEdicion) {
        respuesta = await actualizarResena(miResena.id, { calificacion, comentario: comentario.trim() });
      } else if (!miResena) {
        respuesta = await crearResena(payload);
      } else {
        setModoEdicion(false);
        setEnviando(false);
        return;
      }

      setMiResena(respuesta.resena);
      setModoEdicion(false);
      setFormExpandido(false);
      setMensaje({
        tipo: 'ok',
        texto: eraEdicion
          ? 'Tu reseña fue actualizada. Gracias por tu opinión.'
          : '¡Gracias! Tu calificación fue registrada.',
      });
    } catch (err) {
      const texto = err.message || 'No se pudo guardar la reseña.';
      if (err.status === 401) {
        setMensaje({ tipo: 'info', texto: 'Tu sesión expiró. Inicia sesión de nuevo para publicar.' });
      } else {
        setMensaje({ tipo: 'error', texto });
      }
    } finally {
      setEnviando(false);
    }
  }

  const mostrarFormulario = !miResena || modoEdicion;

  function abrirEdicion() {
    setModoEdicion(true);
    setFormExpandido(true);
    setMensaje(null);
  }

  return (
    <section className="resenas-seccion resenas-seccion--solo-envio">
      <div className="resenas-seccion__header">
        <div>
          <p className="resenas-seccion__eyebrow">Encuesta rápida</p>
          <h2 className="resenas-seccion__titulo">Califica tu experiencia</h2>
          <p className="resenas-seccion__subtitulo">
            Toma menos de un minuto. Tu opinión es confidencial y nos ayuda a tomar mejores decisiones para el turismo local.
          </p>
        </div>
      </div>

      {error && <p className="resenas-error">{error}</p>}

      {cargando ? (
        <div className="resenas-form-card resenas-form-card--loading">
          <div className="resenas-item resenas-item--skeleton" />
        </div>
      ) : mostrarFormulario ? (
        <div className="resenas-form-card">
          <button
            type="button"
            className="resenas-form-toggle"
            onClick={() => setFormExpandido((v) => !v)}
            aria-expanded={formExpandido}
          >
            <span>{miResena ? 'Editar tu calificación' : 'Enviar calificación y comentario'}</span>
            <svg
              className={`resenas-form-toggle__icon${formExpandido ? ' is-open' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {formExpandido && (
            <form onSubmit={enviar} className="resenas-form-body">
              {!logueado ? (
                <p className="resenas-form-login">
                  <Link to="/admin/login">Inicia sesión</Link>
                  {' '}como visitante para calificar este lugar.
                </p>
              ) : (
                <>
                  <div className="resenas-form-row">
                    <SelectorEstrellas
                      valor={calificacion}
                      onChange={setCalificacion}
                      disabled={enviando}
                      size="lg"
                    />
                  </div>
                  <textarea
                    value={comentario}
                    onChange={(ev) => setComentario(ev.target.value)}
                    rows={2}
                    maxLength={2000}
                    placeholder="Comentario opcional…"
                    className="resenas-form-textarea"
                    disabled={enviando}
                  />
                  <div className="resenas-form-actions">
                    <button type="submit" disabled={enviando} className="resenas-form-submit">
                      {enviando ? 'Enviando…' : miResena ? 'Actualizar' : 'Enviar reseña'}
                    </button>
                    {miResena && modoEdicion && (
                      <button
                        type="button"
                        className="resenas-form-cancel"
                        onClick={() => {
                          setModoEdicion(false);
                          setFormExpandido(false);
                          setCalificacion(miResena.calificacion);
                          setComentario(miResena.comentario || '');
                          setMensaje(null);
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </>
              )}
              {mensaje && (
                <p className={`resenas-form-msg resenas-form-msg--${mensaje.tipo}`}>
                  {mensaje.texto}
                </p>
              )}
            </form>
          )}
        </div>
      ) : (
        <div className="resenas-form-card resenas-form-card--resumen-propio">
          <p className="resenas-mi-resena-label">Ya enviaste tu calificación</p>
          <ResumenEstrellas
            promedio={miResena.calificacion}
            total={0}
            size="sm"
            className="resenas-solo-estrellas"
          />
          {miResena.comentario && (
            <p className="resenas-mi-resena-texto">{miResena.comentario}</p>
          )}
          <p className="resenas-privacidad-nota">
            Solo tú ves tu reseña aquí. El GAD la usa para mejorar la oferta turística.
          </p>
          <button type="button" className="resenas-form-edit-link" onClick={abrirEdicion}>
            Editar mi reseña
          </button>
          {mensaje && (
            <p className={`resenas-form-msg resenas-form-msg--${mensaje.tipo}`}>
              {mensaje.texto}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default SeccionResenas;
