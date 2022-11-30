---
title: SLATE API/Client v1.0.33
overview: SLATE API/Client v1.0.33
published: true
permalink: blog/2022-11-29-slate-apiclient-1033.html
attribution: The SLATE Team
layout: post
type: markdown
#tag: draft
---

The SLATE API &amp; Client version `1.0.33` includes improvements to the Kubernetes NGINX Ingress Controller, added support for OpenTelemetry, and more.

<!--end_excerpt-->

## Release Notes

### Features/Improvements

* Updated the SLATE API server to compile and run on a Rocky Linux `9.x` container hosted by the Google Kubernetes Engine (GKE).
* Upgraded the installed [Amazon Web Services (AWS) C++ SDK](https://github.com/aws/aws-sdk-cpp) version to `1.9.365`.
* Installed the [OpenTelemetry C++ Client](https://github.com/open-telemetry/opentelemetry-cpp) version `1.6.1`, adding support for [OpenTelemetry](https://opentelemetry.io) in the SLATE API Server.
* Added a [new SLATE Client](https://github.com/slateci/slate-client-server/releases/latest) for macOS 12.

#### OpenTelemetry Changes

OpenTelemetry improves the SLATE team's monitoring capabilities.  With the new
OpenTelemetry changes, we'll be able to track down and correct errors that occur
in the Slate API Server more quickly.  In addition, this allows for future
updates that'll let the Slate team to be able to track and debug problems with
the client and portal as well.

### Fixed

* Addressed an issue where the Kubernetes NGINX Ingress controller was suffering `connection refused` errors.

## Upgrade Guides

* [SLATE Client Access & Installation](https://portal.slateci.io/cli)
* [SLATE Cluster Upgrade Guide - K8s v1.24](/blog/slate-cluster-upgrade-guide-1_24.html)
