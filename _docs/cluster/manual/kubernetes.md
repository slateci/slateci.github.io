---
title: Installing Kubernetes
overview: Installing Kubernetes

order: 10  

layout: docs2020
type: markdown
---


The SLATE platform uses Kubernetes as its container orchestration system. This section we'll install the base Kubernetes software components.

### Kubernetes

The Kubernetes repository can be added to the node in the usual way:

```
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
```
{:data-add-copy-button='true'}

**Note** If you get an error about GPG keys, Google's recommendation is changing above file entry to `repo_gpgcheck=0`.  Currently (03/30/2022) the Google GPG key is expired or incorrect for yum installs. For more information please visit Google's [Known Issues](https://cloud.google.com/compute/docs/troubleshooting/known-issues#keyexpired) page. 

The Kubernetes install includes a few different pieces: `kubeadm`, `kubectl`, and `kubelet`. `kubeadm` is a tool used to bootstrap Kubernetes clusters, `kubectl` is the command-line tool needed to interact with and control the cluster, and `kubelet` is the system daemon that allows the Kubernetes api to control the cluster nodes. To install and enable these components:

The Kubernetes install includes a few different pieces:

- kubeadm is a tool used to bootstrap Kubernetes clusters
- kubectl is the command-line tool needed to interact with and control the cluster
- kubelet is the system daemon that allows the Kubernetes api to control the cluster nodes

Install and enable these components:

```
KUBE_VERSION=1.24.* && \
yum install -y kubeadm-${KUBE_VERSION} kubectl-${KUBE_VERSION} kubelet-${KUBE_VERSION} --disableexcludes=kubernetes
```
{:data-add-copy-button='true'}

### Finish Up

Finally, enable kubelet:

```
systemctl enable --now kubelet
```
{:data-add-copy-button='true'}

At this point the kubelet will be crash-looping as it has no configuration. That is okay for now.

<a href="/docs/cluster/manual/slate-master-node.html">Next Page</a>
