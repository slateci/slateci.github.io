---
title: "Orchestrating Networks with Faucet and SLATE"
overview: Blog
published: true
permalink: blog/slate-faucet-nov-2019.html
attribution: The SLATE Team
layout: post
type: markdown
---

Software Defined Networking (SDN) is an emerging technology that allows network
administrators to programmatically manage network devices in a dynamic and
cloud-like manner. [Faucet](https://faucet.nz/) is an SDN controller that
utilizes the [OpenFlow](https://en.wikipedia.org/wiki/OpenFlow)
protocol to enable managing devices in such a way. We have been working on
packaging Faucet as a SLATE application to empower sites to experiment with
this exciting new technology. In this post, we'll explain the process of
configuring, deploying and connecting a Faucet controller through the SLATE
platform.
<!--end_excerpt-->

Faucet allows the user to define a set of rules that outline the structure and
flow of a given network by giving
[OpenFlow commands](https://www.opennetworking.org/wp-content/uploads/2014/10/openflow-switch-v1.5.1.pdf)
to compatible switches and routers that control that network, as seen
in the figure below. Some of this functionality can control throughput for specific
VLANS, isolate portions of, and quickly add new segments to, the network. These
changes can be made largely on the fly to allow for an easily set up and
adjustable networks. Faucet also uses the OpenFlow protocol, which allows for
the use of virtual switches, a more cost effective and in some cases more
powerful networking solution than their physical
counterparts.![](https://lh6.googleusercontent.com/dvHcVJ7djN0ez9sM4KVcImgAumLmPtgEICa2oxDbt3BFk0nAcmr3eaxFQF3222rWDFYCo4CRq95sqPC89kaZG_w9n4KsckJvD-jLL4Ja8kRY63vcXWci8CljOsoAHIvAvBXBxkpo)

To accomplish all of this functionality, Faucet relies on a set of
YAML files to define the network characteristics. The
Faucet documentation includes
[tutorials](https://docs.faucet.nz/en/latest/tutorials/index.html) that explain
how to make these yaml files. If you were using Faucet without SLATE you would
compose these .yaml files using a text editor, then feed them in as part of the
installation. The process for deploying Faucet through SLATE is somewhat
different.

To set a concrete example of how one might deploy and use Faucet through SLATE,
we are going to walk through the process to qualify that Faucet
was actually functioning. We used a [GENI](https://www.geni.net) topology that
hosted a simple network with three virtual machines connected by a single
switch at the University of Texas. The switch pointed to a Faucet instance
running on a [MiniSLATE](https://github.com/slateci/minislate) cluster on a
seperate machine set up at the University of Michigan.

First, we set up a single VM on an InstaGeni resource at the University of
Michigan which had 2 cores, 4 gigabytes of RAM, and 20 gigabytes of disk space.
On the VM, we installed MiniSLATE [in the usual
way](https://github.com/slateci/minislate#getting-started). 

With this environment set up, we access the SLATE shell:

	./minslate shell slate

We can issue the usual SLATE command for fetching the Faucet configuration:

	slate app get-conf faucet > faucet.yaml

Once the configuration is in hand, we can go in and
edit this file to replace the default Faucet YAML configuration
with the configuration needed for our specific network. After the approprate modifications were made, 
we then deployed Faucet using the following command:

	slate app install faucet --cluster=<cluster name> --group=<group name> --conf=faucet.yaml

After deploying the SLATE Faucet application, we needed to build the actual
network topology in GENI. To do this we fed the GENI resource specification
file
([​https://raw.githubusercontent.com/GENI-NSF/geni-tutorials/master/OVSFloodLight/OVS_TPOLOGY_request_rspec.xml](https://raw.githubusercontent.com/GENI-NSF/geni-tutorials/master/OVSFloodLight/OVS_TPOLOGY_request_rspec.xml)
,which can be found at the [GENI Floodlight tutorial](https://groups.geni.net/geni/wiki/GENIExperimenter/Tutorials/OpenFlowOVS-Floodlight),
into the [GENI Web Portal](https://portal.geni.net), picked University of Texas
as the site, and built the network depicted below.
  
![](https://lh5.googleusercontent.com/LkK4K2Svyrvp5Ifk1MpZvh84NU7UrclnMpGXEpP0j3ReZkvnbqdeBDi43V-V_vCe06Qf-t37OLOpVJ8KoV_K4xpYpG7OypFHJfCzsEGQD-wJSIuvQhSy1iRmvvxMcKq0y8rzAYc8)  
  
With this network built, we were then able to SSH into the VM named `switch`
and install the virtual switch:

	apt install openvswitch-switch

We use the `ovs` commands to set up a bridge, shut down the interfaces that
when to the host machines, and put interfaces onto the virtual bridge to run
those connections. The details of this are all outlined in the [GENI Floodlight
tutorial](https://groups.geni.net/geni/wiki/GENIExperimenter/Tutorials/OpenFlowOVS-Floodlight).

To connect Faucet with our OVS switch at the University of Texas, we needed to
retrieve the IP address and port of our Faucet instance running in SLATE.
First, we needed to pull the instance ID from our Faucet application using:

	slate instance list 

And used the instance ID to retrieve detailed information about our SLATE instance using 
	slate instance info <Instance ID>

This command outputs a detailed description our running Faucet application on
SLATE, including the configuration information. The information we needed was
present at the top of the output:

```
Name Cluster IP External IP Ports

faucet-global 10.106.167.17 <none> 6653:31612/TCP
```

From this output, we could retrieve the IP of the application, `10.106.167.17`, and
the outward facing port on which Faucet was broadcasting: `31612`. With these
two pieces of information, we ran the following command on OVS swtich:

	ovs-vsctl set-controller <bridge name> tcp:10.106.167.17:31612

and 

	ovs-vsctl set-fail-mode <bridge name> secure

These commands tell the virtual switch where to go to get OpenFlow instructions
on its Control Plane. These commands also tell the switch to not try to forward
packets on its data plane without checking in with its controller. These two
facts are important for validating Faucet’s functionality.

In order to validate Faucet's control of the switch, we SSH to `host-2` and try to ping `host-3`. 

[NOTE: GENI added a slight extra layer
of complexity because we have to specify the interface that connects to the
switch. All GENI resources at a site also have an internal connection to each
other. When we ping across the switch, Open Virtual Switch makes a request of
the Faucet instance running on SLATE for instructions on how to handle the
packets of that ping.] 

If Faucet has the correct configuration and is running
properly, it will send the switch instructions on how to handle those packets,
the ping will go through, and you will see successful output. If the ping
fails, then we have to troubleshoot if Faucet has the correct configuration and
if Faucet is able to talk on the control plane to the switch correctly.

In summary, we were able to succesfully configure and control switches at the
University of Texas via GENI through a SLATE instance running at the University
of Michigan. The use of SLATE made the configuration and installation of the
Faucet controller straightforward and simple.
