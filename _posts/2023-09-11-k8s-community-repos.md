---
title: "Kubernetes Repo Changes"
overview: Kubernetes Community Changes Package Repositories
published: true
permalink: blog/2023-09-11-k8s-community-repos.html
attribution: Adam Griffith
layout: post
type: markdown
---

The Kubernetes community has changed to community-owned package repositories. Learn how to update your SLATE clusters in this blog.

<!--end_excerpt-->

## What Changed?

* [Kubernetes Legacy Package Repositories Will Be Frozen On September 13, 2023](https://kubernetes.io/blog/2023/08/31/legacy-package-repository-deprecation/)
* [pkgs.k8s.io: Introducing Kubernetes Community-Owned Package Repositories](https://kubernetes.io/blog/2023/08/15/pkgs-k8s-io-introduction/)

## How does this affect us as SLATE Administrators?

The amount of work to change over to the new package repositories is relatively small.

1. SSH to your SLATE Cluster master node.

2. Execute the following to update the package repository file for Kubernetes `1.24.x`.

   ```shell
   export KUBE_VERSION=1.24 && \
   cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
   [kubernetes]
   name=Kubernetes
   baseurl=https://pkgs.k8s.io/core:/stable:/v${KUBE_VERSION}/rpm/
   enabled=1
   gpgcheck=1
   gpgkey=https://pkgs.k8s.io/core:/stable:/v${KUBE_VERSION}/rpm/repodata/repomd.xml.key
   EOF
   ```
   {:data-add-copy-button='true'}

3. Close the connection and repeat the previous command on each of your worker nodes.

4. Continue to update patch versions of the various Kubernetes `1.24.x` packages normally through commands like `yum update ...` or `dnf update ...`.