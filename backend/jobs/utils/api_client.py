# for interfacing with O*NET API

from . import OnetWebService
# import requests
import os, sys

def get_user_input(prompt):
    result = ''
    while (len(result) == 0):
        result = input(prompt + ': ').strip()
    return result

def check_for_error(service_result):
    if 'error' in service_result:
        sys.exit(service_result['error'])

# return an SOC code from the name of an occupation
# returns SOC of top result from whatever input is given
def get_soc_code(occupation, onet_ws):
    occupation = occupation.strip()

    kwresults = onet_ws.call('online/search', 
                            ('keyword', occupation), 
                            ('end', 1))

    if (not 'occupation' in kwresults) or (0 == len(kwresults['occupation'])):
        print("No relevant occupations were found.")
        print("")
    else:
        occ = kwresults['occupation'][0]
        return occ['code']

def get_job_info(soc_code, onet_ws):
    kwresults = onet_ws.call(f'mnm/careers/{soc_code}')
    check_for_error(kwresults)

    return kwresults['what_they_do']

# returns a list of tasks from soc_code
def get_tasks(soc_code, onet_ws):
    kwresults = onet_ws.call(f'mnm/careers/{soc_code}')
    check_for_error(kwresults)

    tasks = []

    for task in kwresults['on_the_job']['task']:
        tasks.append(task)
    
    return tasks

# returns full JSON of job information
def get_all_job_info(soc_code, onet_ws):
    kwresults = onet_ws.call(f'mnm/careers/{soc_code}')
    check_for_error(kwresults)

    return kwresults

# class externalAPIClient:
#     onet_ws = OnetWebService(
#         username=os.environ.get("ONET_USERNAME"), 
#         password=os.environ.get("ONET_PASSWORD")
#         )