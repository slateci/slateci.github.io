---
title: Operating System Requirements
overview: Operating System Requirements

order: 10  

layout: docs2020
type: markdown
---

In order to reliably run Kubernetes and connect to the SLATE federation, a few changes are needed to the base CentOS install. The following prerequisite steps will need to be applied to all SLATE nodes in your cluster. 

### Disable SELinux
First, you will need to disable SELinux as this generally conflicts with Kubernetes:

```
setenforce 0
sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
```

If you wish to retain the SELinux logging, you can alternatively use 'permissive' mode rather than enforcing.

### Disable swap
Swap must be disabled for Kubernetes to run effectively. Swap is typically enabled in a default CentOS installation where automatic partitioning has been selected. To disable swap:

```
swapoff -a
sed -e '/swap/s/^/#/g' -i /etc/fstab
```

### Disable firewalld
In order to properly communicate with other devices within the cluster, `firewalld` must be disabled:

```
systemctl disable --now firewalld
```

### Disable root login over SSH
While optional, we *strongly* recommend disabling root login over SSH for security reasons.

```
sed -i --follow-symlinks 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
```

### Use iptables for Bridged Network Traffic
Ensure that bridged network traffic goes through iptables.

```
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
```

<a href="/docs/cluster/docker-kubernetes.html">Next Page</a>