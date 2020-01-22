---
title: Kubernetes Deployment
overview: Docker container for StashCache

order: 40

layout: docs2020
type: markdown
---
{% include home.html %}



Deploying StashCache in Kubernetes, see Kubernetes deployment files [here](https://github.com/slateci/container-stashcache/tree/master/kubernetes), 
requires running a [`LoadBalancer Service`](https://kubernetes.io/docs/concepts/services-networking/service/), [`Deployment`](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), and [storage](https://kubernetes.io/docs/concepts/storage/). The 
`LoadBalancer Service` is needed to get a public IP for the service. The `Deployment` is required to describe the [`Pod`](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/) 
and the contents of said `Pod`. In case of StashCache the `Pod` will run 
two containers: one for StashCache itself and one for HTCondor to allow 
StashCache to become a HTCondor service.

The storage can either be provided through one of the included 
[`Storage Classes`](https://kubernetes.io/docs/concepts/storage/storage-classes/) 
or through SLATE's [`nfs-provisioner`](https://github.com/slateci/nfs-provisioner).
The required storage does not necessarily be fast; however, it may have to 
scale over time depending on the cache utilization.
