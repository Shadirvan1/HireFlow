from django.shortcuts import render
from rest_framework import views,status
from .serializers import SeekerSerializer,Hrserializer
from rest_framework.response import Response

# Create your views here.

class seeker_register(views.APIView):
    permission_classes=[]
    serializer_class = SeekerSerializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful. Please login.",
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "role": user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class hr_register(views.APIView):
    permission_classes=[]
    serializer_class = Hrserializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful. Please login.",
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "role": user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


