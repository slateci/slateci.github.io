---
title: Technology
overview: Technology used by SLATE

order: 10

layout: about
type: markdown
---
# SLATE Technology
<hr>

<div class="row">
<div class="col-lg-3 col-md-3 col-sm-12">
	<div class="logo-image"><img width="100%" src="/img/docker_logo.png" /></div>
</div>
	<div class="col-lg-9 col-md-8 col-sm-12">
	<p class="technology-justify"><a href="https://www.docker.com/">Docker</a> is the primary container runtime environment used in SLATE. Our clusters run docker containers orchestrated by Kubernetes. The Docker Engine provides the necessary operating system level abstractions to enable containers. Docker is the world leader in the containerization. With a strong open-source community, it was our choice for running containers in SLATE</p>
	</div>
</div>

<hr>

<div class="row">
	<div class="col-lg-9 col-md-9 col-sm-12">
		<p class="technology-justify"><a href="https://kubernetes.io/">Kubernetes</a> facilitates the underlying container orchestration done by SLATE. Kubernetes, sometimes abbreviated K8s, is the open-source leader in deployment, management, and automation of containers. Kubernetes abstracts container workloads into deployments and services that can be connected using a simple internal networking model. The SLATE client provides granular secure access to the Kubernetes control plane, and allows the management of multiple geographically disparate clusters at once.</p>
	</div>
	<div class="col-lg-3 col-md-3 col-sm-12"><img src="/img/Kubernetes-logo.png" /></div>
</div>
<hr>
<div class="row">
	<div class="col-lg-3 col-md-3 col-sm-12"><img width="100%" src="/img/helm-logo-1.jpg" /></div>
	<div class="col-lg-9 col-md-9 col-sm-12">
		<p class="technology-justify"><a href="https://helm.sh/">Helm</a> is used to manage SLATE applications housed in our application catalog. Helm is known as the package manager for Kubernetes. Helm is used to bring together the multiple Kubernetes specs required to run a single application and present it in a complete package called a chart. Helm provides a powerful templating engine that allows us to build a great deal of customizability into our applications. Helm is essential for tying our container technologies together.</p>
	</div>
</div>
<hr>
<div class="row">
	<div class="col-lg-12 col-md-12 col-sm-12"><img src="/img/ScienceDMZ.png" /></div>
	<div class="col-lag12 col-md-12 col-sm-12">
		<p class="technology-justify">
High-performance networking utilized by SLATE is made possible by the ScienceDMZ network model. The <a href="https://fasterdata.es.net/science-dmz/">ScienceDMZ</a> is a segment of an institution’s network with equipment configuration and security policies that are optimized for scientific computing. The ScienceDMZ model was developed by the engineers at <a href="http://es.net/">ESnet</a>. The model includes specialized data transfer systems, performance measurement utilities, and specialized architecture. SLATE clusters are designed to operate within the host institution’s ScienceDMZ.
</p>
	</div>
</div>
<hr>

<div class="row">
	<div class="col-lg-4 col-md-4 col-sm-12 text-centered">
		<img class="img-fluid" style="width: 80%" src="/img/slate-logo.png" />
	</div>
	<div class="col-lg-8 col-md-8 col-sm-12 tech-paragraph">
		<p>
			The <a href="https://gitlab.com/ucsd-prp/nrp-controller">NRP-Controller</a> is a tool which enables federating Kubernetes clusters with limited permissions. This means that an external entity (like the SLATE federation) can be granted access to only part of a Kubernetes cluster, allowing both multi-tenancy, in that SLATE can coexist with other uses of the same clusters, and helping local cluster administrators retain full control of their clusters when participating in SLATE.
		</p>
		<br>
	</div>
</div>
<div class="row">
	<div class="col-lg-12 col-md-12 col-sm-12">

		<p align="justify">
				The SLATE Federation is tied together by a custom component called the <b>SLATE API Server</b>. This provides a uniform interface for all users of SLATE to make requests to use and manage resources participating in the Federation. It enforces access control rules so that resource providers can regulate which groups on SLATE can run services on their cluster, along with services they may run. SLATE provides both the <a href="/docs/tools/">SLATE Command Line Client</a> and the <a href="https://portal.slateci.io/dashboard">SLATE Dashboard</a> to interact with this API.
		</p>

	</div>
</div>

<hr>
<div class="row">
<div class="col-lg-3 col-md-3 col-sm-12">
	<img src="/img/globus-250x90.svg" />
</div>
	<div class="col-lg-9 col-md-9 col-sm-12">
		<p class="technology-justify">
Our portal and identity management are derived from the <a href="https://www.globus.org/">Globus</a> Modern Research Data Portal.
</p>
	</div>
</div>
