---
title: SLATElite
overview: Creating and federating a single-node cluster on your development environment 

order: 40

layout: docs
type: markdown
---

## Purpose
SLATElite is a utility used to create a single-node SLATE cluster joined to the general SLATE federation. The SLATElite utility will spin up three docker-compose containers on your machine, and join your machine to the larger SLATE federation. These containers consist of:

- [A docker-in-docker Kubernetes node](https://github.com/slateci/slatelite/blob/master/kube/Dockerfile)
- [A SLATE management container](https://github.com/slateci/slatelite/blob/master/slate/Dockerfile)
- [A storage container simulating an NFS share](https://hub.docker.com/r/itsthenetwork/nfs-server-alpine)

SLATElite is a good option to quickly test out running an edge cluster. For heavier-duty use, particularly to build a cluster with multiple nodes, see the guide for [direct installation]({{home}}/docs/cluster-install/cluster-install.html). 

## Installation

Installation instructions can be found on the [SLATElite development repository](https://github.com/slateci/slatelite).