jobs= {}

def addJob(jobId, num_images):

    jobs[jobId] = {
        "current": 0,
        "total": num_images
    }

def getJob(jobId):
       
    return jobs.get(jobId)
      

def updateJob(jobId,current_num):
    if jobs[jobId] is not None:
        jobs[jobId]["current"] = current_num

def deleteJob(jobId):
    if jobs[jobId] is not None:
        del jobs[jobId]

def print_job():
    print(jobs)