---
title: SLATE Master Node
overview: SLATE Master Node

order: 10  

layout: docs2020
type: markdown
---

{% include alert/warning-k8s-version.html %}

The first node you will add to your cluster will function as the SLATE Cluster Master Node as all possible SLATE topologies will utilize a Master Node. In this section we will install and configure Kubernetes using `kubeadm`.

## Initialize Kubernetes

Initialize your Kubernetes cluster with dual-stack enabled using `kubeadm` and a YAML configuration file.

### Choose Kubernetes Control-Plane Stack

The Kubernetes control-plane is not currently capable of dual-stack. Due to this limitation you will need to decide between IPv4 or IPv6 beforehand.

Begin by choosing sensible IPv4 and IPv6 values for `API_BIND_IP`, `CLUSTER_CIDR`, `CLUSTER_DNS`, `KUBLET_HEALTHZ_BIND_IP`, and `SERVICE_CLUSTER_IP_RANGE`.

{% include alert/note.html content="The chosen value for `CLUSTER_CIDR` will affect the `CALICO_IPV4POOL_CIDR` and `CALICO_IPV6POOL_CIDR` environmental variables in the Calico manifest file described later on this page." %}

#### IPv4

```shell
API_BIND_IP=0.0.0.0
CLUSTER_CIDR=10.10.0.0/16,fc00:db8:1234:5678:8:2::/104
CLUSTER_DNS=10.20.0.10
KUBELET_HEALTHZ_BIND_IP=127.0.0.1
SERVICE_CLUSTER_IP_RANGE=10.20.0.0/16,fc00:db8:1234:5678:8:3::/112
```
{:data-add-copy-button='true'}

#### IPv6

```shell
API_BIND_IP=::
CLUSTER_CIDR=fc00:db8:1234:5678:8:2::/104,10.10.0.0/16
CLUSTER_DNS=fc00:db8:1234:5678:8:3:0:a
KUBELET_HEALTHZ_BIND_IP=::1
SERVICE_CLUSTER_IP_RANGE=fc00:db8:1234:5678:8:3::/112,10.20.0.0/16
```
{:data-add-copy-button='true'}

### Node IPs

Specify the IPv4 and IPv6 addresses for the Master Node. For example:

```shell
IPV4_ADDR=192.168.0.3
IPV6_ADDR=2001:db8:1234:5678::1
```
{:data-add-copy-button='true'}

### Generate Config File

Generate your `kubeadm` configuration file. Below are examples of an IPv4 and IPv6 control-plane respectively.

#### IPv4

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

#### IPv6

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

### Apply Configuration

Apply the `kubadm` configuration file to complete the initialization process:

```shell
kubeadm init --config=/tmp/kubeadm-config.yml
```
{:data-add-copy-button='true'}

## KubeConfig

If you want to permanently enable `kubectl` access for the `root` account, you will need to copy the Kubernetes admin configuration kubeconfig to `$HOME/.kube/config`. 

```shell
mkdir -p /root/.kube && \
cp -i /etc/Kubernetes/admin.conf /root/.kube/config && \
chown root:root $HOME/.kube/config
```
{:data-add-copy-button='true'}

Alternatively to enable the kubeconfig for a single session execute the following:

```shell
export KUBECONFIG=/etc/Kubernetes/admin.conf
```
{:data-add-copy-button='true'}

## Allow Pods on Master

{% include alert/note.html content="This step is optional for multi-node installations of Kubernetes, but required for single-node installations." %}

If you are running a single-node SLATE cluster, you'll want to remove the `NoSchedule` taint from the Kubernetes control-plane. This will allow general workloads to run along-side of the Kubernetes master node processes.

In larger clusters, it may instead be desirable to prevent "user" workloads from running on the control-plane, especially on very busy clusters where the Kubernetes API is servicing a large number of requests. If you are running a large, multi-node cluster then you may want to skip this step.

To remove the `master` taint:
 
```shell
kubectl taint nodes --all node-role.Kubernetes.io/master-
```
{:data-add-copy-button='true'}

## Configure Pod Network

In order to enable Pods to communicate with the rest of the cluster, you will need to install a networking plugin. There are a large number of possible networking plugins for Kubernetes. SLATE clusters generally use [Calico](https://www.tigera.io/project-calico/), although other options should work as well. 

### Choose Manifest

Creating a dual-stack Kubernetes requires customizing the Calico manifests. Read through [Install Calico networking and network policy for on-premises deployments](https://projectcalico.docs.tigera.io/getting-started/Kubernetes/self-managed-onprem/onpremises) to familiarize yourself with the different manifest options.

For the sake of simplicity we will work through the [Install Calico with Kubernetes API datastore, 50 nodes or less](https://projectcalico.docs.tigera.io/getting-started/Kubernetes/self-managed-onprem/onpremises#install-calico-with-Kubernetes-api-datastore-50-nodes-or-less) option below.

### Configure Calico

1. Download the manifest.
   ```shell
   cd /tmp && \
   curl https://projectcalico.docs.tigera.io/manifests/calico.yaml -O 
   ```
   {:data-add-copy-button='true'}

2. Follow the steps described in [Calico: Enable dual stack](https://projectcalico.docs.tigera.io/networking/ipv6#enable-dual-stack) to configure `calico-config` and `calico-node`.

3. Replace the following in `calico-config`:
   * `"__Kubernetes_NODE_NAME__"`: the hostname of your master node (e.g. `node.domain.com`)
   * `__CNI_MTU__`: the maximum transmission unit (e.g. `1500`)
   * `"__KUBECONFIG_FILEPATH__"`: the path to the kubeconfig (e.g. `/etc/Kubernetes/admin.conf`)

4. Add/modify the following in `calico-node` where your values will be appropriate for `CLUSTER_CIDR`, `controllerManager.extraArgs.node-cidr-mask-size-ipv4`, and `controllerManager.extraArgs.node-cidr-mask-size-ipv6` from earlier on this page.
   
   ```shell
   - name: CALICO_IPV4POOL_CIDR
     value: "10.10.0.0/16"
   - name: CALICO_IPV4POOL_BLOCK_SIZE
     value: "24"
   - name: CALICO_IPV6POOL_CIDR
     value: "fc00:db8:1234:5678:8:2::/104"
   - name: CALICO_IPV6POOL_BLOCK_SIZE
     value: "120"
   ```
   {:data-add-copy-button='true'}

5. If multiple interfaces exist on a node it may become necessary to tell Calico which interface to use for IPv4 and IPv6. In the following example Calico will use `eth1`:

   ```shell
   - name: IP_AUTODETECTION_METHOD
     value: "interface=eth1"
   - name: IP6_AUTODETECTION_METHOD
     value: "interface=eth1"
   ```
   {:data-add-copy-button='true'}

6. Install Calico by applying the modified manifest file:

   ```shell
   kubectl apply -f /tmp/calico.yml
   ```
   {:data-add-copy-button='true'}

### Calico CLI

**While optional**, we recommend installing `calicoctl`, the command line tool for Calico, for administrative needs.

1. Follow the steps described in [Install calicoctl as a Kubernetes pod](https://projectcalico.docs.tigera.io/maintenance/clis/calicoctl/install#install-calicoctl-as-a-Kubernetes-pod) for the Kubernetes API datastore.

2. Add the suggested alias for `calicoctl`:

   ```shell
   alias calicoctl="kubectl exec -i -n kube-system calicoctl -- /calicoctl"
   ```
   {:data-add-copy-button='true'}

## Load Balancing

Kubernetes clusters, in order to evenly distribute work across all worker nodes, require a load balancer. There are a few load balancer solutions. We recommend using [MetalLB](https://metallb.universe.tf/) for load balancing on SLATE clusters.

### MetalLB

1. Apply MetalLB to the cluster. This command will create the relevant Kubernetes components that will run our load balancer.

   ```shell
   kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.11.0/manifests/namespace.yaml
   kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.11.0/manifests/metallb.yaml
   ```
   {:data-add-copy-button='true'}

2. Gather pools of public IPv4 and/or IPv6 addresses other than those assigned to the node (pools may be provided by cloud providers as floating IP addresses).

   Examples:
   * IPv4: `123.101.6.42-123.101.16.64`
   * IPv6: `2001:DB8:414:10::56:3-2001:DB8:414:10::56:6`

3. Create the MetalLB configuration and adjust the IP range(s) to reflect your environment. Below is an example of a single pool with a single IPv4 range.

   ```
   cat <<EOF > /tmp/metallb-config.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     namespace: metallb-system
     name: config
   data:
     config: |
       address-pools:
       - name: default
         protocol: layer2
         addresses:
         - 123.101.6.42-123.101.16.64
   EOF
   ```
   {:data-add-copy-button='true'}

4. Verify that `kubeproxy` is configured for `ipvs` mode with `strictARP: true` (already set in the `kubeadm init` configuration templates above).

5. Apply the configuration for MetalLB:

   ```shell
   kubectl apply -f /tmp/metallb-config.yaml
   ```
   {:data-add-copy-button='true'}

To read more about MetalLB installation and configuration, visit their [installation instructions](https://metallb.universe.tf/installation/).

### MetalLB on OpenStack

If your Kubernetes cluster is installed on one or more virtual machines run by OpenStack, there is one small, extra step required to enable MetalLB to route traffic properly. 

See [the MetalLB documentation](https://metallb.universe.tf/faq/#is-metallb-working-on-openstack) for details; in short, OpenStack must be informed that traffic sent to IP addresses controlled by MetalLB has a valid reason to be going to the VMs which make up the Kubernetes cluster. 

{% include doc-next-link.html content="/docs/cluster/manual/slate-worker-node.html" %}
