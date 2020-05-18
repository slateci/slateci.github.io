The foundation of every SLATE Cluster is a collection of SLATE nodes. Nodes can have a number of different functions, but the two largest roles of a SLATE node are Master and Worker.

A SLATE node can be created on either a virtual machine or physical hardware.

## Prerequisites

This guide assumes a freshly installed CentOS 7 system. All techniques should generalize to other suitably modern Linux systems, but specific commands can differ.

This guide also assumes that your Kubernetes head node (or control plane) is on a publicly accessible IP address with port 6443 open, in order for the SLATE API server to communicate with your cluster.

Finally, it is strongly recommended to have at least one additional publicly accessible IP address, not currently assigned to any specific machine. This is needed in order to install a Kubernetes load balancer, which will in turn allocate an address to an [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) which will provide convenient access to users' services.

## Obtain a SLATE token

If you have not done so already, go to [the SLATE portal](https://portal.slateci.io/) and create an account.

Every cluster must be administered by a SLATE group.
If there is already a group which should be responsible for this cluster, and you are not a member, you should request to join it.
You can also create a new group to administer your cluster (go to [the 'My Groups' page](https://portal.slateci.io/groups) and click 'Register New Group').
When you create a group you are automatically its first member.
If you create a new group whose primary purpose will be to administer this cluster (and possibly others) you should select 'Resource Provider' as the field of science for it.

A group can administer multiple clusters, so if you are already a member of a suitable group you do not need to create another.
A group can also administer both clusters and applications, which may run both on clusters which it administers and on clusters which it does not.

Install a copy of the SLATE CLI client on the machine which you are setting up:

        curl -LO https://jenkins.slateci.io/artifacts/client/slate-linux.tar.gz
        tar xzf slate-linux.tar.gz
        sudo mv slate /usr/local/bin
        rm slate-linux.tar.gz

Finally, go to the [CLI Access page](https://portal.slateci.io/cli) and download the personalized script to install your token to the machine which you are setting up.

To check that the SLATE client is ready to use, you can run

        slate cluster list

This should list the various clusters which are already participating in the federation.

## Operating System Requirements

In order to reliably run Kubernetes and connect to the SLATE federation, a few changes are needed to the base CentOS install. The following prerequisite steps will need to be applied to all SLATE nodes in your cluster. 

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
While optional, we *strongly* recommend disabling root login over SSH for security reasons.

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

## SLATE Worker Node

To distribute work assigned to a SLATE cluster, worker nodes can be networked to a SLATE Master node.

All SLATE Worker nodes should be set up using the "Setting Up a SLATE Node" instructions above.

### KubeADM Join

On your Master node, run the following command to get a full join command for the Master's cluster:

```
kubeadm token create --print-join-command
```

Run this generated join command on the worker node to join it to the cluster.

## Cluster Federation

At this point, you should have a SLATE-Ready Kubernetes cluster. You will now be able to join your cluster to the SLATE Federation.

### SLATE CLI

The SLATE Command Line Interface will let you execute SLATE commands.

On the Master node for your cluster, follow the [SLATE CLI](#) installation instructions.

### Joining the Federation

On the Master node for your cluster, execute

```
slate cluster create [NEW-CLUSTER-NAME] --group [YOUR-GROUP-NAME] --org [YOUR-ORG-NAME] -y
```

### Update Cluster Location

All SLATE clusters should have their geographic locations listed in the cluster's attributes.

```
slate cluster update [YOUR-CLUSTER-NAME] --location [LATITUDE],[LONGITUDE]
```

### Allow Group Access

Cluster administrators can grant cluster access to specific groups.

```
slate cluster allow-group [YOUR-CLUSTER-NAME] '[GROUP-NAME]'
```

## Troubleshooting

At this point, you should have a functioning and federated SLATE cluster. If you have any questions on this process, please [contact our team](/community/) for assistance. Below we have provided some solutions to problems that folks have occasionally come across.

### "slate cluster create" command hangs and times out
Sometimes the "slate cluster create" command will hang for a period of time and then fail. This is usually because the underlying `kubectl` command used by the SLATE client is misconfigured. You may want to check to see if `kubectl` commands can complete normally. If you get an error the type:

(starting with Kubernetes v1.18)

``` 
error: no configuration has been provided, try setting KUBERNETES_MASTER environment variable
```

or

 (pre Kubernetes v1.18)
 
```
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

Try setting the `KUBECONFIG` environment variable to the correct location (usually `/etc/kubernetes/admin.conf` or `~/.kube/config`) 
