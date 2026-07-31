from django.db import migrations, models
import django.db.models.deletion


GUIAS_OFICIALES = [
    {
        'nombre': 'Jarrín Tibanquiza Alexandra Elizabeth',
        'especialidad': 'Guía Nacional de Turismo',
        'email': 'aelizaj17@gmail.com',
        'telefono': '0998346459',
        'orden': 0,
    },
    {
        'nombre': 'Ramos Moreno Anthony Joel',
        'especialidad': 'Guía Nacional de Turismo',
        'email': '',
        'telefono': '0986868326',
        'orden': 1,
    },
    {
        'nombre': 'Patricio Cisneros',
        'especialidad': 'Guía Nacional de Turismo',
        'email': '',
        'telefono': '0992665488',
        'orden': 2,
    },
    {
        'nombre': 'Soria Cordones Edgar Paúl',
        'especialidad': 'Guía de Turismo de Aventura / Guía de Turismo Nacional',
        'email': '',
        'telefono': '0988030968',
        'orden': 3,
    },
]


def seed_guias(apps, schema_editor):
    Empresa = apps.get_model('empresa', 'Empresa')
    GuiaTuristico = apps.get_model('empresa', 'GuiaTuristico')
    empresa = Empresa.objects.order_by('id').first()
    if not empresa:
        return
    if GuiaTuristico.objects.filter(empresa=empresa).exists():
        return
    for g in GUIAS_OFICIALES:
        GuiaTuristico.objects.create(
            empresa=empresa,
            nombre=g['nombre'],
            especialidad=g['especialidad'] or None,
            email=g['email'] or None,
            telefono=g['telefono'] or None,
            orden=g['orden'],
            activo=True,
        )


def unseed_guias(apps, schema_editor):
    GuiaTuristico = apps.get_model('empresa', 'GuiaTuristico')
    nombres = [g['nombre'] for g in GUIAS_OFICIALES]
    GuiaTuristico.objects.filter(nombre__in=nombres, foto__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('empresa', '0002_autoridad'),
    ]

    operations = [
        migrations.CreateModel(
            name='GuiaTuristico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('especialidad', models.CharField(blank=True, max_length=200, null=True)),
                ('telefono', models.CharField(blank=True, max_length=50, null=True)),
                ('email', models.CharField(blank=True, max_length=150, null=True)),
                ('bio', models.TextField(blank=True, null=True)),
                ('foto', models.CharField(blank=True, max_length=255, null=True)),
                ('orden', models.IntegerField(default=0)),
                ('activo', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('empresa', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='guias_turisticos',
                    to='empresa.empresa',
                )),
            ],
            options={
                'verbose_name': 'Guía turístico',
                'verbose_name_plural': 'Guías turísticos',
                'db_table': 'guias_turisticos',
                'ordering': ['orden', 'id'],
            },
        ),
        migrations.RunPython(seed_guias, unseed_guias),
    ]
