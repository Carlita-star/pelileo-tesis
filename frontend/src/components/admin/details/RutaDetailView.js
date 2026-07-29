import DetailImageGallery from '../DetailImageGallery';
import { DetailField, DetailSection, DetailTextBlock } from '../DetailField';
import { formatDateTime, NA } from '../../../utils/detailFormatters';

function RutaDetailView({ data, images, imageError }) {
  const g = data.general || {};
  const meta = data.meta || {};
  const puntos = data.puntos_interes || [];

  return (
    <div className="admin-detail-body">
      <DetailSection title="Información general">
        <DetailField label="Nombre" value={g.nombre} />
        <DetailField label="Estado" value={meta.estado_publicacion} />
        <DetailField label="Parroquia" value={meta.parroquia} />
        <DetailField label="Distancia" value={g.distancia_km != null ? `${g.distancia_km} km` : null} />
        <DetailField label="Duración estimada" value={g.duracion_estimada} />
        <DetailField label="Dificultad" value={g.dificultad} />
        <DetailField label="Fecha de creación" value={formatDateTime(meta.creado_en)} />
        <DetailTextBlock label="Descripción" value={g.descripcion} />
      </DetailSection>

      <DetailSection title="Recorrido">
        <DetailField label="Punto de inicio" value={g.punto_inicio} />
        <DetailField label="Punto de fin" value={g.punto_fin} />
      </DetailSection>

      <DetailSection title="Puntos de interés">
        {puntos.length === 0 ? (
          <p className="admin-detail-empty">{NA}</p>
        ) : (
          <ol className="admin-detail-list">
            {puntos.map((p) => (
              <li key={`${p.atractivo_id}-${p.orden}`}>
                <strong>{p.orden}.</strong> {p.nombre || NA}
              </li>
            ))}
          </ol>
        )}
      </DetailSection>

      <DetailSection title="Imágenes">
        <DetailImageGallery images={images} error={imageError} />
      </DetailSection>
    </div>
  );
}

export default RutaDetailView;
