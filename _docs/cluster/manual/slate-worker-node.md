---
title: SLATE Worker Node
overview: SLATE Worker Node

order: 10  

layout: docs2020
type: markdown
---

To distribute work assigned to a SLATE cluster, worker nodes can be networked to a SLATE master node.
* To configure a SLATE worker node, you must first go through the previous pages in [Manual Cluster Installation](/docs/cluster/index.html) (excluding the master node page).

## Joining the Cluster

On your master node, run the following command to get a full join command for the master's cluster:

```shell
kubeadm token create --print-join-command
```
{:data-add-copy-button='true'}

Run this generated join command on the worker node to join it to the cluster.

{% include doc-next-link.html content="/docs/cluster/manual/cluster-federation.html" %}
