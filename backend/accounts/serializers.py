from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Public representation of an account — never includes the password."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'created_at')
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='At least 8 characters. Validated against Django password validators.',
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        # create_user hashes the password; never assign it directly.
        return User.objects.create_user(**validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    """Token pair plus the serialised user, so the SPA can render immediately."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text='Refresh token to blacklist.')
