#### 55 Hours of No Power
While deploying [this website](https://github.com/willgleich/gleich.tech) I figured since I already have a kubernetes
environment at home, I'd just plan to deploy to my homelab cluster. My power and internet have been stable enough in the past
few years, and the price of the home deployment is cheap. I figure I can take a smaller outage occasionally. Well.. development on this website has increased lately,
and [Salt Lake City recently had a historic windstorm](https://www.ksl.com/article/50015604/utah-windstorm-how-it-happened-and-how-it-fits-in-with-other-extreme-weather-events-in-state-history) 
that resulted in my property losing power for 55 hours! There were other properties
in SLC that had lost power for 5+ days! Needless to say will.gleich.tech was down for those 55 hours, and that was unacceptable. 
I wanted to find an inexpensive solution to allow for fail over to the cloud.
I had been looking at exploring lambdas and thought this would be perfect.
If I can configure a cloud monitor in GCP, and if that monitor triggers a lambda, I could utilize that cloud monitor to 
deploy a new replica of my web server in the cloud. After a manual mock-up it looked like GCP's cloud run would be the deployment solution. 
Cost savings is a big goal here which is why I didn't look into a full static deployment and load balancing. 

### Project Time
#### Goals
The project started with these goals:
* Low Cost DR/Failover Solution for https://will.gleich.tech
    * Monitor based trigger to alert for downtime
    * Automatic deployment into the cloud
* Secondary Goal: Learning about google functions, iam and api
#### Architecture
<img src="/images/blog/gleich-tech-switch_1.png" height="150px" class="img-fluid">

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
Getting a helloworld template'd and deployed was trivial, however things started to become more involved while trying to 
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
 cloud both on prem and utilizing cloud iam roles attached to my function were a breeze.
The hardest part was ironing out the seams between google domain management and cloudflare.

#### Cloud Run Domain Mapping
Upon review of my architecture, it became clear that DNS propagation was going to be a really slow step. 
Initially I was thinking I would reroute DNS, https://will.gleich.tech, to point to whatever records cloud run requires.
Using the same python discovery api, I actually broke the google cloud run domain mapping web interface multiple times while sending malformed API requests.
Oddly enough it required the API to remediate as well. After getting the api calls worked out and the code sampled it was time to start demos.immediately
I was running the code locally and after a few test runs of using a vanity domain, it was decided to just keep a static failover domain dedicated to gcp cloud run.
https://will.iam.gleich.tech

#### HTTP Triggered
At this point I had my function on continuous deployment to gcp.
I had a manual image ready to go in the gcr for cloud run deployment. The cloud function has been tested with manual HTTP trigger.
All of the minimal viable product (MVP) functionality was there except the automatic trigger from google monitoring.
I thought that I would need to grant IAM access to the google monitoring gcloud service account to invoke my google function.
This interaction wasn't immediately obvious and upon further testing it looked like google monitoring http webhooks
would only trigger utilizing basic authentication, an option on the webhook configuration modal. 
I did some initial tests by granting function invoker access to allUsers and allAuthorizedUsers 
members of gcp - when I granted access to allUsers, google monitoring HTTP could obviously trigger. When I granted access to 
allAuthorizedUsers google monitoring wouldn't trigger. This led me to believe that http webhooks on google monitoring do 
not actually use a GCP IAM service account. That wasn't an implementation concern I was anticipating, however sometimes
you need to pivot. Opening up my google function to the world and handling basic authentication on the function level seemed like the wrong solution.

#### Events
The next logical step for testing this functionality was to look at a queue based trigger. I wanted to integrate closely
with GCP patterns and PUB/SUB looked to be straightforward to implement. Redeploing the google function with `--trigger-topic=gleich-tech`
followed by some [boilerplate terraform](https://github.com/willgleich/gleich.tech/blob/master/tf/main.tf#L66-L83) was all that was required.
There was some other testing in this process with creating a manual subscriber, as well as a manually created iam policy in the console.
All of this was as straightforward as I would've expected. The good news is, I have a workflow ready for testing!

#### It Works!
With our new pubsub topic trigger, we are ready to test actual performance! Here is the following timeline of events on Oct 2nd:

* 17:08:09 - Triggered Failure: `k scale deploy -n resume resume --replicas=0` 
* 17:10:46 - Google Monitoring Alert and Published Message
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
<img src="/images/blog/first_attempt_failover.png" class="img-fluid">

This puts failure right around 17:08:30 and resolution at 17:21:39, well things are a little off from the google monitoring timing,
but some error is to be expected in these tools. The good news is we did it,  with a simulated fail over google monitoring 
triggered our google function and deployed this website in the cloud and routed the cloudflare DNS using a page rule rewrite.
< sarcasm >It only took 13 minutes for fail over to take place!!! < /sarcasm > We will leave whatever happened between 
the Ready status of the domain routing and the service actually coming up described as one of the great mysteries of the world. 

#### We're done! We did it!
... If only things were that easy. While we have a working product, there are numerous improvements I stumbled upon that I decided to withhold. 
During the previous parts of this blog I intentionally was following the architecture design that I created initially, sometimes referred to as tunnel vision.
I tried to deviate as little as possible, both to create a targeted blog post, as well as emphasize the most important part of designing a new system: continuous improvement.
When I created my initial architecture flow I had limited knowledge of how these integrations would work. I had an idea, but I didn't know exactly how the pieces fit together.
This is shown by the changes I had made:

* Scrapping serverless in favor of google functions deploy
* Scrapping HTTP trigger in favor of PubSub Trigger
* Utilizing a redirect instead of direct DNS update

Now that we have a MVP created, its time to dive in a few improvements identified. First and foremost, the 15 minute fail over time is **unacceptable.**


Here is the current status of the architecture:
<img src="/images/blog/gleich-tech-switch_2.png" class="img-fluid">



#### Unauthorized Cloud Run Requests
During my deployment testing I noticed that Cloud Run invocations require permissions in order to access it. In this case my website
will be openly available to the internet, allowing "allUsers" access to the invoke the cloud function. This would allow me to
keep my cloud run deployed permanently with no way to access it. I do not get billed for 401 requests so that be can my "off" state with the service ready to allow for "allUsers" access. My lambda trigger could then focus on the two enabling operations:

* Enable allUser to the cloud run invoker
* Enable the Cloudflare Page Rule redirect to the standby domain

This architectural shift would require that production CI/CD deployments also push images to both gcr.io and refresh
the cloud run service with the new image. This is quite straightforward inmost ci/cd platforms and was easy to implement with drone.io.
Yet another architecture diagram: 
<img src="/images/blog/gleich-tech-switch_3.png" class="img-fluid">

##### Google Monitoring Toggle

I also noticed another optimization that is required: google monitoring shouldn't monitor the cloud run service after we failover. These excess requests to the cloud run "serverless" service will end up being costly, with no real benefit. If both my local house goes down as well as us-central-1, perhaps this is an outage I can afford given our low cost tolerance. This is another implementaiton with `google-api-python-client`, and I will leave it to you 
if you want to see the code:

* [will.gleich.tech](https://github.com/willgleich/gleich.tech)
* [gleich-tech-switch](https://github.com/willgleich/gleich-tech-switch)

A quick note here: While this solution makes for a great, cheap homelab solution, 3 minutes of downtime for an enterprise service is often unacceptable. Looking further into this on a enterprise level a load balancing solution would be required.  

#### Testing time

It is time to test the new layout. After another simulated failover:
<img src="/images/blog/second_attempt_failover.jpeg" class="img-fluid">
Now this is looking better, we brought our previous 13 minute failover down to about 3 minutes. For a cost sensitive homelab project,
this is where we say "good enough." This optimized solution for a personal resume website allows for eloquent hands-off failover into the cloud in about 3 minutes. 

#### Conclusion
This exercise highlights many important aspects of designing a new system. Manual prototyping is an amazing task that could've sped up this implementation. I hope my "tunnel-vision" example of sticking to my original design shined light on how that can be a costly endeavor. Foregoing optimizations that strike you while you are in the weeds with a new system is an exercise in futility, although one must be careful to balance time and optimization especially in the early stages of a project/product. I leave you all with an excerpt from *The Pragmatic Programmer* by Andrew Hunt and David Thomas, which highlights why modeling an unknown system isn't necessarily the best way to approach design.

<div class="card my-4">
<div class="card-body">
<blockquote>
  <p>10. Tracer Bullets</p>
  <p>Ready, fire, aim…</p>
  <p>There are two ways to fire a machine gun in the dark. You can find out exactly where your target is (range, elevation, and azimuth). You can determine the environmental conditions (temperature, humidity, air pressure, wind, and so on). You can determine the precise specifications of the cartridges and bullets you are using, and their interactions with the actual gun you are firing. You can then use tables or a firing computer to calculate the exact bearing and elevation of the barrel. If everything works exactly as specified, your tables are correct, and the environment doesn't change, your bullets should land close to their target.</p>
  <p>To be pedantic, there are many ways of firing a machine gun in the dark, including closing your eyes and spraying out bullets. But this is an analogy, and we're allowed to take liberties.</p>
  <p>Or you could use tracer bullets.</p>
  <p>Tracer bullets are loaded at intervals on the ammo belt alongside regular ammunition. When they're fired, their phosphorus ignites and leaves a pyrotechnic trail from the gun to whatever they hit. If the tracers are hitting the target, then so are the regular bullets.</p>
  <p>Not surprisingly, tracer bullets are preferred to the labor of calculation. The feedback is immediate, and because they operate in the same environment as the real ammunition, external effects are minimized.</p>
  <p>The analogy might be violent, but it applies to new projects, particularly when you're building something that hasn't been built before. Like the gunners, you're trying to hit a target in the dark. Because your users have never seen a system like this before, their requirements may be vague. </p>
  <p>Because you may be using algorithms, techniques, languages, or libraries you aren't familiar with, you face a large number of unknowns. And because projects take time to complete, you can pretty much guarantee the environment you're working in will change before you're done.</p>
  <p>The classic response is to specify the system to death. Produce reams of paper itemizing every requirement, tying down every unknown, and constraining the environment. Fire the gun using dead reckoning. One big calculation up front, then shoot and hope.</p>
  <p>Pragmatic Programmers, however, tend to prefer using tracer bullets.</p>
  <p>Code That Glows in the Dark</p>
  <p>Tracer bullets work because they operate in the same environment and under the same constraints as the real bullets. They get to the target fast, so the gunner gets immediate feedback. And from a practical standpoint they're a relatively cheap solution.</p>
  <p>To get the same effect in code, we're looking for something that gets us from a requirement to some aspect of the final system quickly, visibly, and repeatably.</p>
  <footer class="blockquote-footer">Excerpt From: Hunt, Andrew;Thomas, David <cite title="Source Title">“The Pragmatic Programmer: From Journeyman to Master.”</cite></footer>
</blockquote>
</div>
</div>