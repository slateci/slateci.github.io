---
title: SLATE Cluster Upgrade Guide - K8s v1.24
overview: Update SLATE clusters to K8s v1.24
published: true
permalink: blog/slate-cluster-upgrade-guide-1_24.html
attribution: The SLATE Team
layout: post
type: markdown
---

The team has been busy preparing SLATE for Kubernetes (K8s) `v1.24` and today we are happy to announce that this work is now live. As cluster administrators there are several upgrade tasks you must perform to continue using SLATE with this new version of K8s.

<!--end_excerpt-->

## Overview

This post will walk SLATE Kubernetes Cluster administrators through the following required tasks:

### Kubernetes Tasks

1. Upgrade your SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24` using `kubeadm`
2. Upgrade all `v1beta1` Ingress objects to `v1`
3. Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to `>= v3.24.1`
4. Update [MetalLB](https://metallb.universe.tf/) to `>= v0.13.5`

### SLATE Tasks

1. Upgrade the SLATE Federation Controller roles
2. Update the SLATE Federation Controller itself
3. Upgrade the SLATE Ingress Controller

## Kubernetes Tasks

### Upgrade to K8s `v1.24`

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24` using `kubeadm`.

{% include alert/tip.html content="Upgrade one [Kubernetes minor release](https://kubernetes.io/releases/patch-releases/) at a time." %}

### Update Ingress Objects

Support for `v1beta1` Ingress objects have been deprecated and completely removed by Kubernetes `v1.22`. Upgrade the Ingress objects on your `v1.24` SLATE Kubernetes cluster using the following:
* [Kubernetes API and Feature Removals In 1.22: Here’s What You Need To Know](https://kubernetes.io/blog/2021/07/14/upcoming-changes-in-kubernetes-1-22/#what-to-do)
* [Kubernetes — Upgrading Kubernetes Ingresses from v1beta1 to v1](https://awstip.com/upgrading-kubernetes-ingresses-from-v1beta1-to-v1-7f9235765332)

#### `v1` Ingress Object Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minimal-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx-example
  rules:
  - http:
      paths:
      - path: /testpath
        pathType: Prefix
        backend:
          service:
            name: test
            port:
              number: 80
```

See the [Kubernetes Ingress documentation](https://kubernetes.io/docs/concepts/services-networking/ingress) for more details.

### Update Calico CNI 

Update the [Calico CNI](https://projectcalico.docs.tigera.io/about/about-calico) to `>= v3.24.1` using the steps described in [How to: Install Calico](https://projectcalico.docs.tigera.io/getting-started/kubernetes/self-managed-onprem/onpremises). For example:

```shell
CALICO_VERSION=3.24.1 && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/tigera-operator.yaml && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

{% include alert/note.html content="If you changed the default IPv4 range during the initial installation, download, modify, and apply your own `custom-resources.yaml`." %}

### Update MetalLB

Update [MetalLB](https://metallb.universe.tf/) to `>= v0.13.5`  using the steps described in [Installation By Manifest](https://metallb.universe.tf/installation/#installation-by-manifest). For example:

```shell
METALLB_VERSION=0.13.5 && \
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v${METALLB_VERSION}/config/manifests/metallb-native.yaml
```
{:data-add-copy-button='true'}

## SLATE Tasks

### Update the SLATE Federation Controller Role

Update the role using the following command:

```shell
FEDERATION_CONTROLLER_VERSION=main && \
kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/${FEDERATION_CONTROLLER_VERSION}/resources/installation/federation-role.yaml
```
{:data-add-copy-button='true'}

Upon execution, `kubectl` should update the controller and output something similar to:

```shell
clusterrole.rbac.authorization.k8s.io/federation-cluster configured
clusterrole.rbac.authorization.k8s.io/federation-cluster-global unchanged
```

{% include alert/note.html content="If `kubectl` gives an error, contact [the SLATE team](mailto:slateci@googlegroups.com) for further assistance." %}

### Update the SLATE Federation Controller

Updating the federation controller is a two-step process.

1. The old `nrp-controller` deployment needs to be deleted by running:

   ```shell
   kubectl -n kube-system delete deployment nrp-controller .
   ```
   {:data-add-copy-button='true'}

2. The new controller deployment needs to be installed by running:

   ```shell
   FEDERATION_CONTROLLER_VERSION=main && \
   kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/${FEDERATION_CONTROLLER_VERSION}/resources/installation/upgrade-controller-debug.yaml
   ```
   {:data-add-copy-button='true'}

After running the second command, you should see a `federation-controller` pod in the `kube-system` namespace. Running the following command should display the logs:

```shell
kubectl logs -n kube-system <federation-controller-pod-name>
```
{:data-add-copy-button='true'}

{% include alert/note.html content="If `kubectl` gives an error, contact [the SLATE team](mailto:slateci@googlegroups.com) for further assistance." %}

### Update the SLATE Ingress Controller

Lorem ipsum delor alcot.
