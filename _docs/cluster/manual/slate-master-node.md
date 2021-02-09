---
title: SLATE Master Node
overview: SLATE Master Node

order: 10  

layout: docs2020
type: markdown
---

The first node you will add to your cluster will function as the SLATE Cluster Master Node. All possible SLATE topologies will utilize a master node.

To configure a SLATE Master Node, you must first go through the "Operating System Requirements" section above. 

### Initialize the Kubernetes cluster with Kubeadm

We want to initialize our cluster with the pod network CIDR specifically set to 192.168.0.0/16 as this is the default range utilized by the Calico network plugin. If needed, it is possible to set a different RFC1918 range during `kubeadm init` and configure Calico to use that range. 

```
kubeadm init --pod-network-cidr=192.168.0.0/16
```

### KubeConfig

If you want to permenantly enable kubectl access for the root account you will need to copy the kubernetes admin configuration (KUBECONFIG) to $HOME/.kube/config. 

```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

To enable kubeconfig for a single session instead simply run:

```
export KUBECONFIG=/etc/kubernetes/admin.conf
```

### Pod Network

In order to enable Pods to communicate with the rest of the cluster, you will need to install a networking plugin. There are a large number of possible networking plugins for Kubernetes. SLATE clusters generally use Calico, although other options  should work as well. 

To install Calico, you will simply need to apply the appropriate Kubernetes manifest:

```
kubectl apply -f https://docs.projectcalico.org/v3.8/manifests/calico.yaml
```

After approximately five minutes, your master node should be ready. You can check with `kubectl get nodes`:

```
[root@your-node ~]# kubectl get nodes

NAME                        STATUS  ROLES   AGE     VERSION
your-node.your-domain.edu   Ready   master  24m     v1.16.1
```

### Load Balancer

Kubernetes clusters, in order to evenly distribute work across all worker nodes, require a load balancer. There are a few load balancer solutions. We recommend using MetalLB for load balancing on SLATE clusters.

### MetalLB

Apply MetalLB to our cluster. This command will create the relevant kubernetes componenents that will run our load balancer.

```
kubectl apply -f https://raw.githubusercontent.com/google/metallb/v0.8.1/manifests/metallb.yaml
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


### (optional) Allowing user pods to run on the Master
If you are running a single-node SLATE cluster, you'll want to remove the "NoSchedule" taint from the Master. This will allow general workloads to run along side of the Kubernetes master node processes. In the case of a dedicated Master and dedicated Workers, please skip to the next section.

To remove the master taint:
 
```
kubectl taint nodes --all node-role.kubernetes.io/master-
```

<a href="/docs/cluster/manual/slate-worker-node.html">Next Page</a>
