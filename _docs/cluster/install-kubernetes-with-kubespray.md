---
title: Installing Kubernetes with Ansible & Kubespray
overview: Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown

---

Kubespray is an Ansible playbook used to automate Kubernetes cluster deployments.
We have found Kubespray to be significantly less painful than tools like `kubeadm` for cluster deployments and recommend new cluster installs using these playbooks.

Further, Kubespray has the added benefit of being able to handle scenarios like adding/replacing nodes to the cluster, upgrading your Kubernetes cluster version, and configuring Kubernetes with different runtimes.
For more information, please see the [Kubespray wiki](https://kubespray.io/).

SLATE builts on top of Kubespray by providing a playbook that works with the created Kubespray inventory file to automate cluster registration.

These instructions assume you are installing a Kubernetes cluster with MetalLB and Calico.
To configure the cluster without these or with other parameters, please read [Additional Configurations](#additional-configurations) first.

## Prerequisites

- On each machine to be configured, you have a user with key-based SSH access *and* passwordless sudo access.
- Must have Ansible version 2.9+ installed on the host that is running Ansible.
- Must have Python's netaddr library installed on the host that is running Ansible.

## Kubernetes Cluster Creation

Replace everything in `<>` brackets with your own strings.

### Setup

1. Install Ansible and Python3 on your local machine:
`sudo yum install ansible python3 python3-pip`
2. Clone kubespray:
`git clone https://github.com/kubernetes-sigs/kubespray.git && cd kubespray && git checkout v2.14.2`
3. Install kubespray Python dependencies:
`sudo pip3 install -r requirements.txt`

### Deploy

1. Create a kubespray inventory directory:
    ```bash
   cp -rfp inventory/sample inventory/<CLUSTER_NAME>
    ```
    {:data-add-copy-button='true'}
2. Create `inventory/<CLUSTER_NAME>/hosts.yaml` with the contents:

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
           # dns_min_replicas: 1 # UNCOMMENT THIS ONLY IF YOU HAVE A SINGLE NODE CLUSTER
           slate_cluster_name: <SLATE_CLUSTER_NAME>
           slate_group_name: <SLATE_CLUSTER_GROUP>
           slate_org_name: <SLATE_CLUSTER_ORG>
     hosts:
       node1:
         # Necessary when the public IP is routed through a NAT, e.g. AWS EC2 instances.
         # This can be set to the same as ansible_host if the public IP is set directly on the host's NIC.
         access_ip: <ACCESS_IP> (can be same as HOST_IP)
         # The IP to use for SSH connections to this host.
         ansible_host: <HOST_IP>
         # The IP to use for binding services.
         ip: <HOST_IP>
    ```
    {:data-add-copy-button='true'}

    You can add additional nodes under `hosts:` and add them to `kube-master` and/or `kube-node` similar to how it is done with `node1`.

3. Configure MetalLB by changing these lines in `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/addons.yml` from

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

4. Configure Kubernetes by changing these lines in `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-cluster.yml` from

    ```yaml
   kube_proxy_strict_arp: false
    ```

    to

    ```yaml
   kube_proxy_strict_arp: true # Required for MetalLB
    ```
    {:data-add-copy-button='true'}

5. Run kubespray:
    ```bash
   ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> cluster.yml
    ```
    {:data-add-copy-button='true'}

## SLATE Cluster Creation

### Setup

1. Clone SLATE registration playbook (outside of the kubespray folder):
    ```bash
   git clone https://github.com/slateci/slate-ansible.git && cd slate-ansible
    ```
    {:data-add-copy-button='true'}

### Deploy

1. Run the SLATE registration playbook:

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

- Skip steps 3 and 4 in [Kubernetes Cluster Creation](#kubernetes-cluster-creation).
- Add flag `-e 'slate_enable_ingress=false'` to your `ansible-playbook` command in [SLATE Cluster Creation](#slate-cluster-creation).

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
