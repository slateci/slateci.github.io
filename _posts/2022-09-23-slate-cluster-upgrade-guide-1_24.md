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

1. Upgrading the SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24` using `kubeadm`.
2. Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to `>= v3.24.1`.
3. Update [MetalLB](https://metallb.universe.tf/) to `>= v0.13.5`.
4. Migrate from the deprecated NRP Controller to the new and improved [SLATE Federation Controller](https://github.com/slateci/federation-controller).
5. Update the SLATE Federation Controller role bindings.
6. Upgrade all K8s Ingress resources to `apiVersion:networking.k8s.io` (from `apiVersion:extensions/v1beta1`).
7. Upgrade the SLATE Ingress Controller containers to use the latest supported version.

## Upgrading the SLATE Kubernetes Cluster to `v1.24`

{% include alert/tip.html content="Plan your upgrades using `kubeadm upgrade plan`." %}
{% include alert/tip.html content="Upgrade one [Kubernetes minor release](https://kubernetes.io/releases/patch-releases/) at a time." %}
{% include alert/tip.html content="For each Kubernetes minor release, upgrade the control-plane followed by the worker nodes." %}

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24` using `kubeadm`.

## Updating the Calico CNI 

Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to `>= v3.24.1` using commands found in the [How to: Install Calico](https://projectcalico.docs.tigera.io/getting-started/kubernetes/self-managed-onprem/onpremises) documentation. For example:

```shell
CALICO_VERSION=3.24.1 && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/tigera-operator.yaml && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

## Updating MetalLB

Update [MetalLB](https://metallb.universe.tf/) to `>= v0.13.5`  using commands found in the [Installation By Manifest](https://metallb.universe.tf/installation/#installation-by-manifest) documentation. For example:

```shell
METALLB_VERSION=0.13.5 && \
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v${METALLB_VERSION}/config/manifests/metallb-native.yaml
```
{:data-add-copy-button='true'}

## Migrate to SLATE Federation Controller

Lorem ipsum delor alcot.

## Update SLATE Federation Controller Role Bindings

```shell
FEDERATION_VERSION=master
kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/${FEDERATION_VERSION}/resources/installation/federation-role.yaml
```
{:data-add-copy-button='true'}

## Update K8s Ingress Resources

See the [Kubernetes blog](https://kubernetes.io/blog/2021/07/14/upcoming-changes-in-kubernetes-1-22/#what-to-do) for instructions on migrating existing Ingress resources from `apiVersion:extensions/v1beta1` to `apiVersion:networking.k8s.io`.

## Updating the Upgrade the SLATE Ingress Controller