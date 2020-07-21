---
title: Installing Docker and Kubernetes
overview: Installing Docker and Kubernetes

order: 10  

layout: docs2020
type: markdown
---


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

<a href="/docs/cluster/slate-master-node.html">Next Page</a>