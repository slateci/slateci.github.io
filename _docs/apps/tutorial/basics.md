---
title: Background Knowledge
overview: Necessary Background Knowledge

order: 20

layout: docs
type: markdown
---

<html>
<head>
  <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.0/dist/semantic.min.css"> -->
  <title>Helm</title>
</head>
<body>
          <div class="content">
              <div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Containers</h3>
                          <p> Containers are applications that have been packaged along with all their dependencies including operating system and operational files. Including these dependencies allows a container to run independently within a "walled garden" on devices. </p>
                          <p> Containers are excellent for distributed systems environments because they allow services to be run system-agnostically. Services can be deployed to servers running different operating systems, with the only changes between each being the mapping of files and network devices to the container. </p>
                          <p> The most pervasive containerization platform is Docker. Docker will allow users to containerize applications, and run those containers. For SLATE, many of the applications we are looking to bring to the platform may already be containerized in some way, but need to be pacakged according to SLATE deployment needs. For this reason, we won't focus on how to containerize an application. </p>
                          <a href="https://www.docker.com/resources/what-container" class="ui gray button" role="button"> More Resources </a>
                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Kubernetes</h3>
                          <p> Kubernetes is a container management and orchestration platform for distributed systems. Kubernetes runs containers that have been built by technologies like docker on multiple devices. It handles scheduling, resource control, desired state, and more.</p>
                          <p> Most of the SLATE concepts revolve around the basic functions of Kubernetes, so this will be broken into many parts throughout the tutorial. Additionally, Kubernetes is a very large platform that has an ever-increasing number of capabilities. As you go through this tutorial, we will target only the basic functionalities needed to start contributing to the SLATE catalog and understanding the infrastructure of SLATE. </p>
                          <a href="https://kubernetes.io/docs/concepts/" class="ui gray button" role="button"> More Resources </a>
                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Nodes</h3>
                          <p> A Node is a Kubernetes unit of hardware. Each machine connected to Kubernetes is considered a Node. Applications get scheduled to run on a node based on availability and resources. These can represent bare metal servers, virtual machines, or hosted devices from cloud providers. </p>
                          <a href="https://kubernetes.io/docs/concepts/architecture/nodes/" class="ui gray button" role="button"> More Resources </a>
                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Clusters</h3>
                          <p> A Kubernetes Cluster is a collection of Nodes being orchestrated and managed together. Users generally interact with Kubernetes on the Cluster level, which then manages scheduling and distribution across the Nodes. </p>
                          <p> If one Node within a Cluster falls into an unreachable or unknown state, the Cluster will both attempt to repair the state of it, and redirect applications as needed to other nodes in order to maintain liveness. </p>
                          <a href="https://kubernetesbootcamp.github.io/kubernetes-bootcamp/1-1.html" class="ui gray button" role="button"> More Resources </a>
                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Namespaces</h3>
                          <p> Namespaces are a part of Kubernetes, inspired by Linux namespaces, that creates a virtual Cluster within a real Physical Cluster. Most Kubernetes resources exist within specific namespaces, and names must be unique within that resource type for that Namespace. Namespaces can also be used with policy rules to prevent one group of users from adjusting or even seeing another Namespace's resources. </p>
                          <a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/" class="ui gray button" role="button"> More Resources </a>
                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Federation</h3>
                          <p> A Federation is a set of Kubernetes Clusters being managed by one central commanding station or management group. These Clusters can be managed invidividually, but from a single control plane. This allows fewer points of interaction, and a greater ability to deploy services across multiple Clusters if necessary. </p>
                          <p> Kubernetes has a Federation, but for the SLATE project, we are implementing our own pseudo-federation. The Clusters are managed from the SLATE control plane, which implements some restrictions on it's own occupancy of a Cluster to ensure security for hardware providers. </p>
                          <a href="https://kubernetes.io/docs/concepts/cluster-administration/federation/" class="ui gray button" role="button"> More Resources </a>
			  </div>
			</div>
              </div>
</body>
</html>
