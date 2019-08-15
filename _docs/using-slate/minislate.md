---
title: MiniSLATE 
overview: Running a completely self-contained SLATE instance in your development environment

order: 30 

layout: docs
type: markdown
---

## Purpose

MiniSLATE a utility designed to allow users to run a completely self-contained SLATE cluster on local machines, for use with application development. The MiniSLATE environment spins up the four docker-compose containers necessary for a full local SLATE environment:

- [A Docker-in-Docker Kubernetes node](https://github.com/slateci/minislate/blob/master/kube/Dockerfile)
- [A SLATE management container](https://github.com/slateci/minislate/blob/master/slate/Dockerfile)
- [A DynamoDB container](https://hub.docker.com/r/dwmkerr/dynamodb) used by the SLATE API server
- [A storage container simulating an NFS share](https://hub.docker.com/r/itsthenetwork/nfs-server-alpine)

Installing MiniSLATE will allow users to develop in a completely local environment before running applications on production clusters.

## Installation

Installation instructions can be found on the [MiniSLATE development repository](https://github.com/slateci/minislate).
