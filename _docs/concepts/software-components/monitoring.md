---
title: 
overview: Cluster metrics and application logs forwarding to a central SLATE database with visualization consumable by end users and cluster administrators.
              
order: 40

layout: docs
type: markdown
---

SLATE sites: On first build of SLATE sites the metrics shipper will be deployed by a SLATE admin to automatically forward metrics to central database.

SLATE Catalog App: SLATE catalog app will have flag to enable application logs forwarding to central SLATE database.

Application Development: A flag for a side car container(s) reading and shipping logs to central database will need to be implemented for every application wanting to become part of the SLATE catalog.

Central Database Address: The address for the central database will need to be provided by a SLATE administrator. 

Examples:
* Metricbeats Daemonset running across a SLATE site forwarding to the central SLATE Elasticsearch cluster.
* Fluentbit sidecar container reading off of a shared volume in a kubernetes pod and forwarding to the central SLATE Elasticsearch cluster.
* Kibana visualizing off of the central Elasticsearch cluster open to end users and cluster administrators.
