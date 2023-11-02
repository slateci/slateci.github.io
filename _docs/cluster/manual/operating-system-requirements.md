---
title: Operating System Requirements
overview: Operating System Requirements

order: 10  

layout: docs2020
type: markdown
---

In order to reliably run Kubernetes and connect to the SLATE federation, a few changes are needed to the base CentOS 7 install. The following prerequisite steps will need to be applied to all SLATE nodes in your cluster. 

## Disable SELinux

First, you will need to disable SELinux as this generally conflicts with Kubernetes:

```shell
setenforce 0 && \
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
```
{:data-add-copy-button='true'}

{% include alert/note.html content="If you wish to retain the SELinux logging, you can alternatively use **permissive** mode rather than disabling it entirely." %}

## Disable swap

Swap must be disabled for Kubernetes to run effectively. Swap is typically enabled in a default CentOS 7 installation where automatic partitioning has been selected. To disable swap:

```shell
swapoff -a && \
sed -e '/swap/s/^/#/g' -i /etc/fstab
```
{:data-add-copy-button='true'}

## Disable firewalld

In order to properly communicate with other devices within the cluster, `firewalld` must be disabled:

```shell
systemctl disable --now firewalld
```
{:data-add-copy-button='true'}

## Disable root login over SSH

{% include alert/important.html content="This is highly recommended for security reasons." %}

Optionally disable `root` login over SSH.

```shell
sed -i --follow-symlinks 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
```
{:data-add-copy-button='true'}

## Use iptables for Bridged Network Traffic

{% include alert/note.html content="This step is only necessary for EL7 and EL8 hosts." %}

Ensure that bridged network traffic goes through `iptables`.

```shell
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
```
{:data-add-copy-button='true'}

## Enable routing

```shell
cat <<EOF >  /etc/sysctl.d/ip-forward.conf
net.ipv4.ip_forward = 1 
EOF
sysctl --system
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/containerd.html" %}
