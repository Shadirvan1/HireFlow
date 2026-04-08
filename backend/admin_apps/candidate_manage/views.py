from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from apps.accounts.models import CandidateProfile, Company, HRProfile, User

from .serializers import (
    CandidateProfileSerializer,
    CompanySerializer,
    HRProfileSerializer,
    UserSerializer,
)


class UserListCreateView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, version):
        users = User.objects.all().order_by("-date_joined")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request, version):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes=[IsAdminUser]

    def get(self, request, vesrion, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, vesrion, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, version, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CompanyListCreateView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, version):
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

    def post(self, request, version):
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HRProfileListView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, version):
        profiles = HRProfile.objects.select_related("user", "company").all()
        serializer = HRProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class HRProfileDetailView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, version, pk):
        profile = get_object_or_404(HRProfile, pk=pk)
        serializer = HRProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, version, pk):
        profile = get_object_or_404(HRProfile, pk=pk)
        serializer = HRProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CandidateProfileListView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, version):
        profiles = CandidateProfile.objects.select_related("user").all()
        serializer = CandidateProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class CandidateProfileDetailView(APIView):
    permission_classes=[IsAdminUser]
    def get(self, request, version, pk):
        profile = get_object_or_404(CandidateProfile, pk=pk)
        serializer = CandidateProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, version, pk):
        permission_classes=[IsAdminUser]
        profile = get_object_or_404(CandidateProfile, pk=pk)
        serializer = CandidateProfileSerializer(
            profile, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
