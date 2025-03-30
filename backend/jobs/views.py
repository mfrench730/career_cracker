from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .utils import api_client
from .utils.OnetWebService import OnetWebService
from rest_framework.permissions import IsAuthenticated
import os


class get_info_view(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        job_title = request.GET.get('job_title')
        if not job_title:
            return Response({'error': 'Job title is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # O*NET instance
        onet_ws = OnetWebService(os.environ.get("ONET_USERNAME"), os.environ.get("ONET_PASSWORD"))

        description = api_client.get_job_info(api_client.get_soc_code(job_title, onet_ws), onet_ws)
        tasks = api_client.get_tasks(api_client.get_soc_code(job_title, onet_ws), onet_ws)

        data = {
            'description': description,
            'tasks': tasks
        }
        return Response(data)




