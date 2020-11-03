---
title: Installing Kubernetes with Ansible & Kubespray
overview: Installing Kubernetes with Ansible & Kubespray

order: 10  
layout: docs2020
type: markdown

---

## Prerequisites

- On each remote machine, you have some user with SSH access *and* passwordless sudo access.

## Kubernetes Cluster Creation

### Setup

1. Install Ansible and Python3 on your local machine:
`sudo yum install ansible python3 python3-pip`
2. Clone kubespray:
`git clone https://github.com/kubernetes-sigs/kubespray.git && cd kubespray && git checkout v2.14.1`
3. Install kubespray Python dependencies:
`sudo pip3 install -r requirements.txt`

### Deploy

1. Create a kubespray inventory directory:
`cp -rfp inventory/sample inventory/<CLUSTERNAME>`
2. Create `inventory/<CLUSTERNAME>/hosts.yaml` with the contents:

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
          access_ip: <ACCESS_IP> (can be same as HOST_IP)
          ansible_host: <HOST_IP>
          ip: <HOST_IP>
    ```

    You can add additional nodes under `hosts:` and add them to either `kube-master` and/or `kube-node` similar to how it is done with `node1`.

3. Configure MetalLB by changing lines 123 in `inventory/<CLUSTERNAME>/group_vars/k8s-cluster/addons.yml` from

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
      - "YOUR_IP/YOUR_SUBNET"
    metallb_version: v0.9.3
    ```

    You can alternatively set `metallb_ip_range` like so:

    ```yaml
    metallb_ip_range:
      - "YOUR_IP/32" # Single IP
      - "YOUR_IP_START-YOUR_IP_END" # Range of IPs
    ```

4. Configure Kubernetes by changing line 115 of `inventory/mycluster/group_vars/k8s-cluster/k8s-cluster.yml` from

    ```yaml
    kube_proxy_strict_arp: false
    ```

    to

    ```yaml
    kube_proxy_strict_arp: true # Required for MetalLB
    ```

    You can also configure other parameters such as `kube_version`, `kube_service_addresses`, `kube_pods_subnet`, etc in this file if you desire.

5. Run kubespray:
`ansible-playbook -i inventory/<CLUSTERNAME>/hosts.yaml --become --become-user=root -u <SSH_USER> cluster.yml`

## SLATE Cluster Creation

### Setup

1. Clone SLATE registration playbook (outside of the kubespray folder):
`git clone https://github.com/slateci/slate-ansible.git && cd slate-ansible`

#### Deploy

1. Run the SLATE registration playbook:

`ansible-playbook -i /path/to/kubespray/inventory/<CLUSTERNAME>/hosts.yaml -u <SSH_USER> --become --become-user=root -e 'slate_cli_token=<SLATE_CLI_TOKEN>' -e 'slate_cli_endpoint=https://api.slateci.io:443' site.yml`

You can register a non-MetalLB enabled cluster with SLATE by passing `-e 'slate_enable_ingress=false'` as an additional flag to this command.
