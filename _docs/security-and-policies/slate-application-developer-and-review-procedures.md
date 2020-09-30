---
title: SLATE Application Developer and Review Procedures
overview: SLATE Application Developer and Review Procedures

order: 10  

layout: docs2020
type: markdown
---

| Version | Comment | Effective Date |
|---|---|---|
|1.0|Initial Version|September 25, 2020|

## Preface

Applications intended for deployment and operation using the SLATE platform differ from standard Kubernetes applications in a number of ways. Given SLATE's role in providing an edge services platform, the cybersecurity requirements must align and satisfy those of Edge Cluster host institutions.  In particular, applications (often containerized services) must adhere to the following:

- They have a well-understood image provenance. Images are typically:
  - Provided for use in SLATE by a "Trusted Organization" (see the [link to be inserted at publication time]) 
  - Developed or maintained directly by the SLATE team, and with sources stored in source control repositories overseen by the SLATE Team
  - Have all dependent image layers also follow the previous two rules
- Must not allow Application Administrators to substitute container image(s) used by the application.

## Application Development

Application Developers should submit new applications and modifications as pull requests to the [application catalog repository](https://github.com/slateci/slate-catalog). 

Packaged applications must have a Helm chart which defines how the application is installed in Kubernetes, and may also contain the sources for container images used by the application. Unless an image is drawn from a source on SLATE's allow-list of trusted external image maintainers/sources, its sources must be included in the catalog with the chart which uses it. 

The chart must have a README which provides basic guidance on what the application is for and how to install and use it. It must contain a reference or link to any more complete documentation for the application which is maintained elsewhere. When possible, Application Developers should provide guidance on how to test the functioning of the application with widely, or at least publicly, available tools. 

The default configuration of an application should, as much as possible, be chosen to be reasonably safe to operate (e.g. proxies should not default to being open to the entire internet, etc.). Any features of the application which have significant security implications must be clearly mentioned in the README with explanations of the concerns an operator should be aware of. 

Application developers are encouraged to test their applications by installing them directly to a Kubernetes cluster (such as minikube) with Helm, or in the [miniSLATE](https://github.com/slateci/minislate) test environment to ensure proper functionality before submitting them for review, as this makes the review more efficient for all parties. 

## Application Review

Every application must be reviewed by at least one person not responsible for its development or packaging. 

An Application Reviewer must examine each pull request to the application catalog. The reviewer should:

- Check the output of helm lint and outline changes to fix any flagged errors. 
- Check the origin of each container image used in the application to ensure that it complies with the image provenance rules. 
- Look at the output of the image vulnerability scanner, and recommend changes to fix any 'critical' or 'high' severity issues which it flags. 
- Check that all Kubernetes objects produced by the chart carry appropriate labels.
- Check that all Kubernetes objects produced by the chart have names which depend on appropriate factors (the release name, the instance tag) to prevent collisions between multiple installs. 
- If possible, for new applications or if the review judges the changes to an application to have been major, check that the application installs cleanly and functions according to its purpose. 
  - This step may be waived if the application requires special resources which are not readily available in order to function, such as unusual computing hardware, or credentials issued by a particular organization to which no available reviewer belongs. However, in such cases special care should be taken to discuss what testing has been done and what the deployment/operation requirements are with the application developer. 
- Report the results of the review to the submitter.
  - Unless special circumstances apply (e.g. discovery of a significant vulnerability in the upstream software) the review report and associated discussion should be made public. 
- The Application Reviewer will provide a report on review findings, and make this available in a standardized format.
- Application Reviewers will be available to discuss with prospective Application Developers and Application Administrators the process, expectations, as well as consult on expected risks and mitigations.

## Application Maintenance

Applications previously reviewed by an Application Reviewer and curated into the SLATE catalog can receive regular updates for maintenance purposes, feature updates, security updates, etc.  All of the principles and obligations of the Application Development section above apply. 

Any change to an application must include an update of the chart's version number. While this is annoying to remember for small changes, it is necessary to ensure that versions are distinguishable, and that Helm will actually use the new version, rather than a stale one from its local cache. 

<hr>

This document is a policy of the SLATE (Services Layer at the Edge) project, supported by the National Science Foundation Office of Advanced Cyberinfrastructure: "CIF21 DIBBs: EI: SLATE and the Mobility of Capability", award number [OAC-1724821](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1724821&HistoricalAwards=false)