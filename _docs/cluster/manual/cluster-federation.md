---
title: Cluster Federation
overview: Cluster Federation

order: 10  

layout: docs2020
type: markdown
---

At this point, you should have a SLATE-Ready Kubernetes cluster. You will now be able to join your cluster to the SLATE Federation.

### SLATE CLI

The SLATE Command Line Interface will let you execute SLATE commands.

On the Master node for your cluster, follow the [SLATE CLI](#) installation instructions.

### Joining the Federation

On the Master node for your cluster, execute

```
slate cluster create [NEW-CLUSTER-NAME] --group [YOUR-GROUP-NAME] --org [YOUR-ORG-NAME] -y
```

### Update Cluster Location

All SLATE clusters should have their geographic locations listed in the cluster's attributes.

```
slate cluster update [YOUR-CLUSTER-NAME] --location [LATITUDE],[LONGITUDE]
```

### Allow Group Access

Cluster administrators can grant cluster access to specific groups.

```
slate cluster allow-group [YOUR-CLUSTER-NAME] '[GROUP-NAME]'
```

<a href="/docs/cluster/troubleshooting.html">Next Page</a>