"""
Generador de fichas PDF institucionales con ReportLab.
"""

from io import BytesIO
from typing import Any, Dict, List

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

COLOR_PRIMARY = colors.HexColor('#0f4aa0')
COLOR_ACCENT = colors.HexColor('#1D9E75')
COLOR_LIGHT = colors.HexColor('#f0f6ff')
COLOR_TEXT = colors.HexColor('#1e293b')
COLOR_MUTED = colors.HexColor('#64748b')

SECTION_ICONS = {
    'Información general': '◆',
    'Descripción': '✎',
    'Ubicación y acceso': '📍',
    'Ubicación y horarios': '📍',
    'Ubicación y mapa': '🗺',
    'Detalle turístico': '★',
    'Recomendaciones': '✓',
    'Accesibilidad': '♿',
    'Conservación y seguridad': '🛡',
    'Administración y contacto': '☎',
    'Contacto y presencia digital': '☎',
    'Servicios y actividades': '⚙',
    'Servicios ofrecidos': '⚙',
    'Características de la ruta': '⛰',
    'Recorrido': '→',
    'Atractivos incluidos en la ruta': '◎',
    'Redes sociales': '🔗',
    'Relaciones turísticas': '↔',
    'Metadatos del registro': '📋',
    'Galería de imágenes': '🖼',
}


class FichaPdfBuilder:
    def __init__(self, ficha: Dict[str, Any]):
        self.ficha = ficha
        self._page_num = 0

    def build(self) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=2.4 * cm,
            bottomMargin=2.2 * cm,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            title=f"{self.ficha.get('tipo_label', 'Ficha')} — {self.ficha.get('titulo', '')}",
        )
        story = self._build_story()
        doc.build(story, onFirstPage=self._draw_page_frame, onLaterPages=self._draw_page_frame)
        return buffer.getvalue()

    def _styles(self):
        base = getSampleStyleSheet()
        return {
            'cover_title': ParagraphStyle(
                'CoverTitle',
                parent=base['Title'],
                fontSize=22,
                leading=28,
                textColor=COLOR_PRIMARY,
                alignment=TA_CENTER,
                spaceAfter=8,
            ),
            'cover_sub': ParagraphStyle(
                'CoverSub',
                parent=base['Normal'],
                fontSize=12,
                textColor=COLOR_MUTED,
                alignment=TA_CENTER,
                spaceAfter=4,
            ),
            'cover_entity': ParagraphStyle(
                'CoverEntity',
                parent=base['Heading1'],
                fontSize=18,
                leading=24,
                textColor=COLOR_TEXT,
                alignment=TA_CENTER,
                spaceBefore=16,
                spaceAfter=8,
            ),
            'section': ParagraphStyle(
                'Section',
                parent=base['Heading2'],
                fontSize=13,
                leading=16,
                textColor=COLOR_PRIMARY,
                spaceBefore=14,
                spaceAfter=8,
                borderPadding=4,
            ),
            'label': ParagraphStyle(
                'Label',
                parent=base['Normal'],
                fontSize=9,
                leading=12,
                textColor=COLOR_MUTED,
            ),
            'value': ParagraphStyle(
                'Value',
                parent=base['Normal'],
                fontSize=10,
                leading=14,
                textColor=COLOR_TEXT,
            ),
            'text_block': ParagraphStyle(
                'TextBlock',
                parent=base['Normal'],
                fontSize=10,
                leading=14,
                textColor=COLOR_TEXT,
                spaceAfter=8,
            ),
            'img_caption': ParagraphStyle(
                'ImgCaption',
                parent=base['Normal'],
                fontSize=9,
                textColor=COLOR_MUTED,
                alignment=TA_CENTER,
                spaceAfter=10,
            ),
        }

    def _draw_page_frame(self, canvas, doc):
        canvas.saveState()
        w, h = A4
        sistema = self.ficha.get('sistema', 'Pelileo Turismo')
        canvas.setStrokeColor(COLOR_PRIMARY)
        canvas.setLineWidth(0.5)
        canvas.line(2 * cm, h - 1.6 * cm, w - 2 * cm, h - 1.6 * cm)
        canvas.setFont('Helvetica-Bold', 9)
        canvas.setFillColor(COLOR_PRIMARY)
        canvas.drawString(2 * cm, h - 1.35 * cm, sistema)
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(COLOR_MUTED)
        canvas.drawRightString(w - 2 * cm, h - 1.35 * cm, self.ficha.get('tipo_label', ''))
        canvas.setStrokeColor(COLOR_ACCENT)
        canvas.line(2 * cm, 1.5 * cm, w - 2 * cm, 1.5 * cm)
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(COLOR_MUTED)
        canvas.drawString(2 * cm, 1 * cm, f"Generado: {self.ficha.get('generado_en', '')}")
        canvas.drawRightString(w - 2 * cm, 1 * cm, f'Página {canvas.getPageNumber()}')
        canvas.restoreState()

    def _cover_block(self, styles) -> List:
        elements = []
        logo_path = self.ficha.get('logo_path')
        if logo_path:
            try:
                img = Image(logo_path, width=3.5 * cm, height=3.5 * cm, kind='proportional')
                img.hAlign = 'CENTER'
                elements.append(img)
                elements.append(Spacer(1, 0.4 * cm))
            except Exception:
                pass

        elements.append(Paragraph(self.ficha.get('sistema', 'Pelileo Turismo'), styles['cover_title']))
        elements.append(Paragraph(self.ficha.get('eslogan', ''), styles['cover_sub']))
        elements.append(Spacer(1, 0.6 * cm))
        elements.append(Paragraph('FICHA INSTITUCIONAL', styles['cover_sub']))
        elements.append(Paragraph(self.ficha.get('tipo_label', ''), styles['cover_sub']))
        elements.append(Spacer(1, 0.3 * cm))
        elements.append(Paragraph(self.ficha.get('titulo', ''), styles['cover_entity']))
        elements.append(Spacer(1, 0.2 * cm))
        elements.append(Paragraph(
            f"Documento generado el {self.ficha.get('generado_en', '')}",
            styles['cover_sub'],
        ))
        elements.append(Spacer(1, 0.8 * cm))
        return elements

    def _fields_table(self, fields: List, styles) -> Table:
        rows = []
        for label, value in fields:
            safe_val = str(value).replace('\n', '<br/>')
            rows.append([
                Paragraph(f'<b>{label}</b>', styles['label']),
                Paragraph(safe_val, styles['value']),
            ])
        table = Table(rows, colWidths=[5.5 * cm, 11.5 * cm])
        table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, COLOR_LIGHT]),
            ('LINEBELOW', (0, 0), (-1, -1), 0.25, colors.HexColor('#e2e8f0')),
        ]))
        return table

    def _section_block(self, section: Dict, styles) -> List:
        icon = SECTION_ICONS.get(section['title'], '▪')
        title = f"{icon}  {section['title']}"
        block = [Paragraph(title, styles['section'])]
        if section.get('fields'):
            block.append(self._fields_table(section['fields'], styles))
        for label, value in section.get('text_blocks') or []:
            block.append(Spacer(1, 0.15 * cm))
            block.append(Paragraph(f'<b>{label}</b>', styles['label']))
            safe = str(value).replace('\n', '<br/>')
            block.append(Paragraph(safe, styles['text_block']))
        block.append(Spacer(1, 0.25 * cm))
        return block

    def _images_block(self, styles) -> List:
        images = self.ficha.get('images') or []
        if not images:
            return [
                Paragraph(f"{SECTION_ICONS.get('Galería de imágenes', '🖼')}  Galería de imágenes", styles['section']),
                Paragraph('No registrado', styles['text_block']),
            ]

        block = [Paragraph(f"{SECTION_ICONS.get('Galería de imágenes', '🖼')}  Galería de imágenes", styles['section'])]
        for img_meta in images:
            path = img_meta.get('path')
            if not path:
                continue
            try:
                img = Image(path, width=14 * cm, height=9 * cm, kind='proportional')
                img.hAlign = 'CENTER'
                caption = img_meta.get('titulo') or 'Imagen'
                if img_meta.get('descripcion'):
                    caption += f" — {img_meta['descripcion']}"
                block.append(KeepTogether([
                    Spacer(1, 0.2 * cm),
                    img,
                    Paragraph(caption, styles['img_caption']),
                ]))
            except Exception:
                block.append(Paragraph(
                    f"{img_meta.get('titulo', 'Imagen')}: no se pudo incluir el archivo.",
                    styles['text_block'],
                ))
        return block

    def _build_story(self) -> List:
        styles = self._styles()
        story = self._cover_block(styles)
        story.append(PageBreak())

        for section in self.ficha.get('sections') or []:
            story.extend(self._section_block(section, styles))

        story.append(PageBreak())
        story.extend(self._images_block(styles))
        return story
