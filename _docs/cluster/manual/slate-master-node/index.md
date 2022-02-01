---
title: SLATE Master Node
overview: SLATE Master Node
index: true

order: 10  

layout: docs2020
type: markdown
---

{% include alert/warning-k8s-version.html %}

The first node you will add to your cluster will function as the SLATE Cluster Master Node as all possible SLATE topologies will utilize a Master Node. In this section we will install and configure Kubernetes using `kubeadm`, set up the Pod Network using Calico, and apply MetalLB as a Layer 2 load balancer.

* [Initialize Kubernetes](/docs/cluster/manual/slate-master-node/initialize-kubernetes.html)
* [Apply KubeConfig](/docs/cluster/manual/slate-master-node/apply-kubeconfig.html)
* [Allow Pods on Master](/docs/cluster/manual/slate-master-node/allow-pods-master.html)
* [Configure Pod Network with Calico](/docs/cluster/manual/slate-master-node/configure-pod-network.html)
* [Validate Dual-stack](/docs/cluster/manual/slate-master-node/validate-dual-stack.html)
* [Load Balancing with MetalLB](/docs/cluster/manual/slate-master-node/load-balancing.html)

