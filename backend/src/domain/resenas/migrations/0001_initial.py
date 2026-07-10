# Generated manually for reviews module (PostgreSQL + MySQL compatible)

import django.core.validators
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
            name='Resena',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entidad_tipo', models.CharField(choices=[('atractivo', 'Atractivo'), ('ruta', 'Ruta'), ('emprendimiento', 'Emprendimiento'), ('evento', 'Evento')], db_index=True, max_length=20)),
                ('entidad_id', models.BigIntegerField(db_index=True)),
                ('calificacion', models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('comentario', models.TextField(blank=True, default='')),
                ('activo', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resenas', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Reseña',
                'verbose_name_plural': 'Reseñas',
                'db_table': 'resenas',
                'ordering': ['-creado_en'],
                'indexes': [
                    models.Index(fields=['entidad_tipo', 'entidad_id'], name='resenas_entidad_idx'),
                    models.Index(fields=['entidad_tipo', 'entidad_id', 'activo'], name='resenas_entidad_act_idx'),
                ],
            },
        ),
        migrations.AddConstraint(
            model_name='resena',
            constraint=models.UniqueConstraint(fields=('usuario', 'entidad_tipo', 'entidad_id'), name='resenas_usuario_entidad_unique'),
        ),
    ]
