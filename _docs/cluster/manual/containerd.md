---
title: Installing Containerd
overview: Installing Containerd

order: 10  

layout: docs2020
type: markdown
---


The SLATE platform uses `containerd` as the container run-time. Complete the following steps to install and configure `containerd` for your cluster.

## Load Kernel Modules

Specify and load the following kernel module dependencies:

```shell
cat <<EOF | tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF
```
{:data-add-copy-button='true'}

```shell
modprobe overlay && \
modprobe br_netfilter
```
{:data-add-copy-button='true'}

## Add Yum Repo

Install the `yum-config-manager` tool if not already present:

```shell
yum install yum-utils -y
```
{:data-add-copy-button='true'}

Add the stable Docker Community Edition repository to `yum`:

```shell
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```
{:data-add-copy-button='true'}

## Install Containerd

Install the latest version of `containerd`:

```shell
yum install containerd.io -y
```
{:data-add-copy-button='true'}

## Configure cgroups

Configure the `systemd` `cgroup` driver:

```shell
CONTAINDERD_CONFIG_PATH=/etc/containerd/config.toml && \
rm "${CONTAINDERD_CONFIG_PATH}" && \
containerd config default > "${CONTAINDERD_CONFIG_PATH}" && \
sed -i "s/SystemdCgroup = false/SystemdCgroup = true/g"  "${CONTAINDERD_CONFIG_PATH}"
```
{:data-add-copy-button='true'}

## Finish Up

Finally, enable `containerd` and apply the changes:

```shell
systemctl enable --now containerd && \
systemctl restart containerd
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/kubernetes.html" %}