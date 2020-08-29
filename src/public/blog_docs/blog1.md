# Homelab Antics Part 1

The year was 2016 and it all started with a dream. The dream was understanding computing in an advanced way.
Living at my parents house as a recent Help Desk hire, so many of my problems revolved around 
Active Directory (AD). AD was something fully abstracted away in my Help Desk role, but I  wanted to understand why
`gpudate /force` would resolve so many configurations. How could I test Active Directory in a total test environment?

I'll install AD at home! I started my journey watching [this awesome introductory video by Eli the Computer Guy.](https://www.youtube.com/watch?v=hxgz7MR7MGQ)
Following more research I had a plan in place: I wanted a Domain Controller at home that ran AD, DNS, and DHCP. 
I went to the drawing board and first started looking at the family's router for configuration. 

The first problem has already arisen. How can I make these infrastructure changes while keeping 
