---
title: SLATE Master Node
overview: SLATE Master Node

order: 10  

layout: docs2020
type: markdown
---

{% include alert/warning-k8s-version.html %}

The first node you will add to your cluster will function as the SLATE Cluster Master Node as all possible SLATE topologies will utilize a master node. To configure a SLATE Master Node you must first go through the [Operating System Requirements](/docs/cluster/manual/operating-system-requirements.html). 

### Initialize the Kubernetes cluster with Kubeadm

We want to initialize our cluster with dual-stack. Start by choosing sensible IPv4 and IPv6 values for the cluster CIDR, DNS and service cluster IP range. For example:

```shell
CLUSTER_CIDR=10.10.0.0/16,fc00:db8:1234:5678:8:2::/104
CLUSTER_DNS=10.20.0.10
SERVICE_CLUSTER_IP_RANGE=10.20.0.0/16,fc00:db8:1234:5678:8:3::/112
```

Make note of `CLUSTER_CIDR` as the values specified there will affect the `CALICO_IPV4POOL_CIDR` and `CALICO_IPV6POOL_CIDR` environmental variables in the Calico manifest file.

Specify the IPv4 and IPv6 addresses for the node. For example:

```shell
IPV4_ADDR=192.168.0.3
IPV6_ADDR=2001:db8:1234:5678::1
```

Execute the following to generate the `kubeadm` configuration file:

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
    bind-address: '0.0.0.0'
    etcd-servers: https://${IPV4_ADDR}:2379
    service-cluster-ip-range: ${SERVICE_CLUSTER_IP_RANGE}
apiVersion: kubeadm.k8s.io/v1beta2
controllerManager:
  extraArgs:
    allocate-node-cidrs: 'true'
    bind-address: '0.0.0.0'
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
    bind-address: '0.0.0.0'
---
apiVersion: kubelet.config.k8s.io/v1beta1
cgroupDriver: systemd
clusterDNS:
- ${CLUSTER_DNS}
healthzBindAddress: 127.0.0.1
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

Complete the initialization process:

```shell
kubeadm init --config=/tmp/kubeadm-config.yml
```

## KubeConfig

If you want to permanently enable `kubectl` access for the `root` account, you will need to copy the kubernetes admin configuration (KUBECONFIG) to `$HOME/.kube/config`. 

```shell
mkdir -p /root/.kube && \
cp -i /etc/kubernetes/admin.conf /root/.kube/config && \
chown root:root $HOME/.kube/config
```

To enable kubeconfig for a single session instead simply run:

```shell
export KUBECONFIG=/etc/kubernetes/admin.conf
```

## Allow Pods on Master

{% include alert/note.html content="This step is optional for multi-node installations of Kubernetes, but required for single-node installations." %}

If you are running a single-node SLATE cluster, you'll want to remove the "NoSchedule" taint from the Kubernetes control plane. This will allow general workloads to run along-side of the Kubernetes master node processes. In larger clusters, it may instead be desirable to prevent "user" workloads from running on the control plane, especially on very busy clusters where the K8S API is servicing a large number of requests. If you are running a large, multi-node cluster then you may want to skip this step.

To remove the master taint:
 
```shell
kubectl taint nodes --all node-role.kubernetes.io/master-
```

## Configure Pod Network

In order to enable Pods to communicate with the rest of the cluster, you will need to install a networking plugin. There are a large number of possible networking plugins for Kubernetes. SLATE clusters generally use Calico, although other options  should work as well. 

```shell
HOSTNAME=master.hostname
KUBECONFIG_PATH=/etc/kubernetes/admin.conf
```











To install Calico, you will simply need to apply the appropriate Kubernetes manifests:

```
kubectl create -f https://docs.projectcalico.org/manifests/tigera-operator.yaml
kubectl create -f https://docs.projectcalico.org/manifests/custom-resources.yaml
```

After approximately five minutes, your master node should be ready. You can check with `kubectl get nodes`:

```
[root@your-node ~]# kubectl get nodes
NAME                           STATUS   ROLES                  AGE     VERSION
your-node.your-domain.edu   Ready    control-plane,master   2m50s   v1.21.2
```

### Load Balancer

Kubernetes clusters, in order to evenly distribute work across all worker nodes, require a load balancer. There are a few load balancer solutions. We recommend using MetalLB for load balancing on SLATE clusters.

### MetalLB

Apply MetalLB to our cluster. This command will create the relevant kubernetes componenents that will run our load balancer.

```
kubectl create -f https://raw.githubusercontent.com/metallb/metallb/v0.11.0/manifests/namespace.yaml
kubectl create -f https://raw.githubusercontent.com/metallb/metallb/v0.11.0/manifests/metallb.yaml
```

Create the MetalLB configuration and adjust the IP range to reflect your environment. These must be unallocated public IP addresses available to the machine.

```
cat <<EOF > metallb-config.yaml
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
      - 155.101.6.XXX-155.101.6.YYY # Replace this range with whatever IP range your worker nodes may exist in
EOF
```

Finally, create the ConfigMap for MetalLB on your cluster.

```
kubectl apply -f metallb-config.yaml
```

To read more about MetalLB installation and configuration, visit their [installation instructions](https://metallb.universe.tf/installation/).

#### MetalLB on OpenStack

If your Kubernetes cluster is installed on one or more virtual machines run by OpenStack, there is one small, extra step required to enable MetalLB to route traffic properly. 

See [the MetalLB documentation](https://metallb.universe.tf/faq/#is-metallb-working-on-openstack) for details; in short, OpenStack must be informed that traffic sent to IP addresses controlled by MetalLB has a valid reason to be going to the VMs which make up the Kubernetes cluster. 


<a href="/docs/cluster/manual/slate-worker-node.html">Next Page</a>
