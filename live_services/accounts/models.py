from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    # This is the "bridge" that fixes the get_by_natural_key error
    def get_by_natural_key(self, email):
        return self.get(email=email)

class User(AbstractBaseUser, PermissionsMixin):
    # Field names must match your Main Project's User model exactly
    username = models.CharField(max_length=56)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, default="CANDIDATE")
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email" # Matches your main project
    REQUIRED_FIELDS = ["username"]

    class Meta:
        managed = False        # CRITICAL: Don't let Live Chat edit the table
        db_table = 'accounts_user' # Matches your Postgres table name

    def __str__(self):
        return self.email