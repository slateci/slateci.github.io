## Overview

This guide describes a simple procedure to install a single-node kubernetes cluster and join it to the SLATE federation. There are many other possible options for installing Kubernetes; this is just one easy way to get started quickly. 

## Prerequisites

This guide assumes a freshly installed CentOS 7 system. All techniques should generalize to other suitably modern Linux systems, but specific commands can differ. 

This guide also assumes that your Kubernetes head node (or control plane) is on a publicly accessible IP address with port 6443 open, in order for the SLATE API server to communicate with your cluster.

Finally, at least one additional publicly accessible IP address, not currently assigned to any specific machine. This is needed in order to install a kubernetes load balancer, which will in turn allocate an address to an [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) which will provide convenient access to users' services. 

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

## Scripted version

If you want a script which will do nearly all of the below, download a copy of [https://github.com/slateci/slate-scripts/raw/master/install-slate-cvmfs.sh](https://github.com/slateci/slate-scripts/raw/master/install-slate-cvmfs.sh). Note that you will need to read and modify its first section to set the names which are relevant for you installation. 

Once the script has finished, you should have a working single-node Kubernetes cluster registered with SLATE. You can then jump to [allowing groups on your cluster](#allowing-groups-to-run-on-your-slate-cluster)

## System Configuration Tweaks

Docker and Kubernetes can be picky about the state of the system on which they run. In particular it is possible to use these together with SELinux, but doing so can be tricky, and requires expertise. Likewise, while Kubernetes can run on systems with swap memory, this is not recommended by the developers. Therefore, you should disable SELinux and swap (from this point, until otherwise noted, commands must be run as superuser):

	# Disable SELinux
	setenforce 0
	sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
	
	# Disable swap
	swapoff -a
	sed -e '/swap/s/^/#/g' -i /etc/fstab
	
## Install Docker

For CentOS, Docker CE should be used:

	yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
	yum install docker-ce docker-ce-cli containerd.io -y

After installation, set Docker to run automatically:

	systemctl enable --now docker
	
At this point you should be able to run

	docker ps
	
successfully, although it should show no containers yet running. 
	
## Install Kubernetes

First, add the kubernetes yum repository:

	cat <<EOF > /etc/yum.repos.d/kubernetes.repo
	[kubernetes]
	name=Kubernetes
	baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
	enabled=1
	gpgcheck=1
	repo_gpgcheck=1
	gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg	 https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
	exclude=kube*
	EOF

Then, install the packages:

	yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

Next, enable the kubelet (the per-node Kubernetes agent) to run automatically:

	systemctl enable --now kubelet

Some Kubernetes networking plugins rely on using IPTables to filter traffic on the bridge netwrok, but CentOS has this turned off by default to better support virtual machine use cases. 
So, we turn it back on:

	cat <<EOF >  /etc/sysctl.d/k8s.conf
	net.bridge.bridge-nf-call-ip6tables = 1
	net.bridge.bridge-nf-call-iptables = 1
	EOF
	sysctl --system

At this point it is time to initialize the Kubernetes cluster. The pod networking CIDR range must be configured to match the expectations of the networking plugin which we will install later. In this case, we will use Calico, so we use its preferred setting of 192.168.0.0/16:

	kubeadm init --pod-network-cidr=192.168.0.0/16

After kubeadm completes you can copy the resulting Kubernetes config file to the home directory of whichever user you used to being the installation process, which need not be privileged (from this point on commands are assumed not be run as superuser):

	mkdir -p ~/.kube
	# note specific user of superuser privileges to copy the original file
	sudo cp -f /etc/kubernetes/admin.conf ~/.kube/config
	sudo chown $USER ~/.kube/config

At this point you should be able to inspect the running kubernetes cluster:

	kubectl get nodes

This command should show one node; the machine on which you are working. The node will, however, have a status of 'NotReady' because the networking plugin is not yet installed. To install it:

	kubectl apply -f https://docs.projectcalico.org/v3.3/getting-started/kubernetes/installation/hosted/rbac-kdd.yaml
	kubectl apply -f https://docs.projectcalico.org/v3.3/getting-started/kubernetes/installation/hosted/kubernetes-datastore/calico-networking/1.7/calico.yaml
	
Running `kubectl get nodes` should now show the node as 'Ready'. 
	
Finally, since this Kubernetes cluster has only one node (which must therefore be the master), remove the 'taint' which prevents user software from running on the master:

	kubectl taint nodes --all node-role.kubernetes.io/master-
	
## Set up your load balancer

SLATE expects your cluster to provide a 'load balancer' which can assign IP addresses to services. [MetalLB](https://metallb.universe.tf) is such a load balancer and can be installed by using:

	kubectl apply -f https://raw.githubusercontent.com/google/metallb/v0.7.3/manifests/metallb.yaml

This will install the components of the load balancer itself (to its own namespace, `metallb-system`), but it will not yet be active, as it is not configured with any IP addresses it can allocate. MetalLB supports using Layer 2 protocols or BGP to advertise the address it assigns; Layer 2 is usually easier to set up and does not require interacting with networking hardware. Create a YAML config file like the following:

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
	      - <Your address range here>

Fill in the range of addresses you have available to use either as a range (e.g. `192.168.1.240-192.168.1.250`) or as a CIDR prefix (e.g. `192.168.10.0/24`). Note that you can use a single IP address in your pool, but doing so requires writing it as a range (like `192.168.1.240-192.168.1.240`). 

After you have prepared your configuration file, install it for use by MetalLB by running:

	kubectl create -f <your_config.yaml>
	
You may wish to refer to the [MetalLB configuration documentation](https://metallb.universe.tf/configuration/) if there are details you need to further customize. 

### MetalLB on OpenStack

If your Kubernetes cluster is installed on one or more virtual machines run by OpenStack, there is one small, extra step required to enable MetalLB to route traffic properly. 
See [the MetalLB documentation](https://metallb.universe.tf/faq/#is-metallb-working-on-openstack) for details; in short, OpenStack must be informed that traffic sent to IP addresses controlled by MetalLB has a valid reason to be going to the VMs which make up the Kubernetes cluster. 

## Join the cluster to the SLATE federation

To join your cluster to the SLATE federation, you will need:

- The name of the group you created in the first section (or the existing group to which you are adding this cluster)
- The name of the organization which formally owns the cluster (typically the name of your institution or lab). Note that if this contains spaces you will need to remember to quote it in the command below
- The name you want to use for the cluster in SLATE, which must contain only lowercase letters, numbers and dashes, and should ideally be short but descriptive. 

Put the appropriate names into the following command, which when run will install supporting components into your cluster, then contact the SLATE federation to register the cluster with it. 

	slate cluster create <cluster name> --group <group name> --org <organization name> -y
	
After this command completes your cluster should be joined to the federation. You can see this by rerunning `slate cluster list`, which should now show it. 

As a service to users who are curious where your cluster is, it is helpful to also run

	slate cluster update <cluster name> --location <latitude>,<longitude>
	
## Allowing groups to run on your SLATE cluster

At this point your cluster is a fully working member of the SLATE platform. However, only your group has access to deploy applications to it. You can leave it in this state as long as you wish, for example to do testing and evaluation. If you want to grant other groups access, you can use

	slate cluster allow-group <cluster name> '*'

to grant access to _all_ groups participating in the platform, or replace `'*'` with the name of a particular group to grant access to just that group. 

## Joining additional nodes

If you have more worker nodes which you wish to add to the cluster use the following command to generate a command for joining them:

	sudo kubeadm token create --print-join-command

Install docker and kubernetes on the worker nodes, but stop at the point where `kubeadm init` was run on the master. Instead, run:

	kubeadm join <master ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
	
substituting in the IP address of your master node, and the hash and token provided by `kubeadm token create`. Note that the token remains valid for 24 hours, so if you wait longer than that to join a worker you will have to regenerate it. 

## In case of problems

If setting up your Kubernetes cluster does not work properly, `kubeadm reset` can be used to revert the effects of `kubeadm init` (and eliminate anything which had been installed inside Kubernetes). 
This is obviously a fairly destructive operation if you have gotten to the point of using the cluster for anything. 

If you have a problem with SLATE, specifically, you can remove SLATE's access to your cluster by deleting the 'cluster' custom resource which defines its main namespace (called slate-system unless you picked a different name):

	kubectl delete cluster slate-system

Please note that this leaves SLATE in a somewhat confused state of expecting to be able to use the cluster but being unable to. 
If possible, it is nicer to first inform SLATE that it should stop using the cluster: 

	slate cluster delete <cluster name>
