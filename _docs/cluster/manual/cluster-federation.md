---
title: Cluster Federation
overview: Cluster Federation

order: 10  

layout: docs2020
type: markdown
---

At this point, you should have a SLATE-Ready Kubernetes cluster. You will now be able to join your cluster to the SLATE Federation.

## SLATE CLI

The SLATE Command Line Interface will let you execute SLATE commands (see [Optain a SLATE Token](/docs/cluster/manual/slate-token.html) for installation instructions).

## Joining the Federation

On the Master node for your cluster, execute:

```shell
slate cluster create <NEW-CLUSTER-NAME> --group <YOUR-GROUP-NAME> --org <YOUR-ORG-NAME> -y
```
{:data-add-copy-button='true'}

## Update Cluster Location

All SLATE clusters should have their geographic locations listed in the cluster's attributes.

```shell
slate cluster update [YOUR-CLUSTER-NAME] --location [LATITUDE],[LONGITUDE]
```
{:data-add-copy-button='true'}

## Allow Group Access

Cluster administrators can grant cluster access to specific groups.

```shell
slate cluster allow-group <YOUR-CLUSTER-NAME> '<[>GROUP-NAME>'
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/troubleshooting.html" %}