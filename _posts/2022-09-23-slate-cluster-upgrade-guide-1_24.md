---
title: SLATE Cluster Upgrade Guide - K8s v1.24
overview: Update SLATE clusters to K8s v1.24
published: true
permalink: blog/slate-cluster-upgrade-guide-1_24.html
attribution: The SLATE Team
layout: post
type: markdown
---

The SLATE team has been busy preparing SLATE for Kubernetes `v1.24`. Today we are happy to announce that this work is now live.

<!--end_excerpt-->

## Overview

This post will walk cluster administrators through the following steps:

1. Update the SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24` using `kubeadm`.
2. Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to at least `v3.24.1`.
3. Update [MetalLB](https://metallb.universe.tf/) to at least `v0.13.5`.
4. Replace the deprecated NRP Controller with the new and improved SLATE Federation Controller.
5. Update the SLATE Federation Controller role bindings.
6. Upgrade all K8s Ingress objects to `apiVersion:networking.k8s.io` (from `apiVersion:extensions/v1beta1`).
7. Upgrade the SLATE Ingress Controller containers to use the latest supported version.

## Upgrading kubeadm clusters

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for more information on updating a Kubernetes cluster using `kubeadm`

## Update Calico CNI 

Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to at least `v3.24.1`.

```shell
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.24.1/manifests/tigera-operator.yaml && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.24.1/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

## Update MetalLB

Update [MetalLB](https://metallb.universe.tf/) to at least `v0.13.5`.

```shell
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.5/config/manifests/metallb-native.yaml
```
{:data-add-copy-button='true'}

## Migrate to SLATE Federation Controller

Lorem ipsum delor alcot.

