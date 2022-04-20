---
title: About
overview: About SLATE.

order: 0

layout: about
type: markdown
--- 
## About SLATE
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

## Acknowledging SLATE

Papers, presentations, and other publications that feature work that relied on SLATE resources, services or expertise should cite the following publication:

<p><i>Building the SLATE Platform</i>, Breen, J., McKee, S., Riedel, B., Stidd, J., Truong, L., Vukotic, I., Bryant, L., Carcassi, G., Chen, J., Gardner, R.W., Harden, R., Izdimirski, M., Killen, R., & Kulbertis, B. (2018). <i>Proceedings of the Practice and Experience on Advanced Research Computing</i>. 1 to 7. doi: <a href="https://dl.acm.org/citation.cfm?doid=3219104.3219144">10.1145/3219104.3219144.</a></p>

In addition please include the following acknowledgement:

<p><i>This work used the SLATE platform, which is supported by National Science Foundation grant number OAC-1724821.</i></p>


## Journal and Conference Papers

<p><i>Managing Privilege and Access on Federated Edge Platforms</i>,  Joe Breen, Lincoln Bryant, Jiahui Chen, Emerson Ford, Robert W. Gardner, Gage Glupker, Skyler Griffith, Ben Kulbertis, Shawn McKee, Rose Pierce, Benedikt Riedel, Mitchell Steinman, Jason Stidd, Luan Truong, Jeremy Van, Ilija Vukotic, and Christopher Weaver. 2019. In Proceedings of the Practice and Experience in Advanced Research Computing on Rise of the Machines (learning) (PEARC '19). ACM, New York, NY, USA, Article 45, 5 pages. DOI: <a href="https://doi.org/10.1145/3332186.3332234">10.1145/3332186.3332234.</a></p>
  
<p><i>Developing Edge Services for Federated Infrastructure Using MiniSLATE</i>,   Joe Breen, Lincoln Bryant, Jiahui Chen, Emerson Ford, Robert W. Gardner, Gage Glupker, Skyler Griffith, Ben Kulbertis, Shawn McKee, Rose Pierce, Benedikt Riedel, Mitchell Steinman, Jason Stidd, Luan Truong, Jeremy Van, Ilija Vukotic, and Christopher Weaver. 2019. In Proceedings of the Practice and Experience in Advanced Research Computing on Rise of the Machines (learning) (PEARC '19). ACM, New York, NY, USA, Article 35, 5 pages. DOI: <a href=" https://doi.org/10.1145/3332186.3332236">10.1145/3332186.3332236.</a></p>

<p><i>Building the SLATE Platform</i>, Breen, J., McKee, S., Riedel, B., Stidd, J., Truong, L., Vukotic, I., Bryant, L., Carcassi, G., Chen, J., Gardner, R.W., Harden, R., Izdimirski, M., Killen, R., & Kulbertis, B. (2018). <i>Proceedings of the Practice and Experience on Advanced Research Computing</i>. 1 to 7. doi: <a href="https://dl.acm.org/citation.cfm?doid=3219104.3219144">10.1145/3219104.3219144.</a></p>

<p><i><a href="https://drive.google.com/file/d/0BzgiYUsbrz2TWHkzNzBlbzJyXzg/view?usp=sharing">SLATE and the Mobility of Capability</a></i>, Gardner, R., Breen, J., Bryant, L., & McKee, S. in <i>Science Gateways 2017</i>.</p>

## Presentations

<p>Chris Weaver (2019). <i>Cybersecurity Challenges for Edge Platforms</i>, 2019 NSF Cybersecurity Summit for Large Facilities and Cyberinfrastructure. <a href="https://docs.google.com/presentation/d/1zwIA5sejgVV8CuMRXWlvHnUGwhE4gyJYpJORIk7BNSo/edit?usp=sharing">Presentation Slides</a></p>

<p>Stidd, J. (2019). <i>Developing Edge Services for Federated Infrastructure Using MiniSlate</i>. PEARC 2019. <a href="https://docs.google.com/presentation/d/1lnbUeYe5fJgJmNFg3mKCqKkPSHGZAcaj_JsvwCvl4UI/edit#slide=id.g5df5dac487_0_0">Presentation Slides</a>. Chicago, Illinois.</p>

<p>Weaver, C. (2019). <i>Managing Privilege and Access on Federated Edge Platforms</i>. PEARC 2019. <a href="https://docs.google.com/presentation/d/1QkOjaj5X1vS3-OZ4VTDYSyt5hCFc8KP4FO7EBWxfKQk/edit#slide=id.p">Presentation Slides</a>. Chicago, Illinois.</p>

<p>Kulbertis, B. (2019). <i>Developing for a Services Layer at the Edge</i>. HEPiX Spring Meeting. <a href="https://docs.google.com/presentation/d/1MVUSRqvXkdcyMlXfqQX-QJGUUtpKr0A3W26mN8JbFEQ/">Presentation Slides</a>. San Diego, California.</p>

<p>Bryant, L. (2018). <i>A Service Layer at The Edge</i>. Annual Meeting of the Great Plains Network. <a href="https://docs.google.com/presentation/d/1f-zNlxWe0eZJM6zDGurcjAK5fKuxt_RRLP73u1rGpN0/edit#slide=id.p">Presentation Slides</a>. Kansas City, Missouri.</p>

<p>Breen, J. <i>et. al.</i> (2018). <i>Building the SLATE Platform</i>. PEARC18. <a href="https://docs.google.com/presentation/d/13F7BmDZkHi8K2LK_sbRJ8L-Ud-ieE0UbOnJumYLl6oU/edit?usp=sharing">Presentation Slides</a>. Pittsburgh, Pennsylvania.</p>

<p>Gardner, R., Breen, J., Bryant, L., & McKee, S. (2017). <i>SLATE and the Mobility of Capability</i>. Gateways 2017. <a href="https://docs.google.com/presentation/d/1VByoCc1OY-g5Ru1NB7--yX-SGLOTgoNF2rXLEekFdoA/edit?usp=sharing">Presentation Slides</a>. Ann Arbor, Michigan.</p>

<p>Gardner, R., McKee, S., & Breen, J. (2017). <i><a href="https://prp.ucsd.edu/presentations/nrp/S1.5%20Gardner_SLATE%20for%20NRP.pdf/at_download/file">SLATE: Services Layer at the Edge</a></i>. First Meeting of the National Research Platform, Montana State University. Bozeman, Montana.</p>

<p>Gardner, R. (2017). <i>SLATE: Services Layer at the Edge</i>. US ATLAS Software and Computing Planning Meeting. <a href="https://docs.google.com/presentation/d/1s24-P8tmpfJoYl4VyFr4KzuPczgms_LJFSQONut6Ngk/edit?usp=sharing">Presentation Slides</a>. Boston University.</p>

<p>Gardner, R., McKee, S., & Breen, J. (2018). <i>SLATE: Services Layer at The Edge</i>. Open Science Grid All Hands Meeting. <a href="https://indico.fnal.gov/event/15344/session/11/contribution/20/material/slides/0.link">Presentation Slides</a>. University of Utah.</p>

<p>Gardner, R. (2018). <i>SLATE: Services Layer at The Edge</i>. ATLAS Sites Jamboree. <a href="https://indico.cern.ch/event/692124/contributions/2899900/attachments/1612269/2561495/SLATE_for_ATLAS_Sites_Jamboree.pdf">Presentation Slides</a>. CERN, Geneva, Switzerland.</p>

<p>McKee, S. (2017). <i><a href="https://youtu.be/yPUNcStouj0">The Machinery of Big Data Science</a></i> (YouTube Video). Saturday Morning Physics Public Lecture. Ann Arbor, Michigan.</p>

## Grant Information

Supported by the National Science Foundation under [Grant No. OAC-1724821.](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1724821&HistoricalAwards=false)

