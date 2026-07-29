import DetailMapEmbed from '../DetailMapEmbed';
import DetailImageGallery from '../DetailImageGallery';
import { DetailField, DetailSection, DetailTextBlock } from '../DetailField';
import { formatDateTime, formatList } from '../../../utils/detailFormatters';

function EmprendimientoDetailView({ data, images, imageError }) {
  const g = data.general || {};
  const u = data.ubicacion || {};
  const meta = data.meta || {};
  const redes = (data.redes_sociales || [])
    .map((r) => (r.url ? `${r.nombre_red || 'Red'}: ${r.url}` : null))
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="admin-detail-body">
      <DetailSection title="Información general">
        <DetailField label="Nombre" value={g.nombre} />
        <DetailField label="Categoría" value={meta.categoria} />
        <DetailField label="Estado" value={meta.estado_publicacion} />
        <DetailField label="Parroquia" value={meta.parroquia} />
        <DetailField label="Fecha de creación" value={formatDateTime(meta.creado_en)} />
        <DetailTextBlock label="Descripción" value={g.descripcion} />
      </DetailSection>

      <DetailSection title="Contacto y ubicación">
        <DetailField label="Dirección" value={g.direccion} full />
        <DetailField label="Teléfono" value={g.telefono} />
        <DetailField label="Correo electrónico" value={g.email} />
        <DetailField label="Sitio web" value={g.sitio_web} />
        <DetailField label="Horario" value={g.horario} full />
        <DetailField label="Redes sociales" value={redes || null} full />
      </DetailSection>

      <DetailSection title="Servicios">
        <DetailField label="Servicios ofrecidos" value={formatList(data.servicios)} full />
      </DetailSection>

      <DetailSection title="Coordenadas y mapa">
        <DetailMapEmbed lat={u.latitud} lng={u.longitud} nombre={g.nombre} />
      </DetailSection>

      <DetailSection title="Imágenes">
        <DetailImageGallery images={images} error={imageError} />
      </DetailSection>
    </div>
  );
}

export default EmprendimientoDetailView;
