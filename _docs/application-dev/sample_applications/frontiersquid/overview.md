---
title: Overview 
overview: Explanation of OSG Frontier Squid

order: 10

layout: docs
type: markdown
---
{% include home.html %}

[Squid](http://www.squid-cache.org/) is a caching proxy for the Web supporting HTTP, HTTPS, FTP, and more. It reduces bandwidth and improves
response times by caching and reusing frequently-requested web pages. [Frontier](http://frontier.cern.ch/)
uses squid as part of its distributed database caching system which distributes data from data sources
to many clients around the world.

![Frontier Architecture](https://twiki.cern.ch/twiki/pub/Frontier/FrontierOverview/__807_380_frontier_architecture.png)


This application delivers the version of the Frontier Squid components as packaged
by the [Open Science Grid](http://opensciencegrid.org/).

The deployment of additional cacheing servers is particularly important, since 
they allow for a more wide-spread use of StashCache to serve data to jobs.


