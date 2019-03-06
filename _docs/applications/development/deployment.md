---
title: Preparing a Kubernetes deployment
overview: The second step is to prepare and test a Kubernates deployment 

order: 40

layout: docs
type: markdown
---
{% include home.html %}

The second goal is to create a Kubernetes deployment that properly configures
all the components of the application.

In general, we recommend that users follow the <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" target="_blank">excellent Kubernetes documentation</a> for developing deployments.

SLATE applications can additionally expect the following to be available at every site:
  - Persistent Volumes
  - External LoadBalancers
  - An External DNS provider that will create DNS entries under the "slateci.net" domain. 
