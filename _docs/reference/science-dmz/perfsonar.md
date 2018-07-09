---
title: perfSONAR
overview: 

order: 40

layout: docs
type: markdown
---
{% include home.html %}

Active measurement is a key component of the SLATE infrastructure.  SLATE uses [perfSONAR](https://www.perfsonar.net/) as one of its key components for measuring data paths between [SLATE Edge Clusters](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html).  A [SLATE Platform](http://slateci.io/docs/concepts/hardware-components/platform.html) maintains a central repository and visualization of the data path connectivity between clusters.  Each [SLATE Edge Cluster](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html) has a dedicated perfSONAR host perforning active tests between all SLATE Edge Clusters at all sites comprising a [Virtual Organziation](http://slateci.io/docs/concepts/organizational-roles/virtual-organization.html).  The dedicated [perfSONAR](https://www.perfsonar.net/) node represents a SLATE Core Service to ensure optimized paths between clusters and to remote destinations and collaboration sites.
