---
title: Initialize Kubernetes
overview: Initialize Kubernetes

order: 10

layout: docs2020
type: markdown
---

{% include alert/warning-k8s-version.html %}

Initialize your Kubernetes cluster with dual-stack enabled using `kubeadm` and a YAML configuration file.

## Choose Kubernetes Control-Plane Stack

The Kubernetes control-plane is not currently capable of dual-stack. Due to this limitation you will need to decide between IPv4 or IPv6 beforehand.

Begin by choosing sensible IPv4 and IPv6 values for `API_BIND_IP`, `CLUSTER_CIDR`, `CLUSTER_DNS`, `KUBLET_HEALTHZ_BIND_IP`, and `SERVICE_CLUSTER_IP_RANGE`.

{% include alert/note.html content="The chosen value for `CLUSTER_CIDR` will affect the `CALICO_IPV4POOL_CIDR` and `CALICO_IPV6POOL_CIDR` environmental variables in the Calico manifest file described later on this page." %}

### IPv4

```shell
API_BIND_IP=0.0.0.0
CLUSTER_CIDR=10.10.0.0/16,fc00:db8:1234:5678:8:2::/104
CLUSTER_DNS=10.20.0.10
KUBELET_HEALTHZ_BIND_IP=127.0.0.1
SERVICE_CLUSTER_IP_RANGE=10.20.0.0/16,fc00:db8:1234:5678:8:3::/112
```
{:data-add-copy-button='true'}

### IPv6

```shell
API_BIND_IP='"::"'
CLUSTER_CIDR=fc00:db8:1234:5678:8:2::/104,10.10.0.0/16
CLUSTER_DNS=fc00:db8:1234:5678:8:3:0:a
KUBELET_HEALTHZ_BIND_IP=::1
SERVICE_CLUSTER_IP_RANGE=fc00:db8:1234:5678:8:3::/112,10.20.0.0/16
```
{:data-add-copy-button='true'}

## Node IPs

Specify the IPv4 and IPv6 addresses for the Master Node. For example:

```shell
IPV4_ADDR=203.0.113.3
IPV6_ADDR=2001:db8:1234:5678::1
```
{:data-add-copy-button='true'}

## Generate Config File

Generate your `kubeadm` configuration file. Below are examples of an IPv4 and IPv6 control-plane respectively.

### IPv4

```shell
cat << EOF > /tmp/kubeadm-config.yml
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: ${IPV4_ADDR}
nodeRegistration:
  criSocket: /var/run/containerd/containerd.sock
  name: ${HOSTNAME}
  kubeletExtraArgs:
    cluster-dns: ${CLUSTER_DNS}
    node-ip: ${IPV4_ADDR},${IPV6_ADDR}
---
apiServer:
  extraArgs:
    advertise-address: ${IPV4_ADDR}
    bind-address: ${API_BIND_IP}
    etcd-servers: https://${IPV4_ADDR}:2379
    service-cluster-ip-range: ${SERVICE_CLUSTER_IP_RANGE}
apiVersion: kubeadm.k8s.io/v1beta2
controllerManager:
  extraArgs:
    allocate-node-cidrs: 'true'
    bind-address: ${API_BIND_IP}
    cluster-cidr: ${CLUSTER_CIDR}
    node-cidr-mask-size-ipv4: '24'
    node-cidr-mask-size-ipv6: '120'
    service-cluster-ip-range: ${SERVICE_CLUSTER_IP_RANGE}
etcd:
  local:
    dataDir: /var/lib/etcd
    extraArgs:
      advertise-client-urls: https://${IPV4_ADDR}:2379
      initial-advertise-peer-urls: https://${IPV4_ADDR}:2380
      initial-cluster: ${HOSTNAME}=https://${IPV4_ADDR}:2380
      listen-client-urls: https://${IPV4_ADDR}:2379
      listen-peer-urls: https://${IPV4_ADDR}:2380
kind: ClusterConfiguration
networking:
  serviceSubnet: ${SERVICE_CLUSTER_IP_RANGE}
scheduler:
  extraArgs:
    bind-address: ${API_BIND_IP}
---
apiVersion: kubelet.config.k8s.io/v1beta1
cgroupDriver: systemd
clusterDNS:
- ${CLUSTER_DNS}
healthzBindAddress: ${KUBELET_HEALTHZ_BIND_IP}
kind: KubeletConfiguration
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
clusterCIDR: ${CLUSTER_CIDR}
kind: KubeProxyConfiguration
ipvs:
  strictARP: true
mode: ipvs
---
EOF
```
{:data-add-copy-button='true'}

### IPv6

```shell
cat << EOF > /tmp/kubeadm-config.yml
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: ${IPV6_ADDR}
nodeRegistration:
  criSocket: /var/run/containerd/containerd.sock
  name: ${HOSTNAME}
  kubeletExtraArgs:
    cluster-dns: ${CLUSTER_DNS}
    node-ip: ${IPV6_ADDR},${IPV4_ADDR}
---
apiServer:
  extraArgs:
    advertise-address: ${IPV6_ADDR}
    bind-address: ${API_BIND_IP}
    etcd-servers: https://[${IPV6_ADDR}]:2379
    service-cluster-ip-range: ${SERVICE_CLUSTER_IP_RANGE}
apiVersion: kubeadm.k8s.io/v1beta2
controllerManager:
  extraArgs:
    allocate-node-cidrs: 'true'
    bind-address: ${API_BIND_IP}
    cluster-cidr: ${CLUSTER_CIDR}
    node-cidr-mask-size-ipv4: '24'
    node-cidr-mask-size-ipv6: '120'
    service-cluster-ip-range: ${SERVICE_CLUSTER_IP_RANGE}
etcd:
  local:
    dataDir: /var/lib/etcd
    extraArgs:
      advertise-client-urls: https://[${IPV6_ADDR}]:2379
      initial-advertise-peer-urls: https://[${IPV6_ADDR}]:2380
      initial-cluster: ${HOSTNAME}=https://[${IPV6_ADDR}]:2380
      listen-client-urls: https://[${IPV6_ADDR}]:2379
      listen-peer-urls: https://[${IPV6_ADDR}]:2380
kind: ClusterConfiguration
networking:
  serviceSubnet: ${SERVICE_CLUSTER_IP_RANGE}
scheduler:
  extraArgs:
    bind-address: ${API_BIND_IP}
---
apiVersion: kubelet.config.k8s.io/v1beta1
cgroupDriver: systemd
clusterDNS:
- ${CLUSTER_DNS}
healthzBindAddress: ${KUBELET_HEALTHZ_BIND_IP}
kind: KubeletConfiguration
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
clusterCIDR: ${CLUSTER_CIDR}
kind: KubeProxyConfiguration
ipvs:
  strictARP: true
mode: ipvs
---
EOF
```
{:data-add-copy-button='true'}

## Apply Configuration

Apply the `kubadm` configuration file to complete the initialization process:

```shell
kubeadm init --config=/tmp/kubeadm-config.yml
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/slate-master-node/apply-kubeconfig.html" %}