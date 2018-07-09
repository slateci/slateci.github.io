---
title: General Concepts
overview: 

order: 20

layout: docs
type: markdown
---
{% include home.html %}

The [Science DMZ design pattern](http://fasterdata.es.net/science-dmz/) comprises an architecture and security zone
that allows big science to happen in an optimized fashion.  The SLATE design pattern fits within the
[Science DMZ](http://fasterdata.es.net/science-dmz/) and allows for the seamless deployment of applications,
distributed storage, and other services to each remote site.  For very small
sites with appropriate segmentation and security, the [SLATE Edge Cluster](http://slateci.io/docs/concepts/hardware-components/edge-cluster.htm) might represent the bulk of a Science DMZ environment.

In a distributed [Virtual Organization](http://slateci.io/docs/concepts/organizational-roles/virtual-organization.html) (VO) environment, services and applications exist where ever a
remote site exists.  Most of these services, i.e. distributed storage, data
transfer, require unfettered access between sites that comprise a VO.  


A [SLATE Edge Cluster](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html) exists within a Science DMZ and provides the
applications and active measurements defined by the Science DMZ architecture.
Implementations such as a [Data Transfer Node]() exist on a SLATE node in
a container leveraging local storage or attached storage similar to a normal
DTN.  

A [SLATE Edge Cluster](http://fasterdata.es.net/science-dmz/DTN/) also provides the basic active measurement defined in
the Science DMZ design pattern by providing one or more [perfSONAR
testpoints](http://docs.perfsonar.net/install_options.html).  The SLATE [perfSONAR](https://www.perfsonar.net/) implementation
allows the use of the dedicated [perfSONAR](https://www.perfsonar.net/) environment or the ability to bring
up ephemeral SLATE testpoints.
