import { createContext, useContext, useEffect, useState } from 'react';
import { applySiteFavicon, obtenerConfiguracion } from '../services/configuracion.service';
import { CONFIG_DEFAULT } from '../config/configuracionDefault';

// Este "contexto" guarda la configuración del portal y la comparte con TODOS
// los componentes (Header, Footer, etc.) sin tener que pasarla a mano.
const ConfiguracionContext = createContext(CONFIG_DEFAULT);

// Hook para que cualquier componente lea la configuración: const config = useConfiguracion();
export function useConfiguracion() {
  return useContext(ConfiguracionContext);
}

export function ConfiguracionProvider({ children }) {
  const [config, setConfig] = useState(CONFIG_DEFAULT);

  useEffect(() => {
    // Al cargar el portal, pedimos la configuración a la API una sola vez.
    obtenerConfiguracion().then((cfg) => {
      setConfig(cfg);

      // Metemos los colores en variables CSS. Tailwind las usa al instante,
      // así que si el admin cambia un color en la BD, el portal lo refleja.
      const raiz = document.documentElement;
      raiz.style.setProperty('--color-primario', cfg.colores.primario);
      raiz.style.setProperty('--color-primario-oscuro', cfg.colores.primarioOscuro);
      raiz.style.setProperty('--color-secundario', cfg.colores.secundario);
      if (cfg.colores.terciario) {
        raiz.style.setProperty('--color-terciario', cfg.colores.terciario);
      }
      if (cfg.fuente) {
        raiz.style.setProperty('--fuente-principal', cfg.fuente);
        document.body.style.fontFamily = cfg.fuente;
      }
      if (cfg.tamanoFuente) {
        raiz.style.setProperty('--tamano-fuente-base', `${cfg.tamanoFuente}px`);
        document.body.style.fontSize = `${cfg.tamanoFuente}px`;
      }
      if (cfg.bordeRadio != null) {
        raiz.style.setProperty('--borde-radio', `${cfg.bordeRadio}px`);
      }
      if (cfg.modoOscuro) {
        document.body.classList.add('modo-oscuro');
      } else {
        document.body.classList.remove('modo-oscuro');
      }
    });
  }, []);

  useEffect(() => {
    applySiteFavicon(config.faviconUrl);
  }, [config.faviconUrl]);

  return (
    <ConfiguracionContext.Provider value={config}>
      {children}
    </ConfiguracionContext.Provider>
  );
}