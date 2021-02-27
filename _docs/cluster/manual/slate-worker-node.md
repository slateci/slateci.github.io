---
title: SLATE Worker Node
overview: SLATE Worker Node

order: 10  

layout: docs2020
type: markdown
---

To distribute work assigned to a SLATE cluster, worker nodes can be networked to a SLATE Master node.

All SLATE Worker nodes should be set up using the "Setting Up a SLATE Node" instructions above.

### KubeADM Join

On your Master node, run the following command to get a full join command for the Master's cluster:

```
kubeadm token create --print-join-command
```

Run this generated join command on the worker node to join it to the cluster.

<a href="/docs/cluster/manual/cluster-federation.html">Next Page</a>