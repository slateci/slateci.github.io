---
title: Supported Software Versions
overview: Supported Software Versions

order: 100

layout: docs2020
type: markdown
---

The SLATE Platform federates Kubernetes clusters, which requires some consistency in the software versions used by all of those clusters. 
The maintainers of the Kubernetes project ensure compatibility between components which [differ by at most one minor version](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/release/versioning.md#supported-releases-and-component-skew). 
SLATE therefore generally tries to support the current Kubernetes release, and the two previous minor versions, by internally using the latest patch release of the previous minor version. 
The supported version range is currently:

| Effective Date | Minimum Kubernetes Version | Maximum Kubernetes Version | 
| --- | --- | --- |
| May 27, 2020 | v1.18 | v1.21 |
