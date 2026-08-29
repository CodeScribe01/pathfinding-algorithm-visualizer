from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('username', 'email', 'is_staff', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'date_joined', 'last_login')

    fieldsets = DjangoUserAdmin.fieldsets + (
        ('PathForge', {'fields': ('created_at',)}),
    )
