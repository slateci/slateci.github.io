---
title: SLATE Security Summary
overview: SLATE Security Summary

order: 5

layout: docs2020
type: markdown
---

SLATE (Service Layer At The Edge) is a system to enable **sites** to delegate service deployment and configuration to selected **application administrators**. A SLATE container/virtualization platform (currently based on Kubernetes) is established by sites that wish to participate in the service. This SLATE edge cluster is located within the site and since it is container-based, can support arbitrary service applications. A central SLATE service orchestrates the deployment of containers to participating sites. 

The site provides the central SLATE system with credentials for their local cluster and configures to services they wish to allow at their site. Application developers only have permission to create and upload Docker containers and Helm charts, which can then be vetted before release to sites. Sites can limit the ability of the SLATE system to deploy only those specific **services** desired, or allow a Virtual Organization (VO) to deploy whatever services they require.

User (site administrators and application developers/administrators) interaction with the SLATE central service is authenticated/authorized with standard OIDC (https://openid.net/connect/)e.g. via InCommon, Globus auth, etc. The site-based Kubernetes cluster credentials are the only site access the system has, and they are only used programmatically by the SLATE system, never by users directly. 

Although this may seem at first to present novel risks, in cybersecurity terms it is not significantly different from managing application installation via RPM and YUM. In this model the central SLATE service is like a YUM repository, and container developers are like RPM packagers/maintainers. With RPM/YUM, sites trust that the Apache developers have done due diligence when they release a new version of their web server, and site admins normally do YUM updates without hesitation. Moreover, many RPMs actually set services with simple default configurations to 'on' upon installation. SLATE simply extends this model to include the configuration of the software. 

Benefits:
- Sites can provide complex services that need to be located close to, or have special access to resources without the site administrators having to understand, deploy, configure, and upgrade the software providing the services. 
- Because service experts create the containerized services, they are less likely to be deployed with insecure settings by accident. 
- Because re-deployment and upgrades can be rolled out as soon as they are available, software vulnerability patches are deployed quickly. 

Risks:
- Sites delegating responsibility for correctly installing, configuring, and protecting service applications to people who do not work for the site.
- Sites are trusting the VOs to which they grant privileges to properly vet their users (application administrators). 

Mitigations:
SLATE applications are well-defined within the SLATE information model. Applications must declare what ports and resources they use in advance. In theory this could be used to create IDS profiles to look for anomalous behavior.
SLATE application containers are cataloged centrally, and go through a vetting process before being released for deployment.   
Inbound connections to the site-based Kubernetes cluster can be limited via firewall to only the central SLATE service IP range.
SLATE user and group credentials are handled under a (VO) model, so sites give privileges to VOs/Roles rather than individual accounts. 
Site administrators are given the option of fine-grained control over service installation and updates. E.g. VO X may install and update whatever service they want. VO Y may only install/update service A automatically. Service B may only be updated with site admin manual approval. 

Example services:
- Perfsonar
- Squid web cache
- Data federation storage/cache (e.g. XCache, XRootd transfer node).
- Grid Compute Element
- VO Job/pilot factory