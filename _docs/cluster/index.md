---
title: Cluster Installation
overview: 
index: true

order: 40 

layout: docs2020
type: markdown

---

## Welcome

The foundation of every SLATE Cluster is a collection of SLATE nodes. In this guide, we will walk you through the process of setting up Kubernetes with the `kubeadm` tool and register your cluster with the SLATE Platform.

## Prerequisites

This guide assumes the following:
1. A freshly installed CentOS 7 system on either physical hardware or a virtual machine. All techniques should generalize to other suitably modern Linux systems, but specific commands can differ.
2. Your Kubernetes head node (or control-plane) is on a publicly accessible IP address with port `6443` open (in order for the SLATE API server to communicate with your cluster).
3. **While not required** it is strongly recommended that at least one additional publicly accessible IP address not currently assigned to any specific machine be available. This is needed in order to install a Kubernetes load balancer that will in turn allocate an address to an [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) thus providing convenient access to users' services.

[Next Page »](/docs/cluster/manual/slate-token.html)