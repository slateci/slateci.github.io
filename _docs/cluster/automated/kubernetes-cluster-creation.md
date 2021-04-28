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
2. Create a Kubespray inventory directory:
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

### Standard Configuration {#kcc-configure}

These are the default configuration steps we provide.
Where appropriate, non-standard configuration steps are provided.

#### MetalLB

MetalLB is usually a required component for any SLATE cluster; however, there are some situations where it should not be deployed.
If you are setting up a SLATE cluster behind any sort of NAT, you must disable MetalLB.
Setting up a cluster behind a NAT is quite complex and we recommend pinging `#installation` on the SLATE Slack before proceeding.
More information about alternate configurations can be found later in this document [here](/docs/cluster/automated/kubernetes-cluster-creation.html#other-configurations).

To disable MetalLB, simply skip the following section (steps 1 and 2). 
Additionally, a flag must be added to your `ansible-playbook` command in [SLATE Cluster Registration](/docs/cluster/automated/kubernetes-cluster-creation.html#slate-cluster-registration). 
This flag will be further explained at cluster registration time.

Otherwise, deploy MetalLB by following these instructions.

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


#### Cert Manager
Cert Manager is a component that we recommend installing on all SLATE clusters.
To do so, in `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/addons.yml` set
```yaml
cert_manager_enabled: false
```

to

```yaml
cert_manager_enabled: true
```
{:data-add-copy-button='true'}



### Other Configurations

*You can safely skip this entire section ([to here](/docs/cluster/automated/kubernetes-cluster-creation.html#run)) if you are installing a standard multi-node Kubernetes cluster with MetalLB and Calico that is not behind a NAT.*

Otherwise, continue reading to learn about alternate configurations. For a full list of variables you can configure, please read [Configurable Parameters in Kubespray](https://kubespray.io/#/docs/vars).


#### Creating a Single-Node Cluster
By default, Kubespray will setup Kubernetes to create two replicas of CoreDNS, which is impossible on single-node clusters.
While it doesn't break anything or cause any critical errors, it can create noise in your logs and we recommend adding the following:

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `dns_min_replicas` variable like so:
```yaml
k8s-cluster:
  vars:
    dns_min_replicas: 1
```

#### Set specific Kubernetes versions

In `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-cluster.yml` set
```yaml
kube_version: v1.18.10
```

#### Set specific Docker and Calico versions

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `docker_version` and `calico_version` variables like so:
```yaml
k8s-cluster:
  vars:
    docker_version: latest
    calico_version: "v3.16.4"
```

#### Disable MetalLB

Skip steps 1 and 2 in [Kubernetes Cluster Creation / Configure](/docs/cluster/automated/kubernetes-cluster-creation.html#kcc-configure).
- Add flag `-e 'slate_enable_ingress=false'` to your `ansible-playbook` command in [SLATE Cluster Registration](/docs/cluster/automated/kubernetes-cluster-creation.html#slate-cluster-registration).


#### Setup Calico on a multi-homed box

If your box has multiple NICs, you will want to specify which NIC Calico uses for BGP peering with other nodes (else will run into Calico wedging itself on cluster reboots).
For more information, read [IP autodetection methods](https://docs.projectcalico.org/reference/node/configuration#ip-autodetection-methods).

In `inventory/<CLUSTER_NAME>/group_vars/k8s-cluster/k8s-net-calico.yml` set

```yaml
calico_ip_auto_method: "cidr={% raw %}{{ ip }}{% endraw %}/32" # Defaults to the address specified in `ip:` in hosts.yaml
```
{:data-add-copy-button='true'}


#### Use IPTables instead of IPVS

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


#### Cluster setup behind one-to-one NAT (e.g. AWS EC2 instances, Chameleon testbed)
In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `access_ip` variable so your node block(s) look like the following:
```yaml
hosts:
  node1:
    access_ip: <INTERNAL_HOST_IP> # the internal IP bound to _this_ host
    ansible_host: <EXTERNAL_ACCESS_IP> # the IP on which the host is accessible via SSH
    ip: <INTERNAL_HOST_IP> # the internal IP of the host to bind Kubernetes cluster services to
```
{:data-add-copy-button='true'}


#### Cluster setup behind port-forward NAT
You will have to manually port-forward every service running on your cluster for them to be publicly accessible.
To start, port 6443 must be port-forwarded for `kubectl` access.

#### Cluster setup for any NAT
These steps must be followed to allow `kubectl` access through any NAT.

In your `inventory/<CLUSTER_NAME>/hosts.yaml` add the `supplementary_addresses_in_ssl_keys` variable like so:
```yaml
k8s-cluster:
  vars:
    supplementary_addresses_in_ssl_keys: ['<PUBLIC_NAT_IP>']
```
{:data-add-copy-button='true'}

Additionally, add the following flag to your SLATE registration playbook command: `-e 'cluster_access_ip=<PUBLIC_NAT_IP>:6443'`.

`PUBLIC_NAT_IP` is the public half of the public-private IP address pair that your NAT is comprised of.



### Run

Run the Kubespray playbook:

`ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> cluster.yml`


## SLATE Cluster Registration

### Setup

`cd` into the slate-ansible repository or folder.


#### Federation

Currently, SLATE operates two separate federations, a development federation and a production federation.
When you register your cluster, you will need to decide which federation to register with.
By default, you will be given a token for the SLATE production federation.
If you would like to register your cluster here, then simply use the default SLATE token given to you,
and `https://api-dev.slateci.io:18080` as the `slate_cli_endpoint` parameter in the following command.

However, if you would like to register your cluster with the development federation, reach out to the SLATE team about obtaining a development token.
Once you have done this, the development API endpoint is `https://api.slateci.io:443`.

### Run

Run the SLATE registration playbook.
Note that additional flags may need to be added if your cluster is behind a NAT. 

```bash
ansible-playbook -i /path/to/kubespray/inventory/<CLUSTER_NAME>/hosts.yaml -u <SSH_USER> --become --become-user=root \
 -e 'slate_cli_token=<SLATE_CLI_TOKEN>' \
 -e 'slate_cli_endpoint=https://api.slateci.io:443' \
 site.yml
```
{:data-add-copy-button='true'}



#### Cluster registration behind NAT:
Add the following two flags to your SLATE registration playbook command if your cluster is behind a NAT: 

```bash
-e 'cluster_access_ip=<EXTERNAL_NAT_IP>:6443' \
-e 'slate_enable_ingress=false'
```

*Note that `EXTERNAL_NAT_IP` is the IP at which your node is publicly accessible.*



