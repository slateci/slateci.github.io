---
title: Installing Kubernetes
overview: Installing Kubernetes

order: 10  

layout: docs2020
type: markdown
---

{% include alert/note.html content="SLATE currently supports Kubernetes v1.24." %}

The SLATE platform uses Kubernetes as its container orchestration system. This section we'll install the base Kubernetes software components.

## Kubernetes

The Kubernetes repository can be added to the node in the usual way:

```shell
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

{% include alert/note.html content="To understand why `repo_gpgcheck=0`, see Google's [Known Issues](https://cloud.google.com/compute/docs/troubleshooting/known-issues#keyexpired) page." %}

The Kubernetes install includes a few different pieces: `kubeadm`, `kubectl`, and `kubelet`.

* `kubeadm` is a tool used to bootstrap Kubernetes clusters
* `kubectl` is the command-line tool needed to interact with and control the cluster
* `kubelet` is the system daemon that allows the Kubernetes api to control the cluster nodes

The Kubernetes install includes a few different pieces:

* kubeadm is a tool used to bootstrap Kubernetes clusters
* kubectl is the command-line tool needed to interact with and control the cluster
* kubelet is the system daemon that allows the Kubernetes api to control the cluster nodes

Install and enable these components:

```shell
KUBE_VERSION=1.24.* && \
yum install -y kubeadm-${KUBE_VERSION} kubectl-${KUBE_VERSION} kubelet-${KUBE_VERSION} --disableexcludes=kubernetes
```
{:data-add-copy-button='true'}

## Finish Up

Finally, enable `kubelet`:

```shell
systemctl enable --now kubelet
```
{:data-add-copy-button='true'}

At this point the `kubelet` will be crash-looping as it has no configuration. That is okay for now.

{% include doc-next-link.html content="/docs/cluster/manual/slate-master-node.html" %}