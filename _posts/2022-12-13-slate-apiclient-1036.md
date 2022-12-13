---
title: SLATE API/Client v1.0.36
overview: SLATE API/Client v1.0.36
published: true
permalink: blog/2022-12-13-slate-apiclient-1036.html
attribution: The SLATE Team
layout: post
type: markdown
#tag: draft
---

The SLATE API &amp; Client version `1.0.36` includes improvements to the Kubernetes NGINX Ingress Controller, added support for OpenTelemetry, and more.

<!--end_excerpt-->

## Release Notes

### Features/Improvements

* Updated the SLATE API server to compile and run on a Rocky Linux `9.x` container hosted by the Google Kubernetes Engine (GKE).
* Upgraded the installed [Amazon Web Services (AWS) C++ SDK](https://github.com/aws/aws-sdk-cpp) version to `1.9.365`.
* Installed the [OpenTelemetry C++ Client](https://github.com/open-telemetry/opentelemetry-cpp) version `1.6.1`, adding support for [OpenTelemetry](https://opentelemetry.io) in the SLATE API Server.
  * Adding OpenTelemetry improves the SLATE team's monitoring capabilities.
  * OpenTelemetry allows the SLATE team to track down and correct errors that occur in the SLATE API Server more quickly.
  * Future plans include OpenTelemetry integration with the SLATE Client and Portal.
* Added a [new SLATE Client](https://github.com/slateci/slate-client-server/releases/latest) for macOS 12.
* Transitioned to serving the SLATE [Incubator](https://github.com/slateci/slate-catalog-incubator) and [Stable](https://github.com/slateci/slate-catalog-stable) catalogs via GitHub Pages.

### Fixed

* Addressed an issue where the Kubernetes NGINX Ingress controller was suffering `connection refused` errors.

## Guides

* [SLATE Client Access & Installation](https://portal.slateci.io/cli)
* [SLATE Cluster Upgrade Guide - K8s v1.24](/blog/slate-cluster-upgrade-guide-1_24.html)
* [Adding the application to the catalog](/docs/apps/catalog.html)
