import DetailMapEmbed from '../DetailMapEmbed';
import DetailImageGallery from '../DetailImageGallery';
import { DetailField, DetailSection, DetailTextBlock } from '../DetailField';
import { formatDateTime } from '../../../utils/detailFormatters';

function EventoDetailView({ data, images, imageError }) {
  const meta = data.meta || {};
  const u = data.ubicacion || {};

  return (
    <div className="admin-detail-body">
      <DetailSection title="Información general">
        <DetailField label="Nombre" value={data.nombre} />
        <DetailField label="Categoría" value={meta.categoria} />
        <DetailField label="Estado" value={meta.estado_publicacion} />
        <DetailField label="Organizador" value={data.organizador} />
        <DetailField label="Contacto" value={data.contacto} />
        <DetailField label="Costo" value={data.costo != null ? `$${data.costo}` : null} />
        <DetailField label="Fecha de creación" value={formatDateTime(meta.creado_en)} />
        <DetailTextBlock label="Descripción" value={data.descripcion} />
      </DetailSection>

      <DetailSection title="Fechas y ubicación">
        <DetailField label="Fecha inicio" value={formatDateTime(data.fecha_inicio)} />
        <DetailField label="Fecha fin" value={formatDateTime(data.fecha_fin)} />
        <DetailField label="Dirección" value={data.direccion} full />
      </DetailSection>

      <DetailSection title="Coordenadas y mapa">
        <DetailMapEmbed lat={u.latitud} lng={u.longitud} nombre={data.nombre} />
      </DetailSection>

      <DetailSection title="Imágenes">
        <DetailImageGallery images={images} error={imageError} />
      </DetailSection>
    </div>
  );
}

export default EventoDetailView;
