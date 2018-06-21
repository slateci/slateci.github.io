---
title: Overview
overview: Highlights the different steps in packaging a SLATE application

order: 10

layout: docs
type: markdown
---
{% include home.html %}

The development of a SLATE application can be broken down into the following three components.

* The Docker container(s) of the application. A Docker container encapsulates a process
that will run on the cluster. Many applications consist of only one process (e.g. a static website,
a database server, ...) so they will require only one container. Some applications, though, may
require different processes (e.g. a web server frontend and a database backend) so they will be
composed of multiple containers that work together.
* A Kubernetes deployment for the application. A Kubernetes deployment encapsulates the set of
instructions that are needed to make the applications run. It will describe which containers need
to run, how do they need to be configured, what kind of network access will they have, what 
storage requirements do they have and so on.
* A Helm chart for the application. A Helm chart allows to parametrize the deployment so that
multiple instances of the same applications can be installed. It will allow to describe which
element of the Kubernetes deployment can be changed based on user requirements.

It is recommended that each step is followed independently from the later ones. That is, first create
the Docker images and test them independently with Docker; then create the Kubernetes
deployments and test them in minikube and on a cluster; finally parametrize the Kubernetes deployment
with a Helm chart.


