---
title: "Faucet SDN with SLATE"
overview: Blog
published: false
permalink: blog/slate-faucet-nov-2019.html
attribution: The SLATE Team
layout: post
type: markdown
---

The [SLATE platform](http://www.slateci.io) is a multi-institution federated environment that supports a list of curated applications for different science disciplines. SLATE enables a federated “NoOPs” operations model for developers which allows the flexibility to innovate at scale and ease of deployment. This operations model allows the rapid reach of domain specific science gateways and multi-site research platforms. One of the curated applications that the [SLATE platform](http://www.slateci.io) supports is [Faucet](https://faucet.nz/), an [openflow controller](https://www.sdxcentral.com/networking/sdn/definitions/what-is-openflow/) which can quickly and easily set up, adjust, and control a [Software Defined Network](https://www.opennetworking.org/sdn-definition/) across multiple sites. Here we will explain the process of configuring, deploying, and connecting a [Faucet](https://faucet.nz/) controller through the SLATE platform. <!--end_excerpt-->
  

Faucet allows the user to define a set of rules that outline the structure and flow of a given network by giving [OpenFlow](https://www.opennetworking.org/wp-content/uploads/2014/10/openflow-switch-v1.5.1.pdf) commands to compatible switches and routers that control that network, as seen in Figure 1. Some of this functionality can control throughput for specific VLANS, isolate portions of and quickly add new segments to the network. These changes can be made largely on the fly to allow for an easily set up and adjustable networks. Faucet also uses the OpenFlow protocol, which allows for the use of virtual switches, a more cost effective and in some cases more powerful networking solution than their physical counterparts.![](https://lh6.googleusercontent.com/dvHcVJ7djN0ez9sM4KVcImgAumLmPtgEICa2oxDbt3BFk0nAcmr3eaxFQF3222rWDFYCo4CRq95sqPC89kaZG_w9n4KsckJvD-jLL4Ja8kRY63vcXWci8CljOsoAHIvAvBXBxkpo)

To accomplish all of this functionality, Faucet relies on a set of [.yaml](https://yaml.org/) files to define the network characteristics. The Faucet documentation includes [tutorials](https://docs.faucet.nz/en/latest/tutorials/index.html) that explain how to make these yaml files. If you were using Faucet without SLATE you would compose these .yaml files using a text editor, then feed them in as part of the installation. The process for deploying Faucet through SLATE is somewhat different.

To set a concrete example of how one might deploy and use Faucet through SLATE, I am going to walk through the process I went through to qualify that Faucet was actually functioning. I used a [GENI](https://www.geni.net) topology that hosted a simple network with 3 virtual machines (vm) connected by a single switch at the University of texas. The switch pointed to a Faucet instance running on a [MiniSlate](https://github.com/slateci/minislate) cluster on a seperate machine set up at the University of Michigan.

The first step was to set up a single vm on an InstaGeni resource at the University of Michigan which had 2 cores, 4 gigabytes of RAM, and 20 gigabytes of disk space. This vm gives you an environment where you can install Minislate, and run the Faucet application.

With this environment set up, I went into the slate shell using ./minslate shell slate and used the command “slate get-conf faucet > faucet.yaml” to pull down a basic structure of the config which slate needed to run faucet. I went in and edited this config to replace the default faucet yaml config information with the config I need for my specific network. With this conf written up I then deployed faucet onto my slate cluster using slate app install faucet --cluster=<cluster name> --group=<group name> --conf=faucet.yaml.

Next came building the actual network topology in GENI. To do this I fed the resource specification file ( [​https://raw.githubusercontent.com/GENI-NSF/geni-tutorials/master/OVSFloodLight/OVS_TPOLOGY_request_rspec.xml](https://raw.githubusercontent.com/GENI-NSF/geni-tutorials/master/OVSFloodLight/OVS_TPOLOGY_request_rspec.xml) ,which can be found at the [GENI Floodlight tutorial](https://groups.geni.net/geni/wiki/GENIExperimenter/Tutorials/OpenFlowOVS-Floodlight), into the [GENI Web Portal](https://portal.geni.net), Picked University of Texas as the site, and built the network depicted below.

  
  
![](https://lh5.googleusercontent.com/LkK4K2Svyrvp5Ifk1MpZvh84NU7UrclnMpGXEpP0j3ReZkvnbqdeBDi43V-V_vCe06Qf-t37OLOpVJ8KoV_K4xpYpG7OypFHJfCzsEGQD-wJSIuvQhSy1iRmvvxMcKq0y8rzAYc8)  
  

With this Network built, I sshed into the vm named switch and installed open virtual switch using “apt install” I used the ovs commands to set up a bridge, shut down the interfaces that when to the host machines, and put interfaces onto the virtual bridge to run those connections. The details of this are all outlined in the [GENI Floodlight tutorial](https://groups.geni.net/geni/wiki/GENIExperimenter/Tutorials/OpenFlowOVS-Floodlight) .

To complete the final step, I first needed to get some information out of the Faucet instance running in slate. I accomplished this task by running ```slate instance list```, pulling the instance ID for my faucet instance and running ```slate instance info <Instance ID>```. This command output a bunch of information about the instance, including the text of the config I had fed in earlier. At the very top was a block of text that read like this.

Name Cluster IP External IP Ports

faucet-global 10.106.167.17 <none> 6653:31612/TCP

This gave me the IP of the cluster, 10.106.167.17, and the outward facing port on which Faucet was broadcasting: 31612. With these two pieces of information combined, I could run the commands ```ovs-vsctl set-controller <bridge name> tcp:10.106.167.17:31612``` and ```ovs-vsctl set-fail-mode <bridge name> secure```. These commands tell the virtual switch where to go to get OpenFlow instructions on its Control plane. These commands also tell the switch to not try to forward packets on its data plane without checking in with its controller. These two facts are important for validating Faucet’s functionality.

In order to validate Faucet’s control of the switch,I used ssh to connect to host-2 and initiated a ping to host-3. [NOTE: GENI added a slight extra layer of complexity because we have to specify the interface that connects to the switch. All GENI resources at a site also have an internal connection to each other. When we ping across the switch, Open Virtual Switch makes a request of the Faucet instance running on SLATE for instructions on how to handle the packets of that ping. If Faucet has the correct configuration and is running properly, it will send the switch instructions on how to handle those packets, the ping will go through, and you will see successful output. If the ping fails, then we have to troubleshoot if Faucet has the correct configuration and if Faucet is able to talk on the control plane to the switch correctly.
