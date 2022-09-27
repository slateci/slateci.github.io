---
title: SLATE Master Node
overview: SLATE Master Node

order: 10  

layout: docs2020
type: markdown
---

{% include alert/note.html content="SLATE currently supports Kubernetes v1.24." %}

The first node you will add to your cluster will function as the SLATE Cluster master node.
* All possible SLATE topologies will utilize a master node.
* To configure a SLATE master node, you must first go through the previous pages in [Manual Cluster Installation](/docs/cluster/index.html).

## Initialize the Kubernetes cluster with Kubeadm

We want to initialize our cluster with the pod network CIDR specifically set to `192.168.0.0/16` as this is the default range utilized by the Calico network plugin. If needed, it is possible to set a different [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) range during `kubeadm init` and configure Calico to use that range. Instructions for configuring Calico for a different IP range is noted below in [Pod Network](#pod-network).  

```shell
kubeadm init --pod-network-cidr=192.168.0.0/16
```
{:data-add-copy-button='true'}

## KubeConfig

If you want to permanently enable `kubectl` access for the `root` account, you will need to copy the Kubernetes admin configuration to your home directory as shown below. 

```shell
mkdir -p $HOME/.kube && \
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && \
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
{:data-add-copy-button='true'}

To instead set `KUBECONFIG` for a single session simply run:

```shell
export KUBECONFIG=/etc/kubernetes/admin.conf
```
{:data-add-copy-button='true'}

## Allowing pods to run on the Master

{% include alert/note.html content="This step is optional for multi-node installations of Kubernetes and required for single-node installations." %}

If you are running a single-node SLATE cluster, you'll want to remove the `NoSchedule` taint from the Kubernetes control plane. This will allow general workloads to run along-side of the Kubernetes master node processes. In larger clusters, it may instead be desirable to prevent "user" workloads from running on the control plane, especially on very busy clusters where the K8s API is servicing a large number of requests. If you are running a large, multi-node cluster then you may want to skip this step.

To remove the master taint:
 
```shell
kubectl taint nodes --all node-role.kubernetes.io/control-plane:NoSchedule-
```
{:data-add-copy-button='true'}

## Pod Network

In order to enable Pods to communicate with the rest of the cluster, you will need to install a networking plugin. There are a large number of possible networking plugins for Kubernetes. SLATE clusters generally use Calico, although other options  should work as well.

To install Calico, you will simply need to apply the appropriate Kubernetes manifests beginning with the operator:

```shell
kubectl create -f https://docs.projectcalico.org/manifests/tigera-operator.yaml
```
{:data-add-copy-button='true'}

If you haven't changed the default IP range then create the boilerplate custom resources manifest:

```shell
kubectl create -f https://docs.projectcalico.org/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

If you have changed the IP range to anything other than `192.168.0.0/16` in the `kubeadm init` command above, you will need to first download the boilerplate [custom-resources.yaml](https://docs.projectcalico.org/manifests/custom-resources.yaml) file from the Calico website then update its IP range under `spec/calicoNetwork/ipPools/blockSize` and `CIDR`. Finally, create the custom resources manifest:

```shell
kubectl create -f /path/to/custom-resources.yaml
```
{:data-add-copy-button='true'}

After approximately five minutes, your master node should be ready. You can check with `kubectl get nodes`:

```shell
[root@your-node ~]# kubectl get nodes
NAME                           STATUS   ROLES                  AGE     VERSION
your-node.your-domain.edu   Ready    control-plane,master   2m50s   v1.24.0
```
{:data-add-copy-button='true'}

## Load Balancer

Kubernetes clusters, in order to evenly distribute work across all worker nodes, require a load balancer. There are a few load balancer solutions. We recommend using MetalLB for load balancing on SLATE clusters.

### MetalLB

See MetalLB's [installation instructions](https://metallb.universe.tf/installation/) for steps and commands.

#### MetalLB on OpenStack

If your Kubernetes cluster is installed on one or more virtual machines run by OpenStack, there is one small, extra step required to enable MetalLB to route traffic properly. 

See [the MetalLB documentation](https://metallb.universe.tf/faq/#is-metallb-working-on-openstack) for details; in short, OpenStack must be informed that traffic sent to IP addresses controlled by MetalLB has a valid reason to be going to the VMs which make up the Kubernetes cluster. 

{% include doc-next-link.html content="/docs/cluster/manual/slate-worker-node.html" %}
