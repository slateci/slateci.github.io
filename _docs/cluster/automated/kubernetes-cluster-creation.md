---
title: Cluster Creation
overview: Cluster Creation

order: 10
layout: docs2020
type: markdown

---

## Kubernetes Cluster
Replace everything in `<>` brackets with your own strings. These all run on the Ansible executor.

### Setup

1. `cd` into the Kubespray repo / folder
2. Create a kubespray inventory directory:
`cp -rfp inventory/sample inventory/<CLUSTER_NAME>`
3. Create `inventory/<CLUSTER_NAME>/hosts.yaml` with the contents:

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
Please read [Additional Configurations](/docs/cluster/automated/additional-configs.html) to see if any of those apply to you before continuing.

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

`cd` into the slate-ansible repo or folder.

### Run

Run the SLATE registration playbook:

```bash
ansible-playbook -i /path/to/kubespray/inventory/<CLUSTER_NAME>/hosts.yaml -u <SSH_USER> --become --become-user=root \
 -e 'slate_cli_token=<SLATE_CLI_TOKEN>' \
 -e 'slate_cli_endpoint=https://api.slateci.io:443' \
 site.yml
```
{:data-add-copy-button='true'}
