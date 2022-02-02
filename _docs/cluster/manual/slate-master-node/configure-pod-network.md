---
title: Configure Pod Network with Calico
overview: Configure Pod Network with Calico

order: 10

layout: docs2020
type: markdown
---

In order to enable Pods to communicate with the rest of the cluster, you will need to install a networking plugin. There are a large number of possible networking plugins for Kubernetes. SLATE clusters generally use [Calico](https://www.tigera.io/project-calico/), although other options should work as well.

## Choose Manifest

Creating a dual-stack Kubernetes requires customizing the Calico manifests. Read through [Install Calico networking and network policy for on-premises deployments](https://projectcalico.docs.tigera.io/getting-started/Kubernetes/self-managed-onprem/onpremises) to familiarize yourself with the different manifest options.

For the sake of simplicity we will work through the [Install Calico with Kubernetes API datastore, 50 nodes or less](https://projectcalico.docs.tigera.io/getting-started/Kubernetes/self-managed-onprem/onpremises#install-calico-with-Kubernetes-api-datastore-50-nodes-or-less) option below.

## Configure Calico

1. Download the manifest.
   ```shell
   cd /tmp && \
   curl https://projectcalico.docs.tigera.io/manifests/calico.yaml -O 
   ```
   {:data-add-copy-button='true'}

2. Follow the steps described in [Calico: Enable dual stack](https://projectcalico.docs.tigera.io/networking/ipv6#enable-dual-stack) to configure `calico-config` and `calico-node`.

3. Replace the following in `calico-config`:

     | Placeholder                  | Example Value                  |
     | ---------------------------- | ------------------------------ |
     | `"__Kubernetes_NODE_NAME__"` | `"${HOSTNAME}"`                |
     | `__CNI_MTU__`                | `1500`                         |
     | `"__KUBECONFIG_FILEPATH__"`  | `"/etc/Kubernetes/admin.conf"` |

4. Recall your values for the following from [Initialize Kubernetes](/docs/cluster/manual/slate-master-node/initialize-kubernetes.html):
   
   * `CLUSTER_CIDR`
   * `controllerManager.extraArgs.node-cidr-mask-size-ipv4`
   * `controllerManager.extraArgs.node-cidr-mask-size-ipv6`
   
   With these values in mind update the `calico-node` environmental variables to match. For example:

   ```shell
   - name: CALICO_IPV4POOL_CIDR
     value: "10.10.0.0/16"
   - name: CALICO_IPV4POOL_BLOCK_SIZE
     value: "24"
   - name: CALICO_IPV6POOL_CIDR
     value: "fc00:db8:1234:5678:8:2::/104"
   - name: CALICO_IPV6POOL_BLOCK_SIZE
     value: "120"
   ```
   {:data-add-copy-button='true'}

5. If multiple interfaces exist on a node it may become necessary to tell Calico which interface to use for IPv4 and IPv6. In the following example Calico will use `eth1`:

   ```shell
   - name: IP_AUTODETECTION_METHOD
     value: "interface=eth1"
   - name: IP6_AUTODETECTION_METHOD
     value: "interface=eth1"
   ```
   {:data-add-copy-button='true'}

   To read more about Calico and auto-detection, visit [Configure IP autodetection](https://projectcalico.docs.tigera.io/networking/ip-autodetection).

## Install Calico

Install Calico by applying the modified manifest file:

```shell
kubectl apply -f /tmp/calico.yml
```
{:data-add-copy-button='true'}

## Calico CLI

**While optional**, we recommend installing `calicoctl`, the command line tool for Calico, for administrative needs.

1. Follow the steps described in [Install calicoctl as a Kubernetes pod](https://projectcalico.docs.tigera.io/maintenance/clis/calicoctl/install#install-calicoctl-as-a-Kubernetes-pod) for the Kubernetes API datastore.

2. Add the suggested alias for `calicoctl`:

   ```shell
   alias calicoctl="kubectl exec -i -n kube-system calicoctl -- /calicoctl"
   ```
   {:data-add-copy-button='true'}

To read more about `calicoctl`, visit [calicoctl user reference](https://projectcalico.docs.tigera.io/reference/calicoctl/overview).

{% include doc-next-link.html content="/docs/cluster/manual/slate-master-node/validate-dual-stack.html" %}