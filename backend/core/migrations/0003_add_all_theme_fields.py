from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_sitesettings_favicon_sitesettings_primary_color_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='text_color',
            field=models.CharField(default='#ffffff', help_text='Main text color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='text_secondary_color',
            field=models.CharField(default='#94a3b8', help_text='Secondary/muted text color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='button_bg_color',
            field=models.CharField(default='#fbbf24', help_text='Button background color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='button_text_color',
            field=models.CharField(default='#000000', help_text='Button text color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='link_color',
            field=models.CharField(default='#fbbf24', help_text='Link color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='link_hover_color',
            field=models.CharField(default='#f59e0b', help_text='Link hover color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='success_color',
            field=models.CharField(default='#10b981', help_text='Success/positive color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='error_color',
            field=models.CharField(default='#ef4444', help_text='Error/danger color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='warning_color',
            field=models.CharField(default='#f59e0b', help_text='Warning/alert color (hex code)', max_length=7),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='border_color',
            field=models.CharField(default='#334155', help_text='Border/divider color (hex code)', max_length=7),
        ),
        migrations.AlterField(
            model_name='sitesettings',
            name='primary_color',
            field=models.CharField(default='#fbbf24', help_text='Primary brand color (hex code)', max_length=7),
        ),
    ]