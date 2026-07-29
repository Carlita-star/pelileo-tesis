import DetailMapEmbed from '../DetailMapEmbed';
import DetailImageGallery from '../DetailImageGallery';
import { DetailField, DetailSection, DetailTextBlock } from '../DetailField';
import { formatDateTime, formatList, NA } from '../../../utils/detailFormatters';

function AtractivoDetailView({ data, images, imageError }) {
  const g = data.general || {};
  const u = data.ubicacion || {};
  const adm = data.administracion || {};
  const meta = data.meta || {};

  const contacto = [adm.telefono, adm.correo].filter(Boolean).join(' · ') || null;
  const ubicacionTexto = [g.direccion, meta.parroquia].filter(Boolean).join(', ') || null;

  return (
    <div className="admin-detail-body">
      <DetailSection title="Información general">
        <DetailField label="Nombre" value={g.nombre} />
        <DetailField label="Categoría" value={meta.categoria} />
        <DetailField label="Estado" value={meta.estado_publicacion} />
        <DetailField label="Parroquia" value={meta.parroquia} />
        <DetailField label="Fecha de creación" value={formatDateTime(meta.creado_en)} />
        <DetailField label="Visitas" value={meta.visitas} />
        <DetailTextBlock label="Descripción" value={g.descripcion} />
      </DetailSection>

      <DetailSection title="Ubicación y horarios">
        <DetailField label="Dirección" value={ubicacionTexto} full />
        <DetailField label="Horario" value={g.horario} full />
        <DetailField label="Precio referencial" value={g.precio_referencial != null ? `$${g.precio_referencial}` : null} />
      </DetailSection>

      <DetailSection title="Contacto">
        <DetailField label="Administrador" value={adm.nombre_administrador} />
        <DetailField label="Institución" value={adm.institucion_responsable} />
        <DetailField label="Teléfono / Correo" value={contacto} full />
      </DetailSection>

      <DetailSection title="Servicios y actividades">
        <DetailField label="Servicios" value={formatList(data.servicios)} full />
        <DetailField label="Actividades" value={formatList(data.actividades)} full />
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

export default AtractivoDetailView;
