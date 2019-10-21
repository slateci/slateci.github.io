# Creating a SLATE Cluster

The foundation of every SLATE Cluster are a collection of SLATE nodes. Nodes can have a number of different functions, but the two largest roles of a SLATE node are Master and Worker.

In addition to a number of different roles for a SLATE node, you can also create a node on either a CentOS virtual machine or physical hardware.

## Operating System Requirements

SLATE currently requires [CentOS 7](http://isoredirect.centos.org/centos/7/isos/x86_64/) as the base operating system for new clusters. In order to reliably run Kubernetes and connect to the SLATE federation, a few changes are needed to the base CentOS install. The following prerequisite steps will need to be applied to all SLATE nodes in your cluster. 

### Disable SELinux
First, you will need to disable SELinux as this generally conflicts with Kubernetes:

```
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
```

If you wish to retain the SELinux logging, you can alternatively use 'permissive' mode rather than enforcing.

### Disable swap
Swap must be disabled for Kubernetes to run effectively. Swap is typically enabled in a default CentOS installation where automatic partitioning has been selected. To disable swap:

```
swapoff -a
sed -e '/swap/s/^/#/g' -i /etc/fstab
```

### Disable firewalld
In order to properly communicate with other devices within the cluster, `firewalld` must be disabled:

```
systemctl disable --now firewalld
```

### Disable root login over SSH
While optional, we *strongly* reccomended disabling root login over SSH for security reasons.

```
sed -i --follow-symlinks 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
```

### Use iptables for Bridged Network Traffic
Ensure that bridged network traffic goes through iptables.

```
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
```

## Installing Docker and Kubernetes

The SLATE platform uses Kubernetes as its container orchestration system, and Docker as the container run-time. In this section we'll setup Docker and install the base Kubernetes software components.

### Docker

We recommend using the Docker Community Edition runtime with Kubernetes and SLATE. It can be installed and activated like so: 

```
# Add Docker stable repo to Yum
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install the latest version of DockerCE and containerd 
yum install docker-ce docker-ce-cli containerd.io -y

# Enable Docker on reboot through systemctl
systemctl enable --now docker
```

### Kubernetes

The Kubernetes repository can be added to the node in the usual way:

```
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
```

The Kubernetes install includes a few different pieces: `kubeadm`, `kubectl`, and `kubelet`. `kubeadm` is a tool used to bootstrap Kubernetes clusters, `kubectl` is the command-line tool needed to interact with and control the cluster, and `kubelet` is the system daemon that allows the Kubernetes api to control the cluster nodes. To install and enable these components:

```
# Install the three necessary Kubernetes components
yum install -y kubeadm kubectl kubelet --disableexcludes=kubernetes

# Enable Kubelet through systemctl.
systemctl enable --now kubelet
```

At this point the kubelet will be crash-looping as it has no configuration. That is okay for now.

## SLATE Master Node

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
export KUBECONFIG=/etc/kubernets/admin.conf
```

### Pod Network

In order to enable Pods to communicate with the rest of the cluster, you will need to install a networking plugin. There are a large number of possible networking plugins for Kubernetes. SLATE clusters generally use Calico, although other options  should work as well. 

#### Calico

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

### (optional) Allowing user pods to run on the Master
If you are running a single-node SLATE cluster, you'll want to remove the "NoSchedule" taint from the Master. This will allow general workloads to run along side of the Kubernetes master node processes. In the case of a dedicated Master and dedicated Workers, please skip to the next section.

To remove the master taint:
 
```
kubectl taint nodes --all node-role.kubernetes.io/master-
```

## SLATE Worker Node

To distribute work assigned to a SLATE cluster, worker nodes can be networked to a SLATE Master node.

All SLATE Worker nodes should be set up using the "Setting Up a SLATE Node" instructions above.

### KubeADM Join

On your Master node, run the following command to get a full join command for the Master's cluster:

```
kubeadm create token --print-join-command
```

Run this generated join command on the worker node to join it to the cluster.

## Cluster Federation

At this point, you should have a SLATE-Ready Kubernetes cluster. You will now be able to join your cluster to the SLATE Federation.

### SLATE CLI

The SLATE Command Line Interface will let you to execute SLATE commands.

On the Master node for your cluster, follow the [SLATE CLI](#) installation instructions.

### Joining the Federation

On the Master node for your cluster, execute

```
slate cluster create [NEW-CLUSTER-NAME] --group [YOUR-GROUP-NAME] --org [YOUR-ORG-NAME] -y
```

### Update Cluster Location

All SLATE clusters should have their geographic locations listed in the cluster's attributes.

```
slate cluster update [YOUR-CLUSTER-NAME] --location [LATITUDE], [LONGITUDE]
```

### Allow Group Access

Cluster administrators can allow certain groups access to their 

```
slate cluster allow-group [YOUR-CLUSTER-NAME] '[GROUP-NAME]'
```

## Troubleshooting

At this point, you should have a functioning and federated SLATE cluster. If you have any questions on this process, please [contact our team](#) for assistance.
