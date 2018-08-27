---
title: 
overview: Cluster metrics and application logs forwarding to a central SLATE database with visualization consumable by end users and cluster administrators.
              
order: 40

layout: docs
type: markdown
---

Examples:
* Metricbeats Daemonset running across a SLATE site forwarding to the central SLATE Elasticsearch cluster.
* Fluentbit sidecar container reading off of a shared volume in a kubernetes pod and forwarding to the central SLATE Elasticsearch cluster.
* Kibana visualizing off of the central Elasticsearch cluster open to end users and cluster administrators.
