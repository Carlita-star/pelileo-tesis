import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applySiteFavicon,
  applyThemeVariables,
  obtenerConfiguracion,
} from '../services/configuracion.service';
import { CONFIG_DEFAULT } from '../config/configuracionDefault';

const ConfiguracionContext = createContext({
  config: CONFIG_DEFAULT,
  refetchConfiguracion: async () => CONFIG_DEFAULT,
});

export function useConfiguracion() {
  return useContext(ConfiguracionContext).config;
}

export function useRefetchConfiguracion() {
  return useContext(ConfiguracionContext).refetchConfiguracion;
}

export function ConfiguracionProvider({ children }) {
  const [config, setConfig] = useState(CONFIG_DEFAULT);

  const refetchConfiguracion = useCallback(async () => {
    const cfg = await obtenerConfiguracion();
    setConfig(cfg);
    applyThemeVariables(cfg);
    return cfg;
  }, []);

  useEffect(() => {
    refetchConfiguracion();
  }, [refetchConfiguracion]);

  useEffect(() => {
    applySiteFavicon(config.faviconUrl);
  }, [config.faviconUrl]);

  const value = useMemo(
    () => ({ config, refetchConfiguracion }),
    [config, refetchConfiguracion],
  );

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
}
