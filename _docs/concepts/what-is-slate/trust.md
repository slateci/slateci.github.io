---
title: SLATE Trust
overview: What SLATE and its users can and can't do within a cluster

order: 80

layout: docs
type: markdown
---

## Overview

SLATE is designed for two different sense of multi-tenancy: to share use of each participating Kubernetes cluster with other users and uses of those clusters, and at the same time to have its users share resources within each cluster without interference. 

## SLATE sharing with non-SLATE uses

As much as possible SLATE tries to avoid using cluster-wide permissions or objects. To do this, a small number of such object are needed. The foremost of these are associated with Dmitry Mishin's [NRP Controller](https://gitlab.com/ucsd-prp/nrp-controller), which is installed in the `kube-system` namespace when registering a cluster, and a [ClusterRole](https://gitlab.com/ucsd-prp/nrp-controller/blob/master/federation-role.yaml) which it assigns to SLATE. 
The NRP Controller is used to create a custom 'cluster' resource, a base SLATE namespace (normally called 'slate-system'), and a ServiceAccount limited by the previously mentioned ClusterRole. 
As a result of this limitation, SLATE can only manipulate objects in its own base namespace, request via the NRP controller to create new namespaces (which are always prefixed with 'slate-group-'), and manipulate objects in namespaces granted to it by the NRP Controller. 
Only the credentials for this limited ServiceAccount are ever transmitted to the SLATE federation. 
As a result, neither automated parts of the SLATE infrastructure, [SLATE users](http://slateci.io/docs/concepts/individual-roles/application-administrator.html), nor even SLATE [Platform Administrators](http://slateci.io/docs/concepts/individual-roles/platform-administrator.html) can access Kubernetes objects outside of the namespaces allocated to SLATE on the cluster. 
Deleting the original 'cluster' resource (whose name matches the base SLATE namespace) is sufficient to entirely remove SLATE's access to the cluster (although doing so without first running a corresponding deletion operation through the SLATE interface does leave the federation in a mildly damaged state, and is thus not recommended as a typical operating procedure). 

It should be noted that since installing the NRP Controller _is_ a privileged operation, when the [Cluster Administrator](http://slateci.io/docs/concepts/individual-roles/edge-administrator.html) runs `slate cluster create` to join the cluster to the federation, this does require using the administrator's full access privileges. 
It is only at this point (and when later running `slate cluster update -r`) that any code distributed by SLATE has full access to the cluster. 
As a matter of policy, the SLATE client will try to give a full and clear account of what operations it will perform at these points, and request the administrators permission to carry them out. 

During the cluster registration phase the SLATE client may also install additional components; for example an ingress controller and monitoring tools, but these features are not yet implemented. 

## Sharing within SLATE

SLATE also tries to ensure that different groups using it cannot interfere, accidentally or deliberately, with each others' work. 
To do this, SLATE allows [users](http://slateci.io/docs/concepts/individual-roles/application-administrator.html) to install objects only within per-group namespaces. 
SLATE does not allow its users to execute `kubectl` commands directly, and permits installing only applications from its curated [catalog](https://portal.slateci.io/applications), which are vetted to ensure that they operate only within a single namespace. 
Please see the [Application Security for the Edge](http://slateci.io/blog/app-sec-edge.html) note for more information about how and why applications are vetted. 