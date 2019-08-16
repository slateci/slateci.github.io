---
title: SLATElite
overview: Creating and federating a single-node cluster on your development environment 

order: 40

layout: docs
type: markdown
---

## Purpose
SLATElite is a utility used to create a single-node SLATE cluster joined to the general SLATE federation. The SLATElite utility will spin up docker-compose on your machine to containers. These include:

- [A docker-in-docker Kubernetes node](https://github.com/slateci/slatelite/blob/master/kube/Dockerfile)
- [A SLATE management container](https://github.com/slateci/slatelite/blob/master/slate/Dockerfile)
- [A storage container simulating an NFS share](https://hub.docker.com/r/itsthenetwork/nfs-server-alpine)

## Installation

Installation instructions can be found on the [SLATElite development repository](https://github.com/slateci/slatelite).