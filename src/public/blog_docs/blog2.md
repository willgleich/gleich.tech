#### 55 Hours of No Power
While deploying [this website](https://github.com/willgleich/gleich.tech) I figured since I already have a kubernetes
environment at home, I'd just plan to deploy to my homelab cluster. My power and internet have been stable enough in the past
few years, and the price of the home deployment is cheap. I figure I can take a smaller outage occasionally. Well.. development on this website has increased lately,
and [Salt Lake City recently had a historic windstorm](https://www.ksl.com/article/50015604/utah-windstorm-how-it-happened-and-how-it-fits-in-with-other-extreme-weather-events-in-state-history) 
that resulted in my property losing power for 55 hours! There were other properties
in SLC that had lost power for 5+ days! Needless to say will.gleich.tech was down for those 55 hours, and that was unacceptable. 
I wanted to find an inexpensive solution to allow for fail over to the cloud.
I had been looking at exploring lambdas and thought this would be perfect.
If I can configure a cloud monitor in GCP, if that monitor triggers a lambda, I could utilize that cloud monitor to 
deploy a new replica of my web server in the cloud. After a manual mock-up it looked like GCP's cloud run would be the deployment solution. 
Cost savings is a big goal here which is why I didn't look into a full static deployment and load balancing. 
### Project Time
#### Goals
The project started with these goals
* Low Cost DR/Failover Solution for https://will.gleich.tech
    * Monitor based trigger to alert for downtime
    * Automatic deployment into the cloud
* Secondary Goal: Learning about google functions and google IAM
#### Architecture
<img src="images/blog/gleich-tech-switch1.png" height="150px" class="img-fluid">

#### Python Client
The work was cut out for me, it was time to start digging into coding and wiring up deployment of the newly minted
"gleich-tech-switch" lambda project. I wanted to get some exposure to GCP's APIs to get a firm footing, 
I was confident google had some sort of python integration with all of their offerings. This step took longer than I initially anticipated, 
I went into this thinking I'd be copying and pasting some code which was only partially true. After some trial and error 
I found a workable solution and gained experience with the `google-api-python-client` python package. This package builds an api around google's REST api menu offerings.
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
I was able to deploy a cloud run instance utilizing python. Now to wire up this code so the code can be called as a google function.

#### Serverless
I have read about and used serverless in the past. I immediately started jumping to deployments using the serverless node.JS based helper utility.
Getting the local deployments off the group were a breeze, `serverless create --template google-python --path gleich-tech-switch`
and I had a template. A few minor edits and I was already deploying with `serverless deploy` using the helloworld example.
Getting a hello world template'd and deployed was trivial, however things started to become more involved while trying to 
integrate the serverless with my drone.io build process. I needed to leverage the `serverless-python-requirements` plugin for handling python dependencies.
Serverless was clearly an AWS first tool after testing, and the integratation with GCP was frustrating. Runtimes and binary names were mismatched,
and dockerizePip would've required docker.sock or privileged access to my cluster.
Furthermore, I decided that I did not want to maintain my own serverless build docker image
and was surprised to not find a community maintained serverless docker image. After reading the google functions documentation
I immediately started testing `gcloud functions deploy --trigger-http` and it was so easy. It uses google cloud build in the background
and handled all of my requirements.txt. It turned something that was getting quite complex into something simple.

#### Cloudflare
There really isn't much to say here on an implementation front, cloudflare offers an amazing **free tier** service.
The web ui is easy to navigate, their python client was also easy. I was pushing and testing code quite quickly, whether it was
DNS record updating or page rule updating.
The documentation around all of this is great as well. Furthermore, accessing secrets (cloudflare apikey) from google
 cloud both on prem and utilizing cloud iam roles attached to my function were a breeze
The hardest part was ironing out the seams between google domain management and cloudflare.

#### Cloud Run Domain Mapping
Upon review of my architecture, it became clear that DNS propagation was going to be a really slow step. 
Initially I was thinking I would reroute DNS https://will.gleich.tech to point to whatever records cloud run requires.
Using the same python discovery api, I actually broke the google cloud run domain mapping web interface multiple times while sending malformed API requests.
Oddly enough it required the API to remediate as well. After getting the api calls worked out and the code sampled it was time to start demos.immediately
I was running the code locally and after a few test runs of using a vanity domain, it was decided to just keep a static failover domain dedicated to gcp cloud run.
https://will.iam.gleich.tech

#### HTTP Triggered
At this point I had my function on continuous deployment to gcp.
I had a manual image ready to go in the gcr for cloud run deployment. The cloud function has been tested with manual HTTP trigger.
All of the minimal viable product (MVP) functionality was there except the automatic trigger from google monitoring.
I thought that I would need to grant IAM access to the google monitoring gcloud service account to invoke my google function.
This interaction wasn't immediately obvious and upon further testing it looked like that google monitoring http webhooks
would only trigger utilizing basic authentication, an option on the webhook configuration modal. 
I did some initial tests granting function invoker access to allUsers and allAuthorizedUsers 
members of gcp - when I granted access to allUsers, google monitoring could obviously trigger. When I granted access to 
allAuthorizedUsers google monitoring wouldn't trigger. This led me to believe that http webhooks on google monitoring do 
not actually use a GCP IAM service account. That wasn't a implementation concern I was anticipating, however sometimes
you need to pivot.

#### Events
The next logical step for testing this functionality was to look at a queue based trigger. I wanted to integrate closely
with GCP patterns and PUB/SUB looked to be straightforward to implement. Redeploing the google function with `--trigger-topic=gleich-tech`
followed by some [boilerplate terraform](https://github.com/willgleich/gleich.tech/blob/master/tf/main.tf#L45-L62) was all that was required.
There was some other testing in this process with creating a manual subscriber, as well as a manually created iam policy in the console.
All of this was as straightforward as I would've expected. The good news is, I have a workflow ready for testing!

#### It Works!
With our new pubsub topic trigger, we are ready to test actual performance! Here is the following timeline of events on Oct 2nd:

* 17:08:09 - Triggered Failure: `k scale deploy -n resume resume --replicas=0` 
* 17:10:46 - Google Monitoring Alert and Published Message at
* Google Domain Mapping Status (note below is UTC vs MST):

    ```
       'status': {'conditions': [{'type': 'Ready',
          'status': 'True',
          'lastTransitionTime': '2020-10-02T23:12:33.820298Z'},
         {'type': 'CertificateProvisioned',
          'status': 'True',
          'lastTransitionTime': '2020-10-02T23:12:33.820298Z'},
         {'type': 'DomainRoutable',
          'status': 'True',
          'lastTransitionTime': '2020-10-02T23:11:04.849392Z'}],
    ```
* 17:24:35 Google Monitoring Alert Resolution

I also have a screen shot of the locust.io load testing I initiated before triggering the fail over:
<img src="images/blog/first_attempt_failover.png" class="img-fluid">

This puts failure right around 17:08:30 and resolution at 17:21:39, well things are a little off from the google monitoring timing,
but some error is to be expected in these tools. The good news is we did it,  with a simulated fail over google monitoring 
triggered our google function and deployed this website in the cloud and routed the cloudflare DNS using a page rule rewrite.
< sarcasm >It only took 13 minutes for fail over to take place!!! < /sarcasm > We will leave whatever happened between 
the Ready status of the domain routing 

#### We're done! We did it!
... If only things were that easy. While we have a working product, there are numerous improvements I stumbled upon that I decided to withhold. 
During the previous parts of this blog I intentionally was following the architecture design that I created initially, sometimes referred to as tunnel vision.
I tried to deviate as little as possible, both to create a targeted blog post, as well as emphasize the most important part of designing a new system: continuous improvement
When I created my initial architecture flow I had limited knowledge of how these integrations would work. I had an idea, but I didn't know exactly how the pieces fit together.
This is shown by the two changes I had made:
    * Scraping serverless in favor of google functions deploy
    * Scraping HTTP trigger in favor of PubSub Trigger
    * Utilizing a redirect instead of direct DNS update
Now that we have a MVP created, its time to dive in a few improvements identified. First and foremost, the 15 minute fail over time is **unacceptable.**

#### Unauthorized Cloud Run Requests
During my deployment testing I noticed that Cloud Run invocations require permissions in order to access it. In this case my website
will be openly available to the internet, allowing "allUsers" access to the invoke the cloud function. 

#### Improvements
* Revert option on the google function to change config back to on prem
    * enable/disable google monitoring
* Fine Grained, Terraform Managed RBAC on the following resources
    * Google Monitoring SA
    * Google Functions Secret Access
* Test Suite on GCP Function
  