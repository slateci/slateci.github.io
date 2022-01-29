---
title: Install Containerd
overview: Install Containerd

order: 10  

layout: docs2020
type: markdown
---


The SLATE platform uses `containerd` as the container run-time. In this section we will install and configure `containerd`.

## Load Kernel Modules

Load the following kernel module dependencies:

```shell
cat <<EOF | tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF
```

```shell
modprobe overlay && \
modprobe br_netfilter
```

## Add Yum Repo

Install the `yum-config-manager` tool if not already present:

```shell
yum install yum-utils -y
```

Add the stable Docker Community Edition repository to `yum`:

```shell
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

## Install Containerd

Install the latest version of `containerd`:

```shell
yum install containerd.io -y
```

## Configure cgroups

Configure the `systemd` `cgroup` driver:

```shell
CONTAINDERD_CONFIG_PATH=/etc/containerd/config.toml && \
rm "${CONTAINDERD_CONFIG_PATH}" && \
containerd config default > "${CONTAINDERD_CONFIG_PATH}" && \
sed -i "/runc.options/a\            SystemdCgroup = true" "${CONTAINDERD_CONFIG_PATH}"
```

## Finish Up

Finally, enable `containerd` and apply the changes:

```shell
systemctl enable --now containerd && \
systemctl restart containerd
```

[Next Page »](/docs/cluster/manual/kubernetes.html)
