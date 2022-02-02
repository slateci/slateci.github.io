---
title: SLATE Worker Node
overview: SLATE Worker Node

order: 10  

layout: docs2020
type: markdown
---

To distribute work assigned to a SLATE cluster, Worker Nodes can be networked to a SLATE Master Node.

## Requirements

Prepare the Worker Node by following the steps described in:
1. [Operating System Requirements](/docs/cluster/manual/operating-system-requirements.html)
2. [Install Containerd](/docs/cluster/manual/containerd.html)
3. [Install Kubernetes](/docs/cluster/manual/kubernetes.html)

## Gather Cluster Information

SSH into your SLATE Master Node and gather the following information using the output from the commands described below:

### Kubernetes Token

```shell
kubeadm token create
```
{:data-add-copy-button='true'}

### Kubernetes Discovery Certificate Hash

```shell
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
```
{:data-add-copy-button='true'}

## Define Variables

SSH into your SLATE Worker Node and define the following variables:

1. The token and certificate hash from the steps above:

   ```shell
   K8_TOKEN=<value>
   K8_DISCO_CERT=<value>
   ```
   {:data-add-copy-button='true'}

2. IP addresses for both nodes. For example:

   ```shell
   # master node
   MASTER_IPV4_ADDR=203.0.113.3               # required if the control-plane is IPv4
   MASTER_IPV6_ADDR=2001:db8:1234:5678::1     # required if the control-plane is IPv6
   # worker node
   WORKER_IPV4_ADDR=203.0.113.4
   WORKER_IPV6_ADDR=2001:db8:1234:5678::2
   ```
   {:data-add-copy-button='true'}

## Build Kubeadm Join

Build the `kubeadm join` configuration file on the Worker node. This file has several forms depending on whether the Kubernetes control-plane is IPv4 or IPv6.

### IPv4

```shell
cat <<EOF > /tmp/join-config.yml
apiVersion: kubeadm.k8s.io/v1beta2
kind: JoinConfiguration
discovery:
  bootstrapToken:
    apiServerEndpoint: "${MASTER_IPV4_ADDR}:6443"
    token: "${K8_TOKEN}"
    caCertHashes:
    - "sha256:${K8_DISCO_CERT}"
nodeRegistration:
  criSocket: /var/run/containerd/containerd.sock
  name: ${HOSTNAME}
  kubeletExtraArgs:
    node-ip: ${WORKER_IPV4_ADDR},${WORKER_IPV6_ADDR}
EOF
```
{:data-add-copy-button='true'}

### IPv6

```shell
cat <<EOF > /tmp/join-config.yml
apiVersion: kubeadm.k8s.io/v1beta2
kind: JoinConfiguration
discovery:
  bootstrapToken:
    apiServerEndpoint: "[${MASTER_IPV6_ADDR}]:6443"
    token: "${K8_TOKEN}"
    caCertHashes:
    - "sha256:${K8_DISCO_CERT}"
nodeRegistration:
  criSocket: /var/run/containerd/containerd.sock
  name: ${HOSTNAME}
  kubeletExtraArgs:
    node-ip: ${WORKER_IPV6_ADDR},${WORKER_IPV4_ADDR}
EOF
```
{:data-add-copy-button='true'}

## Join the Cluster

Run the following join command on the Worker Node to join it to the cluster.

```shell
kubeadm join --config="/tmp/join-config.yml"
```

{% include doc-next-link.html content="/docs/cluster/manual/cluster-federation.html" %}