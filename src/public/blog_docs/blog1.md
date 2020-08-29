#### Active Directory Dreams
The year was 2016 and it all started with a dream. The dream was understanding computing in an advanced way.
Living at my parents house as a recent Help Desk hire, so many of my problems revolved around 
Active Directory (AD). AD was something fully abstracted away in my Help Desk role, but I  wanted to understand why
`gpudate /force` would resolve so many configurations. How could I test Active Directory in a total test environment?
I already had a gaming PC with VirtualBox and ample ram (32 GiB) for testing.

I'll install AD at home! I started my journey watching [this awesome introductory video by Eli the Computer Guy.](https://www.youtube.com/watch?v=hxgz7MR7MGQ)
Following more research I had a plan in place: I wanted a Domain Controller at home that ran AD, DNS, and DHCP. 
I went to the drawing board and first started looking at the family's router for configuration. 

The first problem has already arisen. How can I make these infrastructure changes without any impact to the current network?
DHCP and DNS services are all controlled by the simple mesh gateway. Even if I got all these services running on my desktop PC, the uptime of 
my gaming PC is not enough to prevent service impacts, especially regarding DHCP. This would not meet Family Acceptance Factor (FAF) requirements.

#### The Gateway to Wonderland
After talking through my homelab desires with one of [my colleagues at the time](https://github.com/backcountryinfosec) he recommended pfSense - the solution was identified!

![image info](pfsense.jpg)

The plan was in place - down the rabbit hole we go:
* Virtualize a pfSense gateway bridging my gaming desktop NIC as a psuedo-WAN interface for the pfSense VM
* Utilize virtual NIC #2 as the LAN interface as an customized internal VirtualBox network
