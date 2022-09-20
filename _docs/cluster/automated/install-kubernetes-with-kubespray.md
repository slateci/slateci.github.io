---
title: Installing Kubernetes with Ansible & Kubespray
overview: Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown

---

<!-- deprecated -->

Kubespray is an Ansible playbook developed to automate Kubernetes cluster deployments (including system tuning, Docker installation, etc) with significant community backing.
We have found Kubespray to be significantly less painful than tools like `kubeadm` for cluster deployments and recommend new cluster installs using these playbooks.

Further, Kubespray has the added benefit of being able to handle scenarios like adding/replacing nodes to the cluster, upgrading your Kubernetes cluster version, and configuring Kubernetes with different container runtimes.
For more information about these, please see the [Kubespray wiki](https://kubespray.io/).

SLATE builts on top of Kubespray by providing a playbook that works with the created Kubespray inventory file to automate cluster registration.

These instructions assume you are installing a Kubernetes cluster with MetalLB and Calico.
To configure the cluster without these or with other parameters, please read [Additional Configurations](#additional-configurations) first.

{:toc}

## Prerequisites
Ansible can be executed anywhere (your laptop, OOB machine, etc), including on a machine that is to be part of your Kubernetes cluster.
The host that is executing Ansible is referred to as the "Ansible executor" in these prerequisites.

### Ansible

- On each machine that is to part of the cluster, you have a user (`<SSH_USER>`) with key-based SSH access *and* passwordless sudo access.
  - The Ansible executor must be able to SSH into each machine in the cluster as this `<SSH_USER>` using an SSH key.
- Must have Ansible version >= 2.9 and &lt; 2.10 installed on the Ansible executor.

### Kubernetes

- Kubernetes packages are not installed on any machine that is to be part of the cluster.
  - You can remove these with `sudo yum remove 'kube*' -y`.
  - We recommend also removing the Kubernetes repo if it exists.
- The current `systemd` version on every machine to be part of the cluster supports `TaskAccounting`.
  - For CentOS 7, this is systemd version `>=219-37`.
  - For other distributions, this is systemd version `>=227`.

### MetalLB

- Must have at least one public IP address not currently assigned to any specific machine (*including* any machine that is to be part of the cluster).

## Kubernetes Cluster Creation

Replace everything in `<>` brackets with your own strings. These all run on the Ansible executor.

### Setup

1. Clone kubespray:
`git clone https://github.com/kubernetes-sigs/kubespray.git && cd kubespray && git checkout v2.15.0`
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
           slate_cluster_name: <SLATE_CLUSTER_NAME>
           slate_group_name: <SLATE_CLUSTER_GROUP>
           slate_org_name: <SLATE_CLUSTER_ORG>
     hosts:
       node1:
         # The IP to use for SSH connections to this host.
         ansible_host: <HOST_IP>
         # The IP to use for binding Kubernetes services.
         ip: <HOST_IP>
    ```
    {:data-add-copy-button='true'}

    You can add additional nodes under `hosts:` and add them to `kube-master` and/or `kube-node` similar to how it is done with `node1`.
    Node names can be anything (i.e. instead of `node1`, it can be the FQDN of the host).
    However, due to Kubernetes restrictions, all characters in the node name must be *lowercase*.

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
{:data-add-copy-button='true'}

### Set specific Kubernetes versions

In `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-cluster.yml` set
```yaml
kube_version: v1.18.10
```
{:data-add-copy-button='true'}

### Set specific Docker and Calico versions

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `docker_version` and `calico_version` variables like so:
```yaml
k8s-cluster:
  vars:
    docker_version: latest
    calico_version: "v3.16.4"
```
{:data-add-copy-button='true'}

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
    access_ip: <ACCESS_IP> # the public IP bound one-to-one to _this_ host
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

## Reset
If you want to wipe your cluster and start from scratch (e.g. if your cluster was put into a bad state), you can run the following command:

`ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> reset.yml`

## Upgrades / Adding & Removing Nodes
Please see the Kubespray docs for this:
- [Upgrading](https://kubespray.io/#/docs/upgrades)
- [Adding/replacing a node](https://kubespray.io/#/docs/nodes)

## Debugging

### Error "'dict object' has no attribute 'v...'"
This likely means you tried to pass in a Kubernetes version that Kubespray (or your current Kubespray checkout) does not yet support.
Try pulling the newest release of kubespray and try again.

### slate: Exception: Ingress controller service has not received an IP address...
If the SLATE registration playbook throws this error, it means that the ingress controller was unable to get an IP from MetalLB in time.
Log in to the cluster manually, use `sudo /usr/local/bin/kubectl get pods -n metallb-system` to get the name of the MetalLB controller pod, and then check its logs with `sudo /usr/local/bin/kubectl logs controller-... -n metallb-system`.

If the logs say something related to "Invalid CIDR", it likely means the CIDR range you passed into the [MetalLB Configuration](#kcc-configure) was invalid (e.g. forgot to append `/32` to the end of a single IP).
Try adjusting the CIDR range and rerunning the *Kubespray* playbook to see if this fixes the issue.
Else, we suggest pinging the SLATE Slack for more help.
