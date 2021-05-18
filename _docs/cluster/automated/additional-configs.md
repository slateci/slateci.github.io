---
title: Additional Configurations
overview: Additional Configurations

order: 10
layout: docs2020
type: markdown

---

For a full list of variables you can configure, please read [Configurable Parameters in Kubespray](https://kubespray.io/#/docs/vars).

### Creating a single node cluster
By default, Kubespray will setup Kubernetes to create two replicas of CoreDNS, which is impossible on single-node clusters.
While it doesn't break anything or cause any critical errors, it can create noise in your logs and we recommend adding the following:

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `dns_min_replicas` variable like so:
```yaml
k8s-cluster:
  vars:
    dns_min_replicas: 1
```

### Set specific Kubernetes versions

In `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-cluster.yml` set
```yaml
kube_version: v1.18.10
```

### Set specific Docker and Calico versions

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `docker_version` and `calico_version` variables like so:
```yaml
k8s-cluster:
  vars:
    docker_version: latest
    calico_version: "v3.16.4"
```

### Disable MetalLB

- Skip steps 1 and 2 in [Kubernetes Cluster Creation / Configure](/docs/cluster/automated/kubernetes-cluster-creation.html#kcc-configure).
- Add flag `-e 'slate_enable_ingress=false'` to your `ansible-playbook` command in [SLATE Cluster Registration](/docs/cluster/automated/kubernetes-cluster-creation.html#slate-cluster-registration).

### Enable Cert Manager
In `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/addons.yml` set
```yaml
cert_manager_enabled: false
```

to

```yaml
cert_manager_enabled: true
```
{:data-add-copy-button='true'}

### Setup Calico on a multi-homed box

If your box has multiple NICs, you will want to specify which NIC Calico uses for BGP peering with other nodes (else will run into Calico wedging itself on cluster reboots).
For more information, read [IP autodetection methods](https://docs.projectcalico.org/reference/node/configuration#ip-autodetection-methods).

In `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-net-calico.yml` set

```yaml
calico_ip_auto_method: "cidr={% raw %}{{ ip }}{% endraw %}/32" # Defaults to the address specified in `ip:` in hosts.yaml
```
{:data-add-copy-button='true'}

### Use IPTables instead of IPVS

Kubespray defaults to configuring `kube-proxy` with IPVS instead of IPTables as it is more performant.
If you would like to use IPTables instead, in `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-cluster.yml` set:
```yaml
kube_proxy_mode: ipvs
```

to

```yaml
kube_proxy_mode: iptables
```
{:data-add-copy-button='true'}

### Setup cluster behind a NAT
These setups are quite complex and we recommend pinging `#installation` on the SLATE Slack before proceeding.
Both of these require [disabling MetalLB](#disable-metallb).

#### For one-to-one NATs (e.g. AWS EC2 instances)

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `access_ip` variable so your node block(s) look like the following:
```yaml
hosts:
  node1:
    access_ip: <HOST_IP> # the internal IP bound to _this_ host
    ansible_host: <ACCESS_IP> # the IP on which the host is accessible via SSH
    ip: <HOST_IP> # the internal IP of the host to bind Kubernetes cluster services to
```
{:data-add-copy-button='true'}

#### For port forward NATs
You will have to manually port-forward every service running on your cluster for them to be publicly accessible.
To start, port 6443 must be port-forwarded for `kubectl` access.

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `supplementary_addresses_in_ssl_keys` variable like so:
```yaml
k8s-cluster:
  vars:
    supplementary_addresses_in_ssl_keys: ['<NAT_IP>']
```
{:data-add-copy-button='true'}

And add the following flag to your SLATE registration playbook command: `-e 'cluster_access_ip=<NAT_IP>:6443'`.

[Previous](/docs/cluster/automated/kubernetes-cluster-creation.html) / [Next](/docs/cluster/automated/reset.html)