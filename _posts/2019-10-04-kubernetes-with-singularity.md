---
title: "Setting up a Kubernetes Cluster based on Singularity"
overview: Blog
published: false
permalink: blog/kubernetes-with-singularity.html
attribution: The SLATE Team
layout: post
type: markdown
---

Kubernetes supports multiple container runtimes through its [Container Runtime Interface](https://kubernetes.io/blog/2016/12/container-runtime-interface-cri-in-kubernetes/) (CRI). As a result, besides the typical default choice of Docker (containerd) one can also use a variety of other drop-in replacements, such as [cri-o](https://cri-o.io). This article will discuss another option, namely Singularity. 
<!--end_excerpt-->

Singularity has a few important advantages which make it an interesting choice as the basis for a Kubernetes cluster. Singularity is designed specifically to be usable by unprivileged users for reliable security, and to be suited to use in High Performance Computing. As a result, Singularity is already familiar to most HPC system administrators. Introducing new infrastructure software to a computing center is a potentially major step, so it is useful to leverage tools which are already available and whose possible pitfalls are already understood. 

At the time of writing, the Singularity CRI implementation is still in beta testing, so it may not yet be suitable for a major deployment. However, in our testing it has performed solidly, and is well worth trying out. 

Documentation for the Singularity CRI is located at [the main Sylabs documentation site](https://sylabs.io/guides/cri/1.0/user-guide/installation.html) and also in the [code repository](https://github.com/sylabs/singularity-cri). The instructions provided there are sufficient to set up a Kubernetes cluster when combined with a typical approach to using `kubeadm`, but for convenience we will show how to combine the two together into a single workflow. For simplicity this guide assumes a fresh CentOS 7 system, but the procedure should be applicable to other distributions with only minor adjustments. 

First, several packages must be installed, some of which are found in [EPEL](https://fedoraproject.org/wiki/EPEL). 

	yum update -y # updating installed packages is a good first step, but can take a while
	yum install -y epel-release
	yum install -y singularity-runtime singularity git socat golang gcc libseccomp-devel

Next, grab a copy of the Singularity CRI source code and compile it. This step will hopefully become a simpler package installation soon, once the beta period ends. Nonetheless, building and installing should take only a few seconds. 

	git clone https://github.com/sylabs/singularity-cri.git
	cd singularity-cri
	git checkout tags/v1.0.0-beta.6 -b v1.0.0-beta.6
	make
	make install

Then, create a systemd unit file to handle running the CRI for you:

	cat <<EOF > /etc/systemd/system/sycri.service
	[Unit]
	Description=Singularity-CRI
	After=network.target
	
	[Service]
	Type=simple
	Restart=always
	RestartSec=1
	ExecStart=/usr/local/bin/sycri
	Environment="PATH=/usr/local/libexec/singularity/bin:/bin:/sbin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
	
	[Install]
	WantedBy=multi-user.target
	EOF
	
	sudo systemctl enable sycri
	sudo systemctl start sycri

At this point all singularity components should be ready to go, and you are ready to start installing Kubernetes. 

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

	yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
	systemctl enable kubelet

Next, it's necessary to tell the kubernetes kubelet that you want it to use the Singularity CRI:

	cat > /etc/default/kubelet << EOF
	  KUBELET_EXTRA_ARGS=--container-runtime=remote \
	  --container-runtime-endpoint=unix:///var/run/singularity.sock \
	  --image-service-endpoint=unix:///var/run/singularity.sock
	EOF

For Kubernetes networking to behave correctly, the `br_netfilter` module needs to be loaded. You can check whether it is by running

	lsmod | grep br_netfilter

If that produces no output, the module is not loaded, and you should run

	modprobe br_netfilter

after which, rerunning the previous command should show something. 

You can then set the necessary network settings for Kubernetes:

	cat <<EOF >  /etc/sysctl.d/k8s.conf
	net.bridge.bridge-nf-call-ip6tables = 1
	net.bridge.bridge-nf-call-iptables = 1
	net.ipv4.ip_forward = 1
	EOF
	sysctl --system

Finally, it is time to initialize the Kubernetes cluster itself. It's important to pick the correct CIDR range for the networking plugin you plan to use; here we use the range favored by Calico:

	kubeadm init --pod-network-cidr=192.168.0.0/16 --cri-socket unix:///var/run/singularity.sock

At this point there are only a few more steps to being able to use the cluster. First, tell kubectl where to find your administrator config so that you can use it to complete the set-up:

	export KUBECONFIG=/etc/kubernetes/admin.conf

At this point you should be able to run `kubectl get nodes` to see that you have a master node, but it is in the `Notready` state. To correct this, install your networking plugin:

	kubectl apply -f https://docs.projectcalico.org/v3.8/manifests/calico.yaml

Your node should now enter the `Ready` state, but it will only accept pods concerned with running Kubernetes itself. To use the cluster more generally with just this single node, you can remove the taint which keeps away non-systme pods:

	kubectl taint nodes --all node-role.kubernetes.io/master-

Your cluster should now be ready to use. You can test it out by running an example 'Hello world' server as follows:

	kubectl run hello --image=gcr.io/google-samples/hello-app:1.0 --port=8080 --generator=run-pod/v1
	kubectl expose pod hello --target-port=8080 --type=NodePort

You can watch its progress starting up with

	kubectl get pods -l 'run=hello' -w

which should run for a few seconds until it reports that your pod has status 'Running' and '1/1' containers ready, at which point you can press Ctrl+C to stop watching. With your pod running, you can run the following command to determine the address at which it can be contacted:

	echo 'http://'$(kubectl get pods -l 'run=hello' -o jsonpath='{.items[0].status.hostIP}')':'$(kubectl get services -l 'run=hello' -o jsonpath='{.items[0].spec.ports[0].nodePort}')

You can either use `curl` to request the resulting address, or, if your machine is rechable from the public internet you can simply put it into a web browser. Either way, you should see the 'Hello world' message from your nginx server. 

When you are done with your nginx, you can shut it down with `kubectl delete pod hello; kubectl delete service hello`. 

An interesting point to note here is that the [nginx image](https://hub.docker.com/_/nginx) used here is a *Docker* image, not a Singularity image. Singularity still ran it all the same, handling the necessary conversion completely transparently. 
