---
title: SLATE Trust
overview: What SLATE and its users can and can't do within a cluster

order: 80

layout: docs2020
type: markdown
---

## Overview

SLATE is designed for two different senses of multi-tenancy: First, to avoid interference between SLATE and non-SLATE users on participating Kubernetes clusters, and second to prevent interference between SLATE users on the same clusters. 

## SLATE sharing with non-SLATE users

SLATE is designed to have a minimal footprint on edge clusters which participate in its federation. 
It installs only a small number of objects 'globally', or in privileged namespaces on each cluster: 
Two Custom resource Definitions (CRDs), implemented by Dmitry Mishin's [NRP Controller](https://gitlab.com/ucsd-prp/nrp-controller), which is installed in the `kube-system` namespace, a [ClusterRole](https://gitlab.com/ucsd-prp/nrp-controller/blob/master/federation-role.yaml) which the NRP Controller assigns to SLATE, and a 'Cluster' resource (one of the two custom types) which is used to grant SLATE access to the cluster. 

The 'Cluster' resource, typically named 'slate-system' creates a corresponding namespace and service account. 
The service account is bound by the ClusterRole to prevent it from accessing any part of the cluster outside of the namespaces granted to it by the NRP Controller, which besides the base namespace are always prefixed with 'slate-group'. 
All commands executed remotely by SLATE on the cluster use this same ServiceAccount. 
As a result, neither automated parts of the SLATE infrastructure, [SLATE users](http://slateci.io/docs/concepts/individual-roles/application-administrator.html), nor even SLATE [Platform Administrators](http://slateci.io/docs/concepts/individual-roles/platform-administrator.html) can access Kubernetes objects outside of the namespaces allocated to SLATE on the cluster. 

Installing the Custom Resource Definitions and ClusterRole requires full access to the cluster, but this level of access is only used when running `slate cluster create` (and `slate cluster update -r`). 
As a matter of policy, the SLATE client will try to give a full and clear account of what operations it will perform at these points, and request the administrator's permission to carry them out. 

During the cluster registration phase the SLATE client may also install additional components, for example, an ingress controller and monitoring tools, but these features are not yet implemented. 

## Sharing within SLATE

SLATE also ensures that different groups using it cannot interfere, accidentally or deliberately, with each others' work. 
To do this, SLATE allows [users](http://slateci.io/docs/concepts/individual-roles/application-administrator.html) to install objects only within per-group namespaces. 
SLATE does not allow its users to execute `kubectl` commands directly, and permits installing only applications from its curated [catalog](https://portal.slateci.io/applications), which are vetted to ensure that they operate only within a single namespace. 
Please see the [Application Security for the Edge](http://slateci.io/blog/app-sec-edge.html) note for more information about how and why applications are vetted. 