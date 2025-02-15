from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .utils import api_client
from .utils.OnetWebService import OnetWebService
import os

# example call for this: GET /api/tasks/?job_title=Software%20Engineer
@api_view(['GET'])
def get_info(request):
    # job_title parameter is pulled from frontend POST
    job_title = request.GET.get('job_title') # extract from query params
    if not job_title:
        return Response({'error': 'Job title is required'}, status=400)
    
    onet_ws = OnetWebService(os.environ.get("ONET_USERNAME"), os.environ.get("ONET_PASSWORD"))
    
    description = api_client.get_job_info(api_client.get_soc_code(job_title, onet_ws), onet_ws)
    tasks = api_client.get_tasks(api_client.get_soc_code(job_title, onet_ws), onet_ws)

    return Response({'description': description,
                     'tasks': tasks
                     })


