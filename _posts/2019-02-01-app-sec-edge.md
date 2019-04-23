---
title: "Application Security for the Edge"
overview: SLATE publication
published: true
permalink: blog/app-sec-edge.html
attribution: Chris Weaver, Lincoln Bryant, Rob Gardner
layout: post
type: markdown
---

This whitepaper how applications are managed on a federated research platform. The intended end result is that an application administrator can deploy an application to an edge cluster in a trusted manner.  

<!--end_excerpt-->

 In order to provide security in the platform, SLATE users may only install applications  from a curated catalog (See this document for details). The remainder of this document describes the procedure for adding applications to the catalog, and the rationale behind the procedure. 


![alt text](images/app-sec-fig1 "Fig 1")


## Catalog 

The platform seeks to enable its users to deploy applications on various compute resources contributed by resource providers. Resource providers desire guarantees that application code run on their resources will be suitable, that is, serve a valid science purpose and not contain security vulnerabilities. At  the same time, application developers and administrators must have enough flexibility to accomplish their science goals. The curation of the application catalog is designed to balance these stakeholder needs. 
The fundamental concept of the application catalog is to limit applications which can be deployed to those which the platform team can certify meet criteria suitable to the resource providers. This necessitates application developers submitting their work for review by the platform team,  and constructing mechanisms to ensure that only code which has passed the platform team's review can be deployed. The review process must not be unduly burdensome to application developers, lest the overhead of working with the platform be greater than the value the platform can provide. 

Deploying containerized applications to Kubernetes involves two levels of code which must be trusted, and therefore must be reviewed. The first is the actual executable code and its immediate configuration, which is embodied in a Docker image, defined by a set of image sources (primarily a Dockerfile). The second is the higher level configuration of the container within Kubernetes, which we choose to treat in the form of a Helm chart. Helm charts offer the opportunity to separate the majority of application configuration from a reduced set of user adjustable parameters. In order to ensure that an application is well behaved the Helm chart must be reviewed to ensure that it provides a suitable configuration of the application, and exposes no adjustable parameters which would compromise that configuration. The Docker image sources must be likewise audited. Finally, steps must be taken to ensure that the Docker image which will be used in the future will correspond to the sources which are reviewed. This is required because images are typically fetched from central repositories (e.g. Docker Hub) when an application instance is deployed, and these repositories typically allow the image corresponding to a given identifier to be replaced. 

To address all of these concerns, application image sources and Helm charts are maintained by the platform team in the application catalog in the form of a public repository (that is, readable by the public but modifiable only by the platform team), and the platform team publishes charts and images for use on the platform from this repository only. New applications (and changes to existing applications) are proposed by application developers, and reviewed and approved by members of the platform team. Typically, the repository would be hosted on a provider like GitHub, and proposals for additions and changes are made in the standard way supported by that provider, i.e. Pull Requests on GitHub. A complete workflow involving An Application Developer (AD) and a Platform Application Reviewer (PAR) is as follows:

* AD writes image sources, testing locally until the image functions as intended
* AD writes chart sources, testing locally until the chart installs cleanly
* AD 'forks' the application catalog git repository
* AD adds image and chart sources to his/her copy of the catalog repository (to the section for applications under consideration, the 'incubator' catalog)
* AD submits a 'pull request' to the original catalog git repository to merge his/her additions
* PAR examines the pull request. If all sources appear valid he or she merges the pull request
* A continuous integration system detects the change, publishes an updated version of the catalog, and builds the image and publishes it to a Docker repository
* PAR performs a review of the contributed chart and image sources to determine whether they meet all requirements for inclusion in the stable catalog
* If requirements are met, PAR moves the chart and image sources to the stable section of the catalog
* The continuous integration system detects the change, publishes an updated version of the catalog, and builds the image and publishes it to a Docker repository. 

![alt text](images/app-sec-fig2 "Fig 2")


It should be noted that the platform team cannot reasonably inspect all software to its lowest levels. Images typically build up from base sources like Linux distributions and major open-source software packages which are already widely trusted to be run at sites. It is expected that the platform team would maintain a public whitelist of trusted organizations whose images may be used by applications without being hosted as part of the catalog.


