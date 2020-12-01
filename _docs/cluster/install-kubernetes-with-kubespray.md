---
title: Installing Kubernetes with Ansible & Kubespray
overview: Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown

---

Kubespray is an Ansible playbook used to automate Kubernetes cluster deployments with significant community backing.
We have found Kubespray to be significantly less painful than tools like `kubeadm` for cluster deployments and recommend new cluster installs using these playbooks.

Further, Kubespray has the added benefit of being able to handle scenarios like adding/replacing nodes to the cluster, upgrading your Kubernetes cluster version, and configuring Kubernetes with different container runtimes.
For more information, please see the [Kubespray wiki](https://kubespray.io/).

SLATE builts on top of Kubespray by providing a playbook that works with the created Kubespray inventory file to automate cluster registration.

These instructions assume you are installing a Kubernetes cluster with MetalLB and Calico.
To configure the cluster without these or with other parameters, please read [Additional Configurations](#additional-configurations) first.

## Prerequisites
Ansible can be executed anywhere (your laptop, OOB machine, etc), including on a machine that is to be in your Kubernetes cluster.
The host that is executing Ansible is referred to as the "Ansible executor" in these prerequisites.

### Ansible

- On each machine in the cluster, you have a user (`<SSH_USER>`) with key-based SSH access *and* passwordless sudo access.
  - The Ansible executor must be able to SSH into each machine in the cluster as this `<SSH_USER>` using an SSH key.
- Must have Ansible version 2.9+ installed on the Ansible executor.

### Kubernetes

- Kubernetes packages are not installed on any machine in the cluster.
  - You can remove these with `sudo yum remove 'kube*' -y`.
  - We recommend also removing the Kubernetes repo if it exists.
- The current `systemd` version on every machine in the cluster supports `TaskAccounting`.
  - For CentOS 7, this is systemd version `>=219-37`.
  - For other distributions, this is systemd version `>=227`.

### MetalLB

- Must have at least one public IP address not currently assigned to any specific machine (including any machine in the cluster).

## Kubernetes Cluster Creation

Replace everything in `<>` brackets with your own strings.

### Setup

1. Clone kubespray:
`git clone https://github.com/kubernetes-sigs/kubespray.git && cd kubespray && git checkout v2.14.2`
2. Install kubespray Python dependencies:
`sudo pip3 install -r requirements.txt` or `sudo pip install -r requirements.txt`
3. Create a kubespray inventory directory:
`cp -rfp inventory/sample inventory/<CLUSTER_NAME>`
4. Create `inventory/<CLUSTER_NAME>/hosts.yaml` with the contents:

    ```yaml
   all:
     children:
       calico-rr:
         hosts: {}
       etcd:
         hosts:
           node1:
       kube-master:
         hosts:
           node1:
       kube-node:
         hosts:
           node1:
       k8s-cluster:
         children:
           kube-master:
           kube-node:
         vars:
           # Uncomment this only if you have a single-node cluster.
           # dns_min_replicas: 1
           #
           # Uncomment this only if your cluster is behind a _port-forward_ NAT and ping the #installation channel before proceeding.
           # supplementary_addresses_in_ssl_keys: ['<PUBLIC_IP>']
           slate_cluster_name: <SLATE_CLUSTER_NAME>
           slate_group_name: <SLATE_CLUSTER_GROUP>
           slate_org_name: <SLATE_CLUSTER_ORG>
     hosts:
       node1:
         # Uncomment if the public IP is routed through an _one-to-one_ NAT, e.g. AWS EC2 instances.
         # Port forward NATs should not use this.
         # access_ip: <ACCESS_IP>
         #
         # The IP to use for SSH connections to this host.
         ansible_host: <HOST_IP>
         # The IP to use for binding services.
         ip: <HOST_IP>
    ```
    {:data-add-copy-button='true'}

    You can add additional nodes under `hosts:` and add them to `kube-master` and/or `kube-node` similar to how it is done with `node1`.

### Configure {#kcc-configure}

These are the default configuration steps we provide.
Please read [Additional Configurations](#additional-configurations) to see if any of those apply to you before continuing.

1. Configure MetalLB by changing these lines in `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/addons.yml` from

    ```yaml
   ...
   # MetalLB deployment
   metallb_enabled: false
   # metallb_ip_range:
   #   - "10.5.0.50-10.5.0.99"
   # metallb_version: v0.9.3
   ...
    ```

    to

    ```yaml
   metallb_enabled: true
   metallb_ip_range:
     - "<YOUR_IP>/<YOUR_SUBNET>"
   metallb_version: v0.9.3
    ```
    {:data-add-copy-button='true'}

    You can alternatively set `metallb_ip_range` like so:

    ```yaml
   metallb_ip_range:
     - "<YOUR_IP>/32" # Single IP
     - "<YOUR_IP_START>-<YOUR_IP_END>" # Range of IPs
    ```
    {:data-add-copy-button='true'}

    The IP addresses listed here must be the unassigned public IPs mentioned in the prerequisites.

2. Configure strict ARP by changing these lines in `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-cluster.yml` from

    ```yaml
   kube_proxy_strict_arp: false
    ```

    to

    ```yaml
   kube_proxy_strict_arp: true # Required for MetalLB
    ```
    {:data-add-copy-button='true'}

### Run

Run the kubespray playbook:

`ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> cluster.yml`

## SLATE Cluster Registration

### Setup

Clone SLATE registration playbook (outside of the kubespray folder):
`git clone https://github.com/slateci/slate-ansible.git && cd slate-ansible`

### Run

Run the SLATE registration playbook:

```bash
ansible-playbook -i /path/to/kubespray/inventory/<CLUSTER_NAME>/hosts.yaml -u <SSH_USER> --become --become-user=root \
 -e 'slate_cli_token=<SLATE_CLI_TOKEN>' \
 -e 'slate_cli_endpoint=https://api.slateci.io:443' \
 site.yml
```
{:data-add-copy-button='true'}

## Additional Configurations

For version number changes, you must verify that the current version of kubespray supports the versions you specify.
If you get an error along the lines of "'dict object' has no attribute 'v1.18.10'", it means your checked out version of kubespray does not support the version you specified.
Try pulling the newest release of kubespray and try again.

For a full list of variables you can configure, please read [Configurable Parameters in Kubespray](https://github.com/kubernetes-sigs/kubespray/blob/master/docs/vars.md).

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

- Skip steps 1 and 2 in [Kubernetes Cluster Creation / Configure](#kcc-configure).
- Add flag `-e 'slate_enable_ingress=false'` to your `ansible-playbook` command in [SLATE Cluster Registration](#slate-cluster-registration).

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

If your box has multiple NICs, you will want to specify which NIC Calico uses for BGP peering with other nodes.
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

### Setup cluster behind a port-forward NAT
WIP

## Reset
If you want to wipe your cluster and start from scratch (e.g. if your cluster was put into a bad state), you can run the following command:

`ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> reset.yml`

**NOTE**: There's a bug in this playbook associated with `kubelet` dirs in `v2.14.2`.
If this command errors out on `TASK [reset : reset | gather mounted kubelet dirs]`, you will need to checkout master (`git checkout master`) first then run the reset playbook.
Don't forget to re-checkout the kubespray version from before when you're done!

## Upgrades / Adding & Removing Nodes
Please see the Kubespray docs for this:
- [Upgrading](https://kubespray.io/#/docs/upgrades)
- [Adding/replacing a node](https://kubespray.io/#/docs/nodes)

## Debugging
WIP
