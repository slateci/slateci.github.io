---
title: Load Balancing with MetalLB
overview: Load Balancing with MetalLB

order: 10

layout: docs2020
type: markdown
---

Kubernetes clusters, in order to evenly distribute work across all worker nodes, require a load balancer. There are a few load balancer solutions. We recommend using [MetalLB](https://metallb.universe.tf/) for load balancing on SLATE clusters.

1. Apply MetalLB to the cluster. This command will create the relevant Kubernetes components that will run our load balancer.

   ```shell
   kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.11.0/manifests/namespace.yaml
   kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.11.0/manifests/metallb.yaml
   ```
   {:data-add-copy-button='true'}

2. Gather pools of public IPv4 and/or IPv6 addresses other than those assigned to the node (pools may be provided by cloud providers as floating IP addresses).

   Examples:
    * IPv4: `203.0.113.42-203.0.113.64`
    * IPv6: `2001:DB8:414:10::56:3-2001:DB8:414:10::56:6`

3. Create the MetalLB configuration and adjust the IP range(s) to reflect your environment. Below is an example of a single pool with a single IPv4 range.

   ```
   cat <<EOF > /tmp/metallb-config.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     namespace: metallb-system
     name: config
   data:
     config: |
       address-pools:
       - name: default
         protocol: layer2
         addresses:
         - 203.0.113.42-203.0.113.64
   EOF
   ```
   {:data-add-copy-button='true'}

4. Verify that `kubeproxy` is configured for `ipvs` mode with `strictARP: true` (already set in the `kubeadm init` configuration templates in [Initialize Kubernetes](/docs/cluster/manual/slate-master-node/initialize-kubernetes.html)).

5. Apply the configuration for MetalLB:

   ```shell
   kubectl apply -f /tmp/metallb-config.yaml
   ```
   {:data-add-copy-button='true'}

To read more about MetalLB installation and configuration, visit their [installation instructions](https://metallb.universe.tf/installation/).

{% include alert/note.html content="If your Kubernetes cluster is installed on one or more virtual machines run by [OpenStack](https://www.openstack.org/), there is one small, extra step required to enable MetalLB to route traffic properly. See [the MetalLB documentation](https://metallb.universe.tf/faq/#is-metallb-working-on-openstack) for details; in short, OpenStack must be informed that traffic sent to IP addresses controlled by MetalLB has a valid reason to be going to the VMs which make up the Kubernetes cluster." %}

{% include doc-next-link.html content="/docs/cluster/manual/slate-worker-node.html" %}
