from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('posts', '0021_comment_updated_at_treasurecomment_parent_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='treasurepost',
            name='read_by',
            field=models.ManyToManyField(blank=True, related_name='read_treasure_posts', to=settings.AUTH_USER_MODEL),
        ),
    ]
