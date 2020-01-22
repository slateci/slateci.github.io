---
title: Background Knowledge
overview: Necessary Background Knowledge

order: 20

layout: docs2020
type: markdown
---

## Containers
Containers are applications that have been packaged along with all their dependencies including operating system and operational files. Including these dependencies allows a container to run independently within a "walled garden" on devices.

Containers are excellent for distributed systems environments because they allow services to be run system-agnostically. Services can be deployed to servers running different operating systems, with the only changes between each being the mapping of files and network devices to the container.

The most pervasive containerization platform is Docker. Docker will allow users to containerize applications, and run those containers. For SLATE, many of the applications we are looking to bring to the platform may already be containerized in some way, but need to be pacakged according to SLATE deployment needs. For this reason, we won't focus on how to containerize an application.

[More Resources](https://www.docker.com/resources/what-container)

## Kubernetes
Kubernetes is a container management and orchestration platform for distributed systems. Kubernetes runs containers that have been built by technologies like docker on multiple devices. It handles scheduling, resource control, desired state, and more.

Most of the SLATE concepts revolve around the basic functions of Kubernetes, so this will be broken into many parts throughout the tutorial. Additionally, Kubernetes is a very large platform that has an ever-increasing number of capabilities. As you go through this tutorial, we will target only the basic functionalities needed to start contributing to the SLATE catalog and understanding the infrastructure of SLATE.

[More Resources](https://kubernetes.io/docs/concepts/)


## Nodes

A Node is a Kubernetes unit of hardware. Each machine connected to Kubernetes is considered a Node. Applications get scheduled to run on a node based on availability and resources. These can represent bare metal servers, virtual machines, or hosted devices from cloud providers. 

[More Resources](https://kubernetes.io/docs/concepts/architecture/nodes/)

## Clusters

A Kubernetes Cluster is a collection of Nodes being orchestrated and managed together. Users generally interact with Kubernetes on the Cluster level, which then manages scheduling and distribution across the Nodes.

If one Node within a Cluster falls into an unreachable or unknown state, the Cluster will both attempt to repair the state of it, and redirect applications as needed to other nodes in order to maintain liveness.

[More Resources](https://kubernetesbootcamp.github.io/kubernetes-bootcamp/1-1.html)

## Namespaces
Namespaces are a part of Kubernetes, inspired by Linux namespaces, that creates a virtual Cluster within a real Physical Cluster. Most Kubernetes resources exist within specific namespaces, and names must be unique within that resource type for that Namespace. Namespaces can also be used with policy rules to prevent one group of users from adjusting or even seeing another Namespace's resources.

[More Resources](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

## Federation

A Federation is a set of Kubernetes Clusters being managed by one central commanding station or management group. These Clusters can be managed invidividually, but from a single control plane. This allows fewer points of interaction, and a greater ability to deploy services across multiple Clusters if necessary.

Kubernetes has a Federation, but for the SLATE project, we are implementing our own pseudo-federation. The Clusters are managed from the SLATE control plane, which implements some restrictions on it's own occupancy of a Cluster to ensure security for hardware providers.

[More Resources](https://kubernetes.io/docs/concepts/cluster-administration/federation/)
