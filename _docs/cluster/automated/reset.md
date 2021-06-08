---
title: Reset Kubernetes Cluster
overview: Reset Kubernetes Cluster

order: 10
layout: docs2020
type: markdown
---

If you want to wipe your Kubernetes cluster and start from scratch (e.g. if your cluster was put into a bad state), you can run the following command:

`ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> reset.yml`

If your cluster is registered with SLATE, ensure you delete the cluster from SLATE _first_ by using `slate cluster delete <CLUSTER_NAME>`.

[Previous](/docs/cluster/automated/kubernetes-cluster-creation.html) / [Next](/docs/cluster/automated/upgrades-adding-nodes.html)
