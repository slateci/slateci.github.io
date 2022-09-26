The foundation of every SLATE Cluster is a collection of SLATE nodes. In this guide, we will walk you through the process of setting up Kubernetes with the `kubeadm` tool and registering your cluster with the SLATE Platform. 

## Prerequisites

This guide assumes a freshly installed CentOS 7 system on either physical hardware or a virtual machine. All techniques should generalize to other suitably modern Linux systems, but specific commands can differ.

This guide also assumes that your Kubernetes head node (or control plane) is on a publicly accessible IP address with port `6443` open, in order for the SLATE API server to communicate with your cluster.

Finally, it is strongly recommended to have at least one additional publicly accessible IP address, not currently assigned to any specific machine. This is needed in order to install a Kubernetes load balancer, which will in turn allocate an address to an [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) which will provide convenient access to users' services.

{% include doc-next-link.html content="/docs/cluster/manual/slate-token.html" %}
