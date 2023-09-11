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
export KUBE_VERSION=1.24 && \
cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v${KUBE_VERSION}/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v${KUBE_VERSION}/rpm/repodata/repomd.xml.key
EOF
```
{:data-add-copy-button='true'}

The Kubernetes install includes a few different pieces: `kubeadm`, `kubectl`, and `kubelet`.

* `kubeadm` is a tool used to bootstrap Kubernetes clusters
* `kubectl` is the command-line tool needed to interact with and control the cluster
* `kubelet` is the system daemon that allows the Kubernetes api to control the cluster nodes

Install and enable these components:

```shell
yum install -y kubeadm kubectl kubelet
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