#### 55 Hours of No Power
While deploying [this website](https://github.com/willgleich/gleich.tech) I figured since I already have a kubernetes
 environment at home, I'd just plan to deploy to my homelab cluster. My power and internet have been stable enough in the past
 few years, and the price of the home deployment is cheap. I figure I can take a smaller outage occasionally. Well.. development on this website has increased lately,
 and Salt Lake City recently had a historic windstorm that resulted in my property losing power for 55 hours! There were other propreties
 in SLC that had lost power for 5+ days! Needless to say will.gleich.tech was down for those 55 hours, and that was unacceptable. 
 I wanted to find an inexpensive solution to allow for failover to the cloud.
  I had been looking at exploring lambdas and thought this would be perfect.
 If I can configure a cloud monitor in GCP, if that monitor triggers a lambda, I could utilize that cloud monitor to 
 deploy a new replica of my web server in the cloud. After a manual mock-up it looked like GCP's cloud run would be the deployment solution. 
 Cost savings is a big goal here which is why I didn't look into a full static deployment and load balancing. 
### Project Time
#### Architecture
img



#### Python Client
The work was cut out for me, it was time to start digging into coding and wiring up deployment of the newly minted
"gleich-tech-switch" lambda project. I wanted to get some exposure to GCP's APIs to get a firm footing, 
I was confident google had some sort of python integration with all of their offerings. This step took longer than I initially anticipated, 
I went into this thinking I'd be copying and pasting some code which was only partially true. After some trial and error 
I found a workable solution and gained experience with the `google-api-python-client` python package. This package builds an api around googles REST api menu offerings.
All of GCPs REST Schema [are available on the web](https://www.googleapis.com/discovery/v1/apis/) to allow for dynamic api client creation.
Using the following command `cloud_run = googleapiclient.discovery.build('run', 'v1')` an API schema is brought in. 
I decided I wanted to abstract their client into my own class to allow for readable code, and here is a snippet of my CloudRunService abstraction:
```python3
class CloudRunService(object):
    def __init__(self, service_name, project, location):
        self.service_name = service_name
        self.project = project
        self.location = location
        self.cloud_run = googleapiclient.discovery.build('run', 'v1')

    def delete(self):
        return self.cloud_run.projects().locations().services().delete(
            name=f"projects/{self.project}/locations/{self.location}/services/{self.service_name}").execute()
```
Project variable is the project number you are working in and location is the region you are selecting. So that was that,
I was able to deploy a cloud run instance utilizing python. Now to wire up this code so that the google monitoring could
call this code when there is a monitoring failure. 

#### Serverless
I have read about and used serverless in the past. I immediately started jumping to deployments using the serverless node.JS based helper utility.
Getting the local deployments off the group were a breeze, `serverless create --template google-python --path gleich-tech-switch`
and I had a template. A few minor edits and I was already deploying with `serverless deploy` using the helloworld example.
Getting a hello world template'd and deployed was trivial, however things started to become more involved while trying to 
integrate the serverless with my drone.io build process. I needed to leverage the `serverless-python-requirements` plugin for handling python dependencies. 
I noticed that google 
Furthermore, I decided that I did not want to maintain my own serverless build docker image
and was suprised to not find a community maintained serverless docker image.


#### Improvements