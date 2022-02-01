---
title: Install Kubernetes
overview: Install Kubernetes

order: 10  

layout: docs2020
type: markdown
---

{% include alert/warning-k8s-version.html %}

The SLATE platform uses Kubernetes as its container orchestration system. In this section we will set up the base Kubernetes software components.

## Add Yum Repo

Add Kubernetes as a repository to `yum`:

```shell
cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
```
{:data-add-copy-button='true'}

## Install Tools

The Kubernetes install includes a few different pieces: 
* `kubeadm` is a tool used to bootstrap Kubernetes clusters
* `kubectl` is the command-line tool needed to interact with and control the cluster
* `kubelet` is the system daemon that allows the Kubernetes api to control the cluster nodes

Install and enable these components:

```shell
KUBE_VERSION=1.21.* && \
yum install -y kubeadm-${KUBE_VERSION} kubectl-${KUBE_VERSION} kubelet-${KUBE_VERSION} --disableexcludes=kubernetes
```
{:data-add-copy-button='true'}

## Finish Up

Finally, enable `kubelet`:

```shell
systemctl enable --now kubelet
```
{:data-add-copy-button='true'}

{% include alert/note.html content="At this point the `kubelet` will be crash-looping as it has no configuration. That is okay for now." %}

{% include doc-next-link.html content="/docs/cluster/manual/slate-master-node.html" %}
