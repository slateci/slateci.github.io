---
title: Docker Container
overview: Docker container for OSG Frontier Squid

order: 20

layout: docs
type: markdown
---
{% include home.html %}

The docker container for OSG Frontier Squid can be found 
[here](https://hub.docker.com/r/slateci/osg-frontier-squid/). The container
allows the service to be configured either with the direct configuration file `/etc/squid/squid.conf`
or with the more portable costumization script `/etc/squid/customize.sh`.

The [Dockerfile](https://github.com/slateci/container-osg-frontier-squid/blob/master/Dockerfile)
uses the latest CentOS 7 version as the baseline image. 
We add the `epel-release` and the OSG 
software image (in this case release 3.4 for EL7). We then expose the port and import the
entrypoint script, which will take care of configuring and running the service.
