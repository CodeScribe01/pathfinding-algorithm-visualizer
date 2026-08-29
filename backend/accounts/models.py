from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model.

    Swapped in from the start (AUTH_USER_MODEL) because retrofitting one later
    is painful. Adds a unique email and an explicit ``created_at`` so the
    account timeline is queryable without relying on ``date_joined``.
    """

    email = models.EmailField('email address', unique=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'pathforge_user'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email'], name='user_email_idx'),
        ]

    def __str__(self):
        return self.username
