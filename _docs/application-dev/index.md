---
title: Application Development
overview: Guidelines for SLATE application development
index: true

order: 90

layout: docs
type: markdown
---

{% include home.html %}

The development of a SLATE application can be broken down into the following three components.

* A **Docker container**, or set of containers, that encapsulate processes for the target edge clusters.
Many applications consist of only one process (e.g. a Globus Connect server) so they will require 
only one container. Some applications may require multiple processes (e.g. a web server frontend 
and a database backend) so they will be composed of multiple containers that work together.

* A **Kubernetes deployment** for the application. A Kubernetes deployment encapsulates the set of
instructions that are needed to make the applications run. It will describe which containers need
to run, how they need to be configured, and requirements for network access and storage. 

* A **Helm chart** for the application. A Helm chart parametrizes the deployment so that
multiple instances of the same application can be installed. It describes which
elements of a Kubernetes deployment can be changed based on user requirements.

It is recommended that each step is developed independently and in order. That is, first create
Docker images and test them independently with Docker. Then create Kubernetes
deployments and test them in Minikube or on a test cluster. Finally parametrize the Kubernetes deployment
with a Helm chart.

Once all components have been developed, one can request their application to be added to the catalog.

