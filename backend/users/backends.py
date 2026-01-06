# backend/users/backends.py
from django.contrib.auth.backends import ModelBackend
from .models import User

class UserIdAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Djangoはusernameを受け取るので、user_idにマッピングする
        """
        try:
            user = User.objects.get(user_id=username)
        except User.DoesNotExist:
            return None

        if user.check_password(password):
            return user
        return None
