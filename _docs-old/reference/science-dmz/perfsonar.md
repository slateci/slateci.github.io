---
title: perfSONAR
overview: 

order: 40

layout: docs
type: markdown
---
{% include home.html %}
[Active performance monitoring](http://fasterdata.es.net/science-dmz/science-dmz-performance-monitoring/) is a key tenet of the [Science DMZ design pattern](http://fasterdata.es.net/science-dmz/).  In order to maintain the integrity of the network paths between Science DMZ environments at distinct institutions, active monitoring must continually observe the network for dropped packets, data loss, jitter, and other impediments to optimized data transfers.  The Science DMZ design pattern specifically uses test and measurement hosts based on the [perfSONAR](https://www.perfsonar.net/) for active monitoring.  

Active measurement is also also a key component of the SLATE infrastructure.  SLATE uses [perfSONAR](https://www.perfsonar.net/) as one of its key components for measuring data paths between [SLATE Edge Clusters](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html).  A [SLATE Platform](http://slateci.io/docs/concepts/hardware-components/platform.html) maintains a central repository and visualization of the data path connectivity between clusters.  Each [SLATE Edge Cluster](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html) has a dedicated perfSONAR host perforning active tests between all SLATE Edge Clusters at all sites comprising a [Virtual Organziation](http://slateci.io/docs/concepts/organizational-roles/virtual-organization.html).  The dedicated [perfSONAR](https://www.perfsonar.net/) node represents a SLATE Core Service to ensure optimized paths between clusters and to remote destinations and collaboration sites.  For [Virtual Organizations](http://slateci.io/docs/concepts/organizational-roles/virtual-organization.html) that require ongoing scheduled tests, the SLATE perfSONAR Configuration agent interface will allow authorized entities to enter tests and publish their own dashboards.

In addition to the dedicated nodes, the SLATE perfSONAR implementation supports the ability to bring up ephemeral [perfSONAR testpoint](http://docs.perfsonar.net/install_options.html) containers.  These ephemeral test points allow developers to bring up short term test environments specific to the Virtual 
