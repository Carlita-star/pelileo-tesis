from django.db import models
 
 
class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    nombre_comercial = models.CharField(max_length=200, blank=True, null=True)
    ruc = models.CharField(max_length=13, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    celular = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=150, blank=True, null=True)
    sitio_web = models.URLField(max_length=255, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    provincia = models.CharField(max_length=100, blank=True, null=True)
    canton = models.CharField(max_length=100, blank=True, null=True)
    parroquia = models.CharField(max_length=100, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    historia = models.TextField(blank=True, null=True)
    mision = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    logo_principal = models.CharField(max_length=255, blank=True, null=True)
    logo_secundario = models.CharField(max_length=255, blank=True, null=True)
    favicon = models.CharField(max_length=255, blank=True, null=True)
    latitud = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitud = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    estado = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'empresas'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
 
    def __str__(self):
        return self.nombre
 
 
class AparienciaSistema(models.Model):
    empresa = models.OneToOneField(
        Empresa, on_delete=models.CASCADE, related_name='apariencia'
    )
    color_primario = models.CharField(max_length=20, blank=True, null=True)
    color_secundario = models.CharField(max_length=20, blank=True, null=True)
    color_terciario = models.CharField(max_length=20, blank=True, null=True)
    fuente_principal = models.CharField(max_length=100, blank=True, null=True)
    fuente_secundaria = models.CharField(max_length=100, blank=True, null=True)
    tamano_fuente_base = models.IntegerField(default=16)
    modo_oscuro = models.BooleanField(default=False)
    borde_radio = models.IntegerField(default=10)
    sombra_global = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'apariencia_sistema'
        verbose_name = 'Apariencia del Sistema'
 
    def __str__(self):
        return f"Apariencia - {self.empresa.nombre}"
 
 
class ConfiguracionHeader(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='headers'
    )
    mostrar_logo = models.BooleanField(default=True)
    mostrar_menu = models.BooleanField(default=True)
    mostrar_buscador = models.BooleanField(default=True)
    mostrar_redes = models.BooleanField(default=True)
    texto_superior = models.CharField(max_length=255, blank=True, null=True)
    color_fondo = models.CharField(max_length=20, blank=True, null=True)
    color_texto = models.CharField(max_length=20, blank=True, null=True)
    altura_header = models.IntegerField(default=80)
    sticky = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'configuracion_header'
        verbose_name = 'Configuración de Header'
 
    def __str__(self):
        return f"Header - {self.empresa.nombre}"
 
 
class ConfiguracionFooter(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='footers'
    )
    descripcion = models.TextField(blank=True, null=True)
    mostrar_redes = models.BooleanField(default=True)
    mostrar_contacto = models.BooleanField(default=True)
    mostrar_mapa = models.BooleanField(default=True)
    copyright_texto = models.CharField(max_length=255, blank=True, null=True)
    color_fondo = models.CharField(max_length=20, blank=True, null=True)
    color_texto = models.CharField(max_length=20, blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'configuracion_footer'
        verbose_name = 'Configuración de Footer'
 
    def __str__(self):
        return f"Footer - {self.empresa.nombre}"
 
 
class MenuNavegacion(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='menus'
    )
    menu_padre = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='submenus'
    )
    nombre = models.CharField(max_length=100)
    ruta = models.CharField(max_length=255, blank=True, null=True)
    icono = models.CharField(max_length=100, blank=True, null=True)
    orden = models.IntegerField(default=0)
    visible = models.BooleanField(default=True)
    tipo_enlace = models.CharField(max_length=50, blank=True, null=True)
    abierto_nueva_pestana = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'menu_navegacion'
        verbose_name = 'Menú de Navegación'
        ordering = ['orden']
 
    def __str__(self):
        return self.nombre
 
 
class RedSocial(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='redes_sociales'
    )
    nombre = models.CharField(max_length=100, blank=True, null=True)
    icono = models.CharField(max_length=100, blank=True, null=True)
    url = models.TextField()
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'redes_sociales'
        verbose_name = 'Red Social'

    def __str__(self):
        return f"{self.nombre} - {self.empresa.nombre}"


class Autoridad(models.Model):
    """Autoridades del cantón (alcalde, concejales, etc.) mostradas en el portal."""
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='autoridades'
    )
    nombre = models.CharField(max_length=200)
    cargo = models.CharField(max_length=150, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    foto = models.CharField(max_length=255, blank=True, null=True)
    orden = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'autoridades'
        verbose_name = 'Autoridad'
        verbose_name_plural = 'Autoridades'
        ordering = ['orden', 'id']

    def __str__(self):
        return f"{self.nombre} ({self.cargo or 'sin cargo'})"


class GuiaTuristico(models.Model):
    """Guías de turismo del cantón (sección del inicio, según inventario oficial)."""
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='guias_turisticos'
    )
    nombre = models.CharField(max_length=200)
    especialidad = models.CharField(max_length=200, blank=True, null=True)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    foto = models.CharField(max_length=255, blank=True, null=True)
    orden = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'guias_turisticos'
        verbose_name = 'Guía turístico'
        verbose_name_plural = 'Guías turísticos'
        ordering = ['orden', 'id']

    def __str__(self):
        return f"{self.nombre} ({self.especialidad or 'guía'})"


class Configuracion(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name='configuraciones'
    )
    clave = models.CharField(max_length=150, unique=True)
    valor = models.TextField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    editable = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'configuraciones'
        verbose_name = 'Configuración'
 
    def __str__(self):
        return self.clave