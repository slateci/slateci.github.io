---
title: Technology
overview: Technology used by SLATE

order: 10

layout: about
type: markdown
---
# SLATE Technology
<hr>

<div class="left-image">
	<div class="logo-image"><img width="100%" src="/img/docker_logo.png" /></div>
	<div class="tech-paragraph">
	<p>Docker is the primary container runtime environment used in SLATE. Our clusters run docker containers orchestrated by Kubernetes. The Docker Engine provides the necessary operating system level abstractions to enable containers. Docker is the world leader in the containerization. With a strong open-source community, it was our choice for running containers in SLATE</p>
	</div>
</div>

<hr>

<div class="right-image">
	<div class="tech-paragraph">
		<p>Kubernetes facilitates the underlying container orchestration done by SLATE. Kubernetes, sometimes abbreviated K8s, is the open-source leader in deployment, management, and automation of containers. Kubernetes abstracts container workloads into deployments and services that can be connected using a simple internal networking model. The SLATE client provides granular secure access to the Kubernetes control plane, and allows you to manage multiple geographically disparate clusters at once.</p>
	</div>
	<div class="logo-image"><img src="/img/Kubernetes-logo.png" /></div>
</div>
<hr>
<div class="left-image">
	<div class="logo-image"><img width="100%" src="/img/helm-logo-1.jpg" /></div>
	<div class="tech-paragraph">
	<p>Helm is used to manage SLATE applications housed in our application catalog. Helm is known as the package manager for Kubernetes. Helm is used to bring together the multiple Kubernetes specs required to run a single application and present it in a complete package called a chart. Helm provides a powerful templating engine that allows us to build a great deal of customizability into our applications. Helm is essential for tying our container technologies together.</p>
	</div>
</div>
<hr>
<div class="top-image">
	<div class="top-image"><img src="/img/ScienceDMZ.png" /></div>
	<div class="tech-paragraph">
		<p>
High-performance networking utilized by SLATE is made possible by the ScienceDMZ network model. The ScienceDMZ is a segment of an institution’s network with equipment configuration and security policies that are optimized for scientific computing. The ScienceDMZ model was developed by the engineers at ESnet. The model includes specialized data transfer systems, performance measurement utilities, and specialized architecture. SLATE clusters are designed to operate within the host institution’s ScienceDMZ.
</p>
	</div>
</div>
<hr>

<div class="top-image-small">
	<div><img src="/img/globus-250x90.svg" /></div>
	<div class="tech-paragraph">
		<p>
Our portal and identity management are derived from the Globus Modern Research Data Portal.
</p>
	</div>
</div>
