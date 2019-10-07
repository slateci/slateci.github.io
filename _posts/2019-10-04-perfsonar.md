---
title: "Easy Network Diagnostics with SLATE"
overview: Blog
published: true
permalink: blog/slate-perfsonar.html
attribution: The SLATE Team
layout: post
type: markdown
---

Network testing is hugely important to diagnose problems within and between
sites. We're trying to make network diagnostics dead simple with SLATE, and to
do that we've SLATE-ified pieces of the excellent perfSONAR software stack
(https://www.perfsonar.net). This application has recently landed into the
SLATE stable catalog, and so we thought we would give you a little tour of this
handy tool!

<!--end_excerpt-->

Let's dive right in - here's what the configuration looks like:

	[09:31]:~ $ slate app get-conf perfsonar-testpoint
	# Default values for perfsonar-testpoint.
	# This is a YAML-formatted file.
	# Declare variables to be passed into your templates.

	Instance: ''

	# Whether to run only on specially marked nodes. 
	# If nodeSelection is true, this service will only run on a node
	# which has the `perfsonar: enabled` label applied to it. 
	# Otherwise, it will allow itself to be scheduled on any node. 
	nodeSelection: false

So in this particular app, there's not much configuration. Note that this is
only the perfSONAR testpoint, so it only contains the pieces needed to launch
tests, rather than the entire perfSONAR suite.

The one configuration parameter we do have is `nodeSelection`, what's this for?
From the in-line comments, we see that perfSonar be configured to run on a
dedicated node, provided that the node has a label `perfsonar: enabled`. You
might want to do this for long-lived network measurement endpoints that will
see some heavy-duty testing, where the network interface won't be shared with
other applications.

Installing it on an endpoint is simple. Let's say we want to do a measurement
between the University of Chicago and the University of Michigan. You can find
the endpoints with `slate cluster list` and a little grep action:

	[09:43]:~ $ slate cluster list | grep -E uchicago\|umich
	umich-prod           slate-dev             cluster_WRb0f8mH9ak
	uchicago-its-fiona01 slate-dev             cluster_gWCytq-5yaU
	uchicago-prod        slate-dev             cluster_yZroQR5mfBk
	uchicago-river-v2    ssl                   cluster_iL8D7abxCM8

So for this particular example we'll use `umich-prod` and `uchicago-prod`. To
stand up the endpoints, first we'll do UMich:

	[09:46]:~ $ slate app install perfsonar-testpoint --cluster umich-prod --group slate-dev
	Installing application...
	Successfully installed application perfsonar-testpoint as instance slate-dev-perfsonar-testpoint with ID instance_LAgguQo0KVY

We'll also want to get its instance info, to see where it's running:

	[09:47]:~  $ slate instance info instance_LAgguQo0KVY
	Name                Started                         Group     Cluster    ID                  
	perfsonar-testpoint 2019-Oct-04 15:17:23.774216 UTC slate-dev umich-prod instance_LAgguQo0KVY

	Services: (none)

	Pods:
	  slate-dev-perfsonar-testpoint-69cbd6f995-s5kpz
	    Status: Running
	    Created: 2019-10-04T15:17:24Z
	    Host: sl-um-es3.slateci.io
	    Host IP: 192.41.231.237


Likewise for UChicago:

	[09:48]:~ $ slate app install perfsonar-testpoint --cluster uchicago-prod --group slate-dev
	Installing application...
	Successfully installed application perfsonar-testpoint as instance slate-dev-perfsonar-testpoint with ID instance_Wy1saT5eVmM

	[09:50]:~ $ slate instance info instance_Wy1saT5eVmM
	Name                Started                         Group     Cluster       ID                  
	perfsonar-testpoint 2019-Oct-04 14:47:55.102212 UTC slate-dev uchicago-prod instance_Wy1saT5eVmM

	Services: (none)

	Pods:
	  slate-dev-perfsonar-testpoint-844cb7c48b-xwnmf
	    Status: Running
	    Created: 2019-10-04T14:47:55Z
	    Host: sl-uc-es1.slateci.io
	    Host IP: 192.170.227.156

So now we know both IP addresses, and we ostensibly have perfSONAR running both
places. As far as SLATE goes, that's all you need to do to get testpoints
running at two sites. 

In order to see that things are actually running, we'll need to have a copy of
the `pScheduler` software to ask both endpoints to execute a test. I don't have
these tools on my laptop, but perfSONAR does provide a docker container that
does. You'll want to launch a version with the pscheduler daemon, and then exec
into it:

	[10:22]:~ $ docker run -d perfsonar/testpoint
	ce0b0926b2ffdf523300528311d0742bc5edf53b968e1d47f9aa11b3eaa25f6e
	[10:22]:~ $ docker ps
	CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                                                                                     NAMES
	ce0b0926b2ff        perfsonar/testpoint   "/bin/sh -c '/usr/..."   4 seconds ago       Up 2 seconds        443/tcp, 861-862/tcp, 5000-5001/tcp, 5101/tcp, 5201/tcp, 8760-9960/tcp, 18760-19960/tcp   festive_wright
	[10:22]:~/blog $ sudo docker exec -ti ce0b0926b2ff /bin/sh
	sh-4.2# 

Once you have a shell, you can ask pscheduler to start a test between the endpoints:

	sh-4.2# pscheduler task trace --source-node 192.41.231.237 --dest 192.170.227.156
	Submitting task...
	Task URL:
	https://192.41.231.237/pscheduler/tasks/7b06b5b3-d13f-431a-b49b-83a27ade787c
	Running with tool 'traceroute'
	Fetching first run...

	Next scheduled run:
	https://192.41.231.237/pscheduler/tasks/7b06b5b3-d13f-431a-b49b-83a27ade787c/runs/2575cdf5-afbe-4c73-a961-326373b7146a
	Starts 2019-10-04T12:09:14-04 (~2 seconds)
	Ends   2019-10-04T12:09:22-04 (~7 seconds)
	Waiting for result...

	1	gw-shinano.aglt2.org (192.41.230.1) AS229 0.2 ms
		  MERIT-AS-6 - Merit Network Inc., US
	2	esnet-lhc1-a-aglt2.es.net (198.124.80.53) AS291 6.1 ms
		  ESNET-EAST - ESnet, US
	3	uchicago-lhc1-esnet.es.net (198.124.80.78) AS291 6.4 ms
		  ESNET-EAST - ESnet, US
	4	192.170.224.121 AS160 6.6 ms
		  U-CHICAGO-AS - University of Chicago, US
	5	sl-uc-es1.slateci.io (192.170.227.156) AS160 6.6 ms
		  U-CHICAGO-AS - University of Chicago, US

	No further runs scheduled.

Likewise, you can look at the throughput between the sites:

	sh-4.2# pscheduler task throughput --source-node 192.41.231.237 --dest 192.170.227.156
	Submitting task...
	Task URL:
	https://192.41.231.237/pscheduler/tasks/9f564115-e4dd-4ec8-81f5-78ec7613b375
	Running with tool 'iperf3'
	Fetching first run...

	Next scheduled run:
	https://192.41.231.237/pscheduler/tasks/9f564115-e4dd-4ec8-81f5-78ec7613b375/runs/49d6bc62-4def-4037-94f2-e430f56dac36
	Starts 2019-10-04T11:48:55-04 (~7 seconds)
	Ends   2019-10-04T11:49:14-04 (~18 seconds)
	Waiting for result...

	* Stream ID 5
	Interval       Throughput     Retransmits    Current Window 
	0.0 - 1.0      524.95 Mbps    49             393.71 KBytes  
	1.0 - 2.0      524.57 Mbps    14             348.97 KBytes  
	2.0 - 3.0      526.64 Mbps    24             492.14 KBytes  
	3.0 - 4.0      886.30 Mbps    13             671.10 KBytes  
	4.0 - 5.0      870.31 Mbps    35             232.65 KBytes  
	5.0 - 6.0      482.35 Mbps    2              760.58 KBytes  
	6.0 - 7.0      1.09 Gbps      19             411.61 KBytes  
	7.0 - 8.0      639.64 Mbps    22             885.85 KBytes  
	8.0 - 9.0      901.76 Mbps    21             590.57 KBytes  
	9.0 - 10.0     849.28 Mbps    19             796.37 KBytes  

	Summary
	Interval       Throughput     Retransmits    
	0.0 - 10.0     729.63 Mbps    218

	No further runs scheduled.

Pretty cool. We didn't have to ask admins at either site to install perfSonar
infrastructure, but we were able to schedule and run tests between both sites
and learn something about the connectivity between them. 

If you want to try this out for yourself, you can find the perfSONAR testpoint
application here: https://portal.slateci.io/applications/perfsonar-testpoint
There are many other tests you might want to run against sites, such as `rtt`,
`latency`, `dns` and so on. You can find out more about pScheduler here:
https://docs.perfsonar.net/pscheduler_intro.html
