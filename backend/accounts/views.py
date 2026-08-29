from django.contrib.auth import get_user_model
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


@extend_schema(
    tags=['auth'],
    summary='Register a new account',
    responses={201: OpenApiResponse(description='Account created; returns the user and a JWT pair.')},
)
class RegisterView(generics.CreateAPIView):
    """Create an account and hand back a usable session in one round trip."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['auth'], summary='Log in and obtain a JWT pair')
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=['auth'], summary='Log out by blacklisting a refresh token')
class LogoutView(APIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data['refresh']).blacklist()
        except TokenError:
            # An already-expired or already-blacklisted token is not an error
            # from the client's point of view: the session is gone either way.
            pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


@extend_schema(tags=['auth'], summary='Current authenticated user')
class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
