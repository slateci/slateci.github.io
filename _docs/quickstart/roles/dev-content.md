---
title: SLATE Application Developers
overview: How to start as a SLATE Application Developer.
order: 20

layout: docs
type: markdown
---
{% include home.html %}

Developing a SLATE application, or packinging an existing application into SLATE, is essential in creating and maintaining a catalog of applications installable on any SLATE cluster at the push of a button.

In order to develop SLATE applications, you should already be familiar with [how SLATE is used]({{home}}/docs/using-slate/) and the [concepts]({{home}}/docs/concepts) SLATE is built on.

## Essential Application Components

In order to be run with the minimal setup steps SLATE requires, SLATE applications consist of three essential components:
- A [Docker Container]({{home}}/docs/application-dev/container.html)
- A [Kubernetes Deployment]({{home}}/docs/application-dev/deployment.html)
- A [Helm Chart]({{home}}/docs/application-dev/chart.html)

The typical SLATE application workflow is to create these components independently and in order. Begin with containerizing the application using Docker, and then create Kubernetes deployments for testing. Once the proper Kubernetes configuration is worked out, describe the configuration using a Helm chart. At this point, an application is ready to be SLATE-deployable.

## Development Tools and Environments

Each one of the components above is built off of best-of-breed existing technologies, each with their own development processes and environments. To build on these tools and provide a testing environment for SLATE itself, two tools are available - **MiniSLATE** and **SLATElite**.
- [MiniSLATE]({{home}}/docs/using-slate/minislate.html) is a complete, self-contained SLATE environment that runs on your local machine, using containers and virtual machines to simulate the core components of a SLATE cluster.
- [SLATElite]({{home}}/docs/using-slate/slatelite.html) is a utility that runs a single-node SLATE cluster on your local machine and connects it to the larger SLATE federation. This utility can be used to see how your application might interact with other SLATE clusters on the federation.

## Application Catalog

SLATE Applications are developed and maintained within the curated [SLATE Application Catalog](https://github.com/slateci/slate-catalog). The catalog consists of [stable](https://github.com/slateci/slate-catalog/tree/master/stable) and [incubator](https://github.com/slateci/slate-catalog/tree/master/incubator) subcatalogs.

The **incubator** is a repository of applications that are deployable, or close to being deployable, on SLATE clusters. These applications are typically under active development and testing. Once stable, they are moved to the **stable** catalog

The **stable** section of the catalog is reserved for applications that have been thoroughly vetted for stability by both the application and core SLATE developers. Once an application from the incubator is deemed stable enough for a heavy majority of users to deploy with ease, the application is moved to stable

## Documentation

In-depth directions, guides, and tutorials can be found in the Application Development section of the SLATE documentation.

<div id="doc-call" class="container-fluid doc-call-container ">
    <div class="row doc-call-row">
        <div class="col-md-10 nofloat center-block">
            <div class="col-sm-9 text-center nofloat center-block">
                <a href="{{home}}/docs/application-dev/index.html"><button class="btn btn-slate">Application Development Docs</button></a>    
            </div>
        </div>
    </div>
</div>