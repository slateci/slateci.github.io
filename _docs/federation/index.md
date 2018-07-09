---
title: Federation
overview: 
index: true

order: 80

layout: docs
type: markdown
---
The concept of federated [SLATE Edge Clusters](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html) is a fundamental tenet that allows the rapid deployment of scientific software across the world with minimal or no interaction from remote site administrators.  With appropriate permissions, a [Virtual Organization](http://slateci.io/docs/concepts/organizational-roles/virtual-organization.html) [application developer](http://slateci.io/docs/concepts/individual-roles/application-developer.html) or [application administrator](http://slateci.io/docs/concepts/individual-roles/application-administrator.html) will be able to issue a set of commands to deploy one or more instances of an application across one or more sites within the context of a specific [Virtual
Organization](http://slateci.io/docs/concepts/organizational-roles/virtual-organization.html).

Federation is the mechanism that allows a set of [SLATE Edge Cluster](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html) to participate together to form a [SLATE Platform](http://slateci.io/docs/concepts/hardware-components/platform.html).  Each [SLATE Edge Cluster](http://slateci.io/docs/concepts/hardware-components/edge-cluster.html) operates as a distinct set of master node and worker nodes unique to a site.  Users will be able to deploy applications across a federated [SLATE Platform](http://slateci.io/docs/concepts/hardware-components/platform.html) with the [SLATE command line interface](http://slateci.io/docs/concepts/software-components/cli.html), the SLATE web interface or via the [SLATE REST API]().

A key SLATE Federation design principle is to allow discrete sites to join a local cluster to the SLATE Platform through a web portal.  Each cluster that joins must meet constraints imposed by software version requirements and hardware requirements.  Each site must also allow certain permissions in order for software to deploy seamlessly across all sites.  

SLATE Federation comprises a set of

{% include section-index.html %}

