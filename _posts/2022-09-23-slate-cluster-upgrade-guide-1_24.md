---
title: SLATE Cluster Upgrade Guide - K8s v1.24
overview: Update SLATE clusters to K8s v1.24
published: true
permalink: blog/slate-cluster-upgrade-guide-1_24.html
attribution: The SLATE Team
layout: post
type: markdown
---

The SLATE team has been busy preparing SLATE for Kubernetes `v1.24`. Today we are happy to announce that this work is now live. As cluster administrators there are several upgrade tasks you must perform to continue using SLATE with this new version of Kubernetes.

<!--end_excerpt-->

## Overview

This post will walk SLATE Kubernetes Cluster administrators through the following:

### Upgrading Kubernetes

1. Upgrading the SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24` using `kubeadm`.
2. Upgrade all K8s Ingress resources to `apiVersion: networking.k8s.io`.
3. Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to `>= v3.24.1`.
4. Update [MetalLB](https://metallb.universe.tf/) to `>= v0.13.5`.

### Upgrading SLATE

1. Update the SLATE Federation Controller role bindings.
2. Migrate from the deprecated NRP Controller to the new and improved [SLATE Federation Controller](https://github.com/slateci/federation-controller).
3. Upgrade the SLATE Ingress Controller containers to use the latest supported version.

## Upgrading Kubernetes

### Upgrading to `v1.24`

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24` using `kubeadm`.

{% include alert/tip.html content="Plan your upgrades using `kubeadm upgrade plan`." %}
{% include alert/tip.html content="Upgrade one [Kubernetes minor release](https://kubernetes.io/releases/patch-releases/) at a time." %}
{% include alert/tip.html content="For each Kubernetes minor release, upgrade the control-plane followed by the worker nodes." %}

### Updating Ingress Resource `apiVersion`s

See the [Kubernetes blog](https://kubernetes.io/blog/2021/07/14/upcoming-changes-in-kubernetes-1-22/#what-to-do) for instructions on migrating existing Ingress resources from:

```yaml
apiVersion: extensions/v1beta1
```

to:

```yaml
apiVersion: networking.k8s.io
```

### Updating to the latest Calico CNI 

Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to `>= v3.24.1` using commands found in the [How to: Install Calico](https://projectcalico.docs.tigera.io/getting-started/kubernetes/self-managed-onprem/onpremises) documentation. For example:

```shell
CALICO_VERSION=3.24.1 && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/tigera-operator.yaml && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

{% include alert/note.html content="If you changed the default IPv4 range during the initial installation, download, modify, and apply your own `custom-resources.yaml`." %}

### Updating to the latest MetalLB

Update [MetalLB](https://metallb.universe.tf/) to `>= v0.13.5`  using commands found in the [Installation By Manifest](https://metallb.universe.tf/installation/#installation-by-manifest) documentation. For example:

```shell
METALLB_VERSION=0.13.5 && \
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v${METALLB_VERSION}/config/manifests/metallb-native.yaml
```
{:data-add-copy-button='true'}

## Upgrading SLATE

### Migrate to SLATE Federation Controller

Lorem ipsum delor alcot.

### Update SLATE Federation Controller Role Bindings

```shell
FEDERATION_VERSION=master
kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/${FEDERATION_VERSION}/resources/installation/federation-role.yaml
```
{:data-add-copy-button='true'}



### Updating the Upgrade the SLATE Ingress Controller