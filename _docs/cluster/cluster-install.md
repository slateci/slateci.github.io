# Creating a SLATE Cluster

## Setting up a SLATE Node

The foundation of every SLATE Cluster are a collection of SLATE nodes. Nodes can have a number of different functions, but the two largest roles of a SLATE node are Master and Worker.

In addition to a number of different roles for a SLATE node, you can also create a node on either a CentOS virtual machine or physical hardware.

### Operating System

SLATE currently requires a CentOS 7 install. There are many ways to provide boot media to your server. You may choose to use iPXE, physical USB drive, physical DVD drive, or another method. 

### OS Tweaks

There are a few tweaks necessary before CentOS 7 can reliably run Kubernetes and connect to other SLATE nodes and the wider SLATE federation.

#### Disable SELinux
Disable SELinux as this generally causes conflicts with Kubernetes.

```
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
```

#### Disable Swap Memory
Swap must be disabled for Kubernetes to run effectively. If you automatically partitioned your drive swap will be enabled. To disable it run:

```
swapoff -a
sed -e '/swap/s/^/#/g' -i /etc/fstab
```

#### Disable FirewallD
In order to properly communicate with other devices within the cluster, firewalld must be disabled.

```
systemctl disable --now firewalld
```

#### Disable Root Login over SSH
While optional, we *strongly* reccomended disabling root login over SSH for security reasons.

```
sed -i --follow-symlinks 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
```

#### Use IPTables for Bridged Network Traffic
Ensure that bridged network traffic goes through iptables.

```
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
```

### Software

SLATE requires a few different software pieces in order to run properly.

#### Prerequisite Tools
In order to properly install future softwares, we use yum-utils to configure yum and device-mapper-persistent-data with lvm2 to configure the devicemapper storage driver.

```
yum install -y yum-utils device-mapper-persistent-data lvm2
```

#### Docker

Because SLATE runs containerized applications, Docker is used as a containerization solution.

```
# Add Docker stable repo to Yum
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install the latest version of DockerCE and containerd 
yum install docker-ce docker-ce-cli containerd.io -y

# Enable Docker on reboot through systemctl
systemctl enable --now docker
```

#### Kubernetes

Add the Kubernetes repository to yum.

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

The Kubernetes install includes a few different pieces: kubeadm, kubectl, and kubelet. kubeadm is a tool used to bootstrap kubernetes clusters, kubectl is the command line tool needed to interact with and control the cluster, and kubelet is the system daemon that allows the kubernetes api to control the cluster nodes

```
# Install the three necessary Kubenetes components
yum install -y kubeadm kubectl kubelet --disableexcludes=kubernetes

# Enable Kubelet through systemctl.
systemctl enable --now kubelet
```

## SLATE Master Node

The first node you will add to your cluster will function as the SLATE Cluster Master Node. All possible SLATE topologies will utilize a master node.

To configure a SLATE Master Node, you must first go through the "Setting up a SLATE Node" instructions listed above.

### KubeADM Init

We want to initialize our cluster with the pod network CIDR specifically set to 192.168.0.0/16 this is the default range for Calico which will be our pod network. It is possible to set a different RFC1918 range during `kubeadm init` and configure Calico to use that range if needed.

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
export $KUBECONFIG=/etc/kubernets/admin.conf
```

### Pod Network

In many cases, the master node will be managing a set of Kubernetes Pods. These pods must be networked to the master.

We recommend using Calico for pod networking.

#### Calico

Calico is one solution that clusters can use for pod networking.

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

#### MetalLB


Apply Metallb to our cluster. This command will create the relevant kubernetes componenents that will run our load balancer.

```
kubectl apply -f https://raw.githubusercontent.com/google/metallb/v0.8.1/manifests/metallb.yaml
```

Create the metallb configuration and adjust the IP range to relect your environment. These must be unallocated public IP addresses available to the machine.

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

Finally, create the configmap for MetalLB on your cluster.

```
kubectl apply -f metallb-config.yaml
```

To read more about MetalLB installation and configuration, visit their [installation instructions](https://metallb.universe.tf/installation/).

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
