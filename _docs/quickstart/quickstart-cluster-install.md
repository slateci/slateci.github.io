---
title: Installing a SLATE edge cluster
overview: How to install a single-node cluster, going from a fresh OS to joining SLATE

order: 90

layout: quickstart
type: markdown
---
{% include home.html %}

## Overview

This guide describes a simple procedure to install a single-node kubernetes cluster and join it to the SLATE federation. There are many other possible options for installing Kubernetes; this is just one easy way to get started quickly. 

## Prerequesites

This guide assumes a freshly installed CentOS 7 system. All techniques should generalize to other suitably modern Linux systems, but specific commands can differ. 

## Obtain a SLATE token

If you have not done so already, go to [the SLATE portal](https://portal.slateci.io/) and create an account. 

Also, if you are not already a member of a SLATE group, create one to be responsible for administering your cluster (go to [the 'My Groups' page](https://portal.slateci.io/groups) and click 'Register New Group'). If the primary purpose of your group will be to administer this cluster (and possibly others) you should select 'Resource Provider' as the field of science. A group can administer multiple clusters, so if you are already a member of a suitable group you do not need to create another. 

Install a copy of the SLATE CLI client on the machine which you are setting up:

	curl -LO https://jenkins.slateci.io/artifacts/client/slate-linux.tar.gz
	tar xzf slate-linux.tar.gz
	sudo mv slate /usr/local/bin
	rm slate-linux.tar.gz

Finally, go to the [CLI Access page](https://portal.slateci.io/cli) and download the personalized script to install your token to the machine which you are setting up. 

To check that the SLATE client is ready to use, you can run

	slate cluster list

This should list the various clusters which are already participating in the federation. 

## System Configuration Tweaks

Docker and Kubernetes can be picky about the state of the system on which they run. In particular it is possible to use these together with SELinux, but doing so can be tricky, and requires expertise. Likewise, while Kubernetes can run on systems with swap memory, this is not recommended by the developers. Therefore, you should disable SELinux and swap (from this point, until otherwise noted, commands must be run as superuser):

	# Disable SELinux
	setenforce 0
	sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
	
	# Disable swap
	swapoff -a
	sed -e '/swap/s/^/#/g' -i /etc/fstab
	
## Install Docker

For Cent OS, Docker CE should be used:

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

Configure the bridge filtering for kubernetes:

	cat <<EOF >  /etc/sysctl.d/k8s.conf
	net.bridge.bridge-nf-call-ip6tables = 1
	net.bridge.bridge-nf-call-iptables = 1
	EOF
	sysctl --system

At this point it is time to initialize the Kubernetes cluster. The pod networking CIDR range must be configured to match the expectations of the networking plugin which we will install later. In this case, we will use Calico, so we use it's preferred setting of 192.168.0.0/16:

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
	
Finally, since this Kubernetes has only one node (which must therefore be the master), remove the 'taint' which prevents user software from running on the master:

	kubectl taint nodes --all node-role.kubernetes.io/master-

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

At this point your cluster is a fully working member of the SLATE platform. However, only your group has access to deploy applications to it. You can leave it in this state as long as you wish, for example to do testing and evaluation. If you want to grant other groups access, you can use

	slate cluster allow-group <cluster name> '*'

to grant access to _all_ groups participating in the platform, or replace `'*'` with the name of a particular group to grant access to just that group. 

## Scripted version

If you want a script which will do nearly all of the above (all except setting up your SLATE account and granting other groups access to your cluster) download a copy of [http://jenkins.slateci.io/artifacts/scripts/install-slate.sh](http://jenkins.slateci.io/artifacts/scripts/install-slate.sh). Note that you will need to read and modify its first section to set the names which are relevant for you installation. 

## Joining additional nodes

If you have more worker nodes which you wish to add to the cluster use the following command to generate a command for joining them:

	sudo kubeadm token create --print-join-command

Install docker and kubernetes on the worker nodes, but stop at the point where `kubeadm init` was run on the master. Instead, run:

	kubeadm join <master ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
	
substituting in the IP address of your master node, and the hash and token provided by `kubeadm token create`. Note that the token remains valid for 24 hours, so if you wait longer than that to join a worker you will have to regenerate it. 