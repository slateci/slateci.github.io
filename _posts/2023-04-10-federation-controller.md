---
title: "Replacing the NRP controller in SLATE"
overview: A guide to the new federation controller
published: true
permalink: blog/2023-04-10-federation-controller.html
attribution: Suchandra Thapa
layout: post
type: markdown
tag: draft
---

The SLATE platform provides a powerful, simple way to deploy a large variety of applications.
In this blog post, we will talk about the new federation controller that we've created
in order to allow Kubernetes clusters to be federated as well as discussion on how the
new federation controller operates.

<!--end_excerpt-->


## Background

In order to function SLATE needs to be able to programmatically create namespaces and service accounts
on Kubernetes clusters for itself and for organizations that will be running applications on federated 
clusters. 

When a group is given access to a federated cluster, SLATE needs to create a new namespace and service 
account on the federated cluster and restrict the group's access to that namespace.  Prior to 2022, 
SLATE used the [NRP Controller](https://gitlab.com/ucsd-prp/nrp-controller) to handle creation of 
namespaces and service accounts.  However, the NRP controller does not support Kubernetes 1.20 or later.

Due to this, SLATE needed to update the NRP controller to support modern Kubernetes (K8S) versions.  However,
while updating the NRP controller, other issues with the controller were discovered that required 
a rewrite of the controller.


## NRP Controller Issues

There were several issues discovered with the NRP controller while investigating it.  The first was that
the current version of the NRP controller was effectively unmaintained.  In addition, the controller did
not work with recent versions of Kubernetes.  Finally, the controller used fairly version old version of 
Go which did not support the current go modules packaging. Due to these  issues, the decision was made to 
rewrite the NRP controller using modern Go and using the current Kubernetes API and client libraries.


## Federation Controller basics

The SLATE federation controller does two things.  First, it registers two cluster resource descriptors (CRDs)
with the Kubernetes cluster.  The first CRD (clsuter.slatci.io) creates the necessary namespace, service account,
and role bindings to allow SLATE to use the cluster.  The second CRD (clusterns.slateci.io) will generate a
namespace, service account, and role bindings that SLATE groups will use when working with applications 
on the system.

The federation controller is in actuality two different controllers.  Each controller monitors a single type
of CRD.  When CRDs are updated, created, or deleted the controller will take the corresponding actions.

## Go Related Changes

The NRP controller was written using an older Go packaging system  (golang/dep).  The first task when updating the
controller required updating the project to use `go mod` instead.  This was fairly straightforward.  Running 
`go mod init` created a basic `go.mod` file that was then modified to reference the needed modules.  

A bigger change was updating the code to adhere to modern Go conventions.  The old NRP code was written without
using any `Context`s.  Although it required some work, updating the code to use `Context`s throghout and to handle 
them was straightforward.  Although a few places required using a `TODO Context`, the changes were made and the 
updated code did work.  However, the code still did not support Kubernetes clusters using K8S 1.22 or later.

## Kubernetes Related Updates

However after reviewing the updated controller code and the changes needed to support current versions of Kubernetes,
the decision was made to rewrite the controller to work within the current Kubernetes controller model. 

<img src="/img/posts/controller-model.png"> 

The K8S controller model is based on several components that work together to monitor CRDs on a K8S cluster and to
update the cluster as CRDs are created, updated, or deleted.  In essance, a controller uses a component called an
Informer to query  the cluster for the existance of the CRDs that it is interested in. The SLATE federation 
controller uses a variant called a `SharedInformer` to do this.  A `SharedInformer` functions just like an `Informer` 
but uses a shared cache so that other controllers can also work with the CRD being monitored without having to 
worry about having outdated or invalid objects in their caches.  

When CRDs are changed (created, updated, etc), the `SharedInformer` will dispatch updates to the resource handler for
that CRD.  Due to technical reasons, the updates get placed in a workqueue that then gets processed to make the corresponding
updates to the cluster.

The federation controller implementation is primarily consists of code that monitors the workqueues and then updates namespaces,
service accounts, and role-bindings appropriately.  I.e. creating them when a CRD is created, and deleting them when the corresponding
CRD is removed.

## Controller Code Generation

The final changes needed to the code were a few technical ones due to the way the K8S client api works in Go.  Since 
the new controller targetted Go 1.17, Go generics are not available.  Due to this, the K8S client api requires using 
the codegen tool to generate code that will take json from the K8S api server and automatically convert it to a 
native Go type that matches the custom CRDs that are being used.  This is done by defining the Go structures for the 
custom CRD types that the controller is interested in (cluster/clusternss).  Then using the tooling from 
`kubernetes/code-generator` generates the appropriate code that will automatically convert json from the K8S api server
into the appropriate Go types for the CRD.

## Wrapping it up 

Although rewriting software is not something that should be done on a whim, after initial efforts to update the NRP controller 
and review of the remaining work, a rewrite was warranted.  The new federation controller used fairly modern Go code and K8S 
apis.  It should operate on K8S for quite a while in the future thanks to the rewrite.
