# Generated manually for error logging module

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ErrorLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('nombre_usuario', models.CharField(blank=True, default='', max_length=255)),
                ('modulo', models.CharField(db_index=True, default='general', max_length=100)),
                ('tipo', models.CharField(choices=[('validacion', 'Validación'), ('base_datos', 'Base de datos'), ('autenticacion', 'Autenticación'), ('permiso', 'Permiso'), ('red', 'Red / conexión'), ('archivo', 'Archivo'), ('servidor', 'Servidor'), ('cliente', 'Cliente (frontend)'), ('desconocido', 'Desconocido')], db_index=True, default='desconocido', max_length=30)),
                ('http_status', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('ruta', models.CharField(blank=True, default='', max_length=500)),
                ('metodo', models.CharField(blank=True, default='', max_length=10)),
                ('mensaje_usuario', models.TextField()),
                ('mensaje_tecnico', models.TextField(blank=True, default='')),
                ('stack_trace', models.TextField(blank=True, default='')),
                ('estado', models.CharField(choices=[('pendiente', 'Pendiente'), ('en_revision', 'En revisión'), ('solucionado', 'Solucionado')], db_index=True, default='pendiente', max_length=20)),
                ('ip_address', models.CharField(blank=True, default='', max_length=100)),
                ('user_agent', models.TextField(blank=True, default='')),
                ('metadata', models.JSONField(blank=True, null=True)),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='errores_registrados', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Registro de error',
                'verbose_name_plural': 'Bitácora de errores',
                'db_table': 'error_logs',
                'ordering': ['-fecha'],
                'indexes': [models.Index(fields=['tipo', 'estado'], name='error_logs_tipo_es_8c2f0a_idx'), models.Index(fields=['modulo', 'fecha'], name='error_logs_modulo__a1b2c3_idx')],
            },
        ),
    ]
