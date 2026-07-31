from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('empresa', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Autoridad',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('cargo', models.CharField(blank=True, max_length=150, null=True)),
                ('bio', models.TextField(blank=True, null=True)),
                ('foto', models.CharField(blank=True, max_length=255, null=True)),
                ('orden', models.IntegerField(default=0)),
                ('activo', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('empresa', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='autoridades',
                    to='empresa.empresa',
                )),
            ],
            options={
                'verbose_name': 'Autoridad',
                'verbose_name_plural': 'Autoridades',
                'db_table': 'autoridades',
                'ordering': ['orden', 'id'],
            },
        ),
    ]
