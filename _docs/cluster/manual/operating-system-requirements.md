---
title: Operating System Requirements
overview: Operating System Requirements

order: 10  

layout: docs2020
type: markdown
---

In order to reliably run Kubernetes and connect to the SLATE federation, a few changes are needed to the base CentOS 7 install. The following steps will need to be applied to all SLATE nodes in your cluster. 

## Disable SELinux

Disable SELinux as this generally conflicts with Kubernetes:

```shell
setenforce 0 && \
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
```

If you wish to retain the SELinux logging, you can alternatively use the `permissive` mode rather than `enforcing`.

## Disable Swap

Swap must be disabled for Kubernetes to run effectively. Swap is typically enabled in a default CentOS 7 installation where automatic partitioning has been selected.

```shell
swapoff -a && \
sed -e '/swap/s/^/#/g' -i /etc/fstab
```

## Disable firewalld

In order to properly communicate with other devices within the cluster, `firewalld` must be disabled.

```shell
systemctl disable --now firewalld
```

## Disable root login over SSH

While optional, we **strongly** recommend disabling root login over SSH for security reasons.

```shell
sed -i --follow-symlinks 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
```

## Configure Network Traffic

Ensure that bridged network traffic goes through iptables and that IP forwarding is enabled for IPv4 and IPv6. This may be done by adding a file read by `sysctl`:

```shell
cat <<EOF >  /etc/sysctl.d/01-k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv6.conf.all.forwarding=1
net.ipv4.conf.all.forwarding=1
EOF
```

Apply the changes and restart the Network Manager:

```shell
sysctl --system && \
systemctl restart NetworkManager
```

[Next Page »](/docs/cluster/manual/containerd.html)