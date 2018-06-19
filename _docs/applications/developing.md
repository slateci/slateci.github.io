---
title: Developing Platform Applications
overview: TODO

order: 60

layout: docs
type: markdown
---
{% include home.html %}

To develop a SLATE application, one needs the following pieces:

* Container(s) of application
* Kubernetes deployment configuration
* HELM chart for application

Below we will go through the steps for creating each of the above:

Creating Container for SLATE Application
----------------------------------------

There are various different ways to create a container in Docker. For SLATE, 
we *strongly recommend* using a `Dockerfile` to create the container(s) for 
a SLATE application. The Dockerfile` allows a third party, such as the SLATE 
app curators, to easily follow and understand the contents of a Docker 
container. We will only show how to create and populate a `Dockerfile` for 
now.

The starting point for any `Dockerfile` is the baseline Docker image to 
import. This is typically an OS image, such as `centos:7` or `centos:6`, 
a container that is already part of SLATE or OSG, such as the 
[OSG worker image](). 
In a docker file this will be, for example,

```
FROM centos:7:latest
````

at the top of the file. 
