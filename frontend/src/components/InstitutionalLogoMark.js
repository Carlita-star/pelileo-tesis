import { useConfiguracion } from '../context/ConfiguracionContext';

export function getInstitutionalLogoUrl(config, { prefer = 'secondary' } = {}) {
  if (prefer === 'primary') {
    return config.logoUrl || config.logoSecundarioUrl || null;
  }
  return config.logoSecundarioUrl || config.logoUrl || null;
}

export default function InstitutionalLogoMark({
  className = '',
  imgClassName = 'institutional-logo-img',
  fallbackClassName = '',
  prefer = 'secondary',
  alt,
  config: configProp,
  fallbackText,
}) {
  const contextConfig = useConfiguracion();
  const config = configProp || contextConfig;
  const url = getInstitutionalLogoUrl(config, { prefer });
  const altText = alt || config.nombreSistema || 'Logo institucional';

  if (url) {
    return (
      <img
        src={url}
        alt={altText}
        className={[imgClassName, className].filter(Boolean).join(' ')}
      />
    );
  }

  return (
    <span className={[fallbackClassName, className].filter(Boolean).join(' ')}>
      {fallbackText || config.nombreSistema?.charAt(0) || 'P'}
    </span>
  );
}
