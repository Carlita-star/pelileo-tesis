import json
from math import ceil
from typing import Any, Dict, List, Optional

from django.db.models import Q
from django.utils import timezone
from slug import slug as generate_slug

from src.application.ports.atractivo_admin_repository import AtractivoAdminRepositoryPort
from src.application.dto.atractivo_dto import AtractivoCompleteDTO
from src.domain.atractivos.models import Atractivo, AtractivoDetalle, AtractivoAccesibilidad, AtractivoEstadoConservacion, AtractivoAdministracion, AtractivoServicio, AtractivoActividad
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.servicios import Servicio
from src.domain.catalogos.actividades import Actividad
from src.domain.multimedia.models import Multimedia
from src.domain.auditorias.models import Auditoria
from src.domain.shared.media_urls import build_media_url



class DjangoAtractivoAdminRepository(AtractivoAdminRepositoryPort):
    def _build_queryset(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        parroquia_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
    ):
        queryset = Atractivo.objects.filter(activo=True).select_related('categoria', 'parroquia', 'estado_publicacion')

        if search:
            queryset = queryset.filter(nombre__icontains=search.strip())

        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        if parroquia_id:
            queryset = queryset.filter(parroquia_id=parroquia_id)

        if estado_codigo and estado_codigo.lower() != 'todos':
            queryset = queryset.filter(estado_publicacion__codigo__iexact=estado_codigo)

        return queryset.order_by('-creado_en')

    def listar_para_admin(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        parroquia_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        queryset = self._build_queryset(search, categoria_id, parroquia_id, estado_codigo)
        total = queryset.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 100))
        offset = (page - 1) * page_size
        items = list(queryset[offset:offset + page_size])

        atractivos_ids = [item.id for item in items]
        multimedia_items = Multimedia.objects.filter(
            entidad_tipo='atractivo',
            entidad_id__in=atractivos_ids,
            tipo='imagen',
            activo=True,
        ).order_by('entidad_id', '-principal', 'orden')

        thumbnails: Dict[int, str] = {}
        for media in multimedia_items:
            if media.entidad_id not in thumbnails:
                thumbnails[media.entidad_id] = build_media_url(media.archivo) or ''

        data = []
        for atractivo in items:
            data.append(
                {
                    'id': atractivo.id,
                    'nombre': atractivo.nombre,
                    'categoria': atractivo.categoria.nombre if atractivo.categoria_id else None,
                    'parroquia': atractivo.parroquia.nombre if atractivo.parroquia_id else None,
                    'estado_publicacion': atractivo.estado_publicacion.nombre if atractivo.estado_publicacion_id else None,
                    'estado_publicacion_codigo': atractivo.estado_publicacion.codigo if atractivo.estado_publicacion_id else None,
                    'visitas': atractivo.visitas,
                    'activo': atractivo.activo,
                    'imagen': thumbnails.get(atractivo.id),
                }
            )

        categorias = list(
            Categoria.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')
        )
        parroquias = list(
            Parroquia.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')
        )
        estados = list(
            EstadoPublicacion.objects.order_by('nombre').values('codigo', 'nombre')
        )

        return {
            'results': data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': ceil(total / page_size) if page_size else 0,
            'categorias': categorias,
            'parroquias': parroquias,
            'estados': estados,
        }

    def eliminar_logico(self, atractivo_id: int) -> bool:
        atractivo = Atractivo.objects.filter(id=atractivo_id).first()
        if not atractivo:
            return False
        atractivo.activo = False
        atractivo.save(update_fields=['activo'])
        return True

    def cambiar_estado_publicacion(self, atractivo_id: int, estado_codigo: str) -> bool:
        atractivo = Atractivo.objects.filter(id=atractivo_id).first()
        if not atractivo:
            return False

        estado = EstadoPublicacion.objects.filter(codigo__iexact=estado_codigo).first()
        if not estado:
            return False

        atractivo.estado_publicacion = estado
        atractivo.activo = True
        atractivo.save(update_fields=['estado_publicacion', 'activo'])
        return True

    def obtener_para_edicion(self, atractivo_id: int) -> Optional[Dict[str, Any]]:
        atractivo = Atractivo.objects.select_related('categoria', 'parroquia', 'estado_publicacion', 'creado_por').filter(id=atractivo_id).first()
        if not atractivo:
            return None

        detalle = atractivo.detalle if hasattr(atractivo, 'detalle') else None
        accesibilidad = atractivo.accesibilidad if hasattr(atractivo, 'accesibilidad') else None
        conservacion = atractivo.estado_conservacion if hasattr(atractivo, 'estado_conservacion') else None
        administracion = atractivo.administracion if hasattr(atractivo, 'administracion') else None

        servicios = list(atractivo.atractivo_servicios.values_list('servicio_id', flat=True))
        actividades = list(atractivo.atractivo_actividades.values_list('actividad_id', flat=True))

        servicios_nombres = list(
            Servicio.objects.filter(id__in=servicios).values('id', 'nombre')
        ) if servicios else []
        actividades_nombres = list(
            Actividad.objects.filter(id__in=actividades).values('id', 'nombre')
        ) if actividades else []

        return {
            'id': atractivo.id,
            'meta': {
                'categoria': atractivo.categoria.nombre if atractivo.categoria_id else None,
                'parroquia': atractivo.parroquia.nombre if atractivo.parroquia_id else None,
                'estado_publicacion': atractivo.estado_publicacion.nombre if atractivo.estado_publicacion_id else None,
                'creado_en': atractivo.creado_en.isoformat() if atractivo.creado_en else None,
                'actualizado_en': atractivo.actualizado_en.isoformat() if atractivo.actualizado_en else None,
                'visitas': atractivo.visitas,
            },
            'general': {
                'nombre': atractivo.nombre,
                'slug': atractivo.slug,
                'categoria_id': atractivo.categoria_id,
                'parroquia_id': atractivo.parroquia_id,
                'descripcion': atractivo.descripcion,
                'direccion': atractivo.direccion,
                'horario': atractivo.horario,
                'precio_referencial': float(atractivo.precio_referencial) if atractivo.precio_referencial else None,
            },
            'ubicacion': {
                'latitud': float(atractivo.latitud) if atractivo.latitud else None,
                'longitud': float(atractivo.longitud) if atractivo.longitud else None,
                'altitud': float(atractivo.altitud) if atractivo.altitud else None,
            },
            'detalle': {
                'clima': detalle.clima if detalle else None,
                'temperatura': detalle.temperatura if detalle else None,
                'precipitacion': detalle.precipitacion if detalle else None,
                'linea_producto': detalle.linea_producto if detalle else None,
                'escenario': detalle.escenario if detalle else None,
                'tipo_ingreso': detalle.tipo_ingreso if detalle else None,
                'costo': float(detalle.costo) if detalle and detalle.costo else None,
                'formas_pago': detalle.formas_pago if detalle else None,
                'meses_recomendados': detalle.meses_recomendados if detalle else None,
                'observaciones': detalle.observaciones if detalle else None,
            },
            'accesibilidad': {
                'tipo_via': accesibilidad.tipo_via if accesibilidad else None,
                'estado_via': accesibilidad.estado_via if accesibilidad else None,
                'tipo_transporte': accesibilidad.tipo_transporte if accesibilidad else None,
                'tiempo_desplazamiento': accesibilidad.tiempo_desplazamiento if accesibilidad else None,
                'distancia_referencial_km': float(accesibilidad.distancia_referencial_km) if accesibilidad and accesibilidad.distancia_referencial_km else None,
                'posee_senalizacion': accesibilidad.posee_senalizacion if accesibilidad else None,
                'acceso_discapacidad': accesibilidad.acceso_discapacidad if accesibilidad else None,
                'observaciones': accesibilidad.observaciones if accesibilidad else None,
            },
            'conservacion': {
                'estado_conservacion': conservacion.estado_conservacion if conservacion else None,
                'nivel_seguridad': conservacion.nivel_seguridad if conservacion else None,
                'posee_senal_internet': conservacion.posee_senal_internet if conservacion else None,
                'cobertura_operadora': conservacion.cobertura_operadora if conservacion else None,
                'centro_salud_cercano': conservacion.centro_salud_cercano if conservacion else None,
                'distancia_centro_salud_km': float(conservacion.distancia_centro_salud_km) if conservacion and conservacion.distancia_centro_salud_km else None,
                'observaciones': conservacion.observaciones if conservacion else None,
            },
            'administracion': {
                'tipo_administrador': administracion.tipo_administrador if administracion else None,
                'institucion_responsable': administracion.institucion_responsable if administracion else None,
                'nombre_administrador': administracion.nombre_administrador if administracion else None,
                'cargo': administracion.cargo if administracion else None,
                'telefono': administracion.telefono if administracion else None,
                'correo': administracion.correo if administracion else None,
            },
            'servicios_ids': servicios,
            'actividades_ids': actividades,
            'servicios': servicios_nombres,
            'actividades': actividades_nombres,
            'estado_publicacion_codigo': atractivo.estado_publicacion.codigo if atractivo.estado_publicacion else 'borrador',
        }

    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        return {
            'categorias': list(Categoria.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'parroquias': list(Parroquia.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'estados': list(EstadoPublicacion.objects.values('codigo', 'nombre')),
            'servicios': list(Servicio.objects.filter(activo=True).values('id', 'nombre')),
            'actividades': list(Actividad.objects.filter(activo=True).values('id', 'nombre')),
        }

    def _get_or_create_categoria(self, categoria_id: Optional[int], categoria_nombre: Optional[str]) -> int:
        if categoria_id:
            return categoria_id

        nombre = (categoria_nombre or '').strip()
        if not nombre:
            raise ValueError('La categoría es requerida.')

        existente = Categoria.objects.filter(nombre__iexact=nombre).first()
        if existente:
            if not existente.activo:
                existente.activo = True
                existente.save(update_fields=['activo'])
            return existente.id

        return Categoria.objects.create(nombre=nombre, activo=True).id

    def _get_or_create_parroquia(self, parroquia_id: Optional[int], parroquia_nombre: Optional[str]) -> int:
        if parroquia_id:
            return parroquia_id

        nombre = (parroquia_nombre or '').strip()
        if not nombre:
            raise ValueError('La parroquia es requerida.')

        existente = Parroquia.objects.filter(nombre__iexact=nombre).first()
        if existente:
            if not existente.activo:
                existente.activo = True
                existente.save(update_fields=['activo'])
            return existente.id

        return Parroquia.objects.create(nombre=nombre, canton='Pelileo', activo=True).id

    def guardar_completo(self, data: AtractivoCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        # Obtener o crear atractivo
        if data.id:
            atractivo = Atractivo.objects.get(id=data.id)
            es_nuevo = False
        else:
            atractivo = Atractivo()
            es_nuevo = True
            atractivo.creado_por_id = usuario_id

        # Obtener estado
        estado = EstadoPublicacion.objects.filter(codigo__iexact=data.estado_publicacion_codigo).first()
        if not estado:
            estado = EstadoPublicacion.objects.filter(codigo='borrador').first()

        # Actualizar datos generales
        atractivo.nombre = data.general.nombre
        atractivo.slug = data.general.slug or generate_slug(data.general.nombre)
        atractivo.categoria_id = self._get_or_create_categoria(
            data.general.categoria_id,
            data.general.categoria_nombre,
        )
        atractivo.parroquia_id = self._get_or_create_parroquia(
            data.general.parroquia_id,
            data.general.parroquia_nombre,
        )
        atractivo.descripcion = data.general.descripcion
        atractivo.direccion = data.general.direccion
        atractivo.horario = data.general.horario
        atractivo.precio_referencial = data.general.precio_referencial
        atractivo.latitud = data.ubicacion.latitud
        atractivo.longitud = data.ubicacion.longitud
        atractivo.altitud = data.ubicacion.altitud
        atractivo.estado_publicacion = estado
        atractivo.activo = True
        atractivo.actualizado_en = timezone.now()

        atractivo.save()

        # Guardar o actualizar detalle
        detalle, _ = AtractivoDetalle.objects.get_or_create(atractivo=atractivo)
        detalle.clima = data.detalle.clima
        detalle.temperatura = data.detalle.temperatura
        detalle.precipitacion = data.detalle.precipitacion
        detalle.linea_producto = data.detalle.linea_producto
        detalle.escenario = data.detalle.escenario
        detalle.tipo_ingreso = data.detalle.tipo_ingreso
        detalle.costo = data.detalle.costo
        detalle.formas_pago = data.detalle.formas_pago
        detalle.meses_recomendados = data.detalle.meses_recomendados
        detalle.observaciones = data.detalle.observaciones
        detalle.save()

        # Guardar o actualizar accesibilidad
        accesibilidad, _ = AtractivoAccesibilidad.objects.get_or_create(atractivo=atractivo)
        accesibilidad.tipo_via = data.accesibilidad.tipo_via
        accesibilidad.estado_via = data.accesibilidad.estado_via
        accesibilidad.tipo_transporte = data.accesibilidad.tipo_transporte
        accesibilidad.tiempo_desplazamiento = data.accesibilidad.tiempo_desplazamiento
        accesibilidad.distancia_referencial_km = data.accesibilidad.distancia_referencial_km
        accesibilidad.posee_senalizacion = data.accesibilidad.posee_senalizacion
        accesibilidad.acceso_discapacidad = data.accesibilidad.acceso_discapacidad
        accesibilidad.observaciones = data.accesibilidad.observaciones
        accesibilidad.save()

        # Guardar o actualizar conservación
        conservacion, _ = AtractivoEstadoConservacion.objects.get_or_create(atractivo=atractivo)
        conservacion.estado_conservacion = data.conservacion.estado_conservacion
        conservacion.nivel_seguridad = data.conservacion.nivel_seguridad
        conservacion.posee_senal_internet = data.conservacion.posee_senal_internet
        conservacion.cobertura_operadora = data.conservacion.cobertura_operadora
        conservacion.centro_salud_cercano = data.conservacion.centro_salud_cercano
        conservacion.distancia_centro_salud_km = data.conservacion.distancia_centro_salud_km
        conservacion.observaciones = data.conservacion.observaciones
        conservacion.save()

        # Guardar o actualizar administración
        administracion, _ = AtractivoAdministracion.objects.get_or_create(atractivo=atractivo)
        administracion.tipo_administrador = data.administracion.tipo_administrador
        administracion.institucion_responsable = data.administracion.institucion_responsable
        administracion.nombre_administrador = data.administracion.nombre_administrador
        administracion.cargo = data.administracion.cargo
        administracion.telefono = data.administracion.telefono
        administracion.correo = data.administracion.correo
        administracion.save()

        # Actualizar servicios
        AtractivoServicio.objects.filter(atractivo=atractivo).delete()
        for servicio_id in data.servicios_ids:
            AtractivoServicio.objects.create(atractivo=atractivo, servicio_id=servicio_id)

        # Actualizar actividades
        AtractivoActividad.objects.filter(atractivo=atractivo).delete()
        for actividad_id in data.actividades_ids:
            AtractivoActividad.objects.create(atractivo=atractivo, actividad_id=actividad_id)

        # Registrar auditoría
        accion = 'CREAR' if es_nuevo else 'EDITAR'
        Auditoria.objects.create(
            usuario_id=usuario_id,
            tabla_afectada='atractivos',
            entidad_id=atractivo.id,
            accion=accion,
        )

        return self.obtener_para_edicion(atractivo.id)
