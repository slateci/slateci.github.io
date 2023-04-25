---
title: "OpenTelemetry in SLATE"
overview: How SLATE uses OpenTelemetry
published: true
permalink: blog/2023-04-21-opentelemetry.html
attribution: Suchandra Thapa
layout: post
type: markdown
tag: draft
---

The SLATE binaries and API server requires a fairly complex environment in order
to build successfully.  In order to provide a standardized build environment that 
can be reproducably used in various contexts, the SLATE project uses a 
containerized environment for development and for building binaries for production 
usage. We'll describe the environment and how we use it in this blog post.

<!--end_excerpt-->


## Background
