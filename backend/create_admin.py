import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixelshop_backend.settings')
django.setup()

from users.models import User

user_id = "admin"
email = "admin@example.com"
password = "password123"

if not User.objects.filter(user_id=user_id).exists():
    user = User.objects.create_user(
        user_id=user_id,
        email=email,
        password=password,
        display_name="Administrator"
    )
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f"User {user_id} created successfully.")
else:
    print(f"User {user_id} already exists.")
