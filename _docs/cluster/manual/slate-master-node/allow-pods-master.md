---
title: Allow Pods on Master
overview: Allow Pods on Master

order: 10

layout: docs2020
type: markdown
---

{% include alert/note.html content="This step is optional for multi-node installations of Kubernetes, but required for single-node installations." %}

If you are running a single-node SLATE cluster, you'll want to remove the `NoSchedule` taint from the Kubernetes control-plane. This will allow general workloads to run along-side of the Kubernetes master node processes.

In larger clusters, it may instead be desirable to prevent "user" workloads from running on the control-plane, especially on very busy clusters where the Kubernetes API is servicing a large number of requests. If you are running a large, multi-node cluster then you may want to skip this step.

To remove the `master` taint:

```shell
kubectl taint nodes --all node-role.kubernetes.io/master-
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/slate-master-node/configure-pod-network.html" %}