---
title: Application Developer and Review Procedures
overview: Application Developer and Review Procedures

order: 10  

layout: docs2020
type: markdown
---

| Version | Comment | Effective Date |
|---|---|---|
|1.0|Initial Version|September 25, 2020|
|2.0| Updated review procedures | March 23, 2021 |



## Preface

Applications intended for deployment and operation using the SLATE platform differ from standard Kubernetes applications in a number of ways. Given SLATE's role in providing an edge services platform, the cybersecurity requirements must align and satisfy those of Edge Cluster host institutions.  In particular, applications (often containerized services) must adhere to the following:

- They have a well-understood image provenance. Images are typically:
  - Provided for use in SLATE by a "Trusted Organization" (see the [Trusted Image Sources](/docs/security-and-policies/trusted-image-sources.html)) 
  - Developed or maintained directly by the SLATE team, and with sources stored in source control repositories overseen by the SLATE Team
  - Have all dependent image layers also follow the previous two rules
- Must not allow Application Administrators to substitute container image(s) used by the application.
- Must be accompanied by a README document as described below to provide descriptive, implementation related, and review information, especially for Edge Administrators and Application Administrators.


## Application Development

Application Developers should submit new applications and modifications as pull requests to the SLATE stable catalog (https://github.com/slateci/slate-catalog). 

Packaged applications must have a Helm chart which defines how the application is installed in Kubernetes, and may also contain the sources for container images used by the application. Unless an image is drawn from a source on SLATE's allow-list of trusted external image maintainers/sources, its sources must be included in the catalog with the chart which uses it. 

The chart must have a README document (for which the template is provided in the Appendix) which provides guidance on what the application is for and how to install and use it. The README is divided into two main sections, one to be completed by the Application Developer and the other by the Application Reviewer. The Developer completed section may contain a reference or link to more complete documentation for the application that is maintained elsewhere. When possible, Application Developers should provide guidance on how to test the functioning of the application with widely, or at least publicly, available tools.  

The default configuration of an application should, as much as possible, be chosen to be reasonably safe to operate (e.g. proxies should not default to being open to the entire internet, etc.). Any features of the application which have significant security implications must be clearly mentioned in the README with explanations of the concerns an operator should be aware of. 

Application developers are encouraged to test their applications by installing them directly to a Kubernetes cluster (such as minikube) with Helm, or in the [miniSLATE](https://github.com/slateci/minislate) test environment to ensure proper functionality before submitting them for review, as this makes the review more efficient for all parties. 


## Application Review

Each item to be put into the SLATE stable catalog must first undergo the review process defined in this document. The item might consist of one or possibly more containers, all of which are referenced in a single Helm chart. We’ll refer to this item as an application throughout this document.

Every application must be reviewed by at least one person not responsible for its development or packaging. The README document in the Appendix contains a list of questions for the review.  At the end of each review, the Application Reviewer will update the Reviewer completed section of the README document with the review findings, and make it available along with the container in the stable catalog.  This approach allows stakeholders to see application specific information and the associated review for the referenced version.  Any version update of the application will require an updated README document.

## Application Maintenance

Applications previously reviewed by an Application Reviewer and curated into the SLATE stable catalog can receive regular updates for maintenance purposes, feature updates, security updates, etc.  All of the principles and obligations of the Application Development section above apply. 

Any change to an application must include an update of the chart's version number. This is necessary to ensure that versions are distinguishable, and that Helm will actually use the new version, rather than a stale one from its local cache. 

Each change to an application must be successfully reviewed before being added to the SLATE stable catalog. When there are only a few minor changes, the Reviewer and Developer may decide to focus the process defined here only on these changes.

<hr>

This document is a policy of the SLATE (Services Layer at the Edge) project, supported by the National Science Foundation Office of Advanced Cyberinfrastructure: "CIF21 DIBBs: EI: SLATE and the Mobility of Capability", award number [OAC-1724821](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1724821&HistoricalAwards=false)
