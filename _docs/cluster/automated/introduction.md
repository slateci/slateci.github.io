---
title: Installing Kubernetes with Ansible & Kubespray 
overview: Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown

---

Kubespray is an Ansible playbook developed to automate Kubernetes cluster deployments (including system tuning, Docker installation, etc) with significant community backing.
We have found Kubespray to be significantly less painful than tools like `kubeadm` for cluster deployments and recommend new cluster installs using these playbooks.

Further, Kubespray has the added benefit of being able to handle scenarios like adding/replacing nodes to the cluster, upgrading your Kubernetes cluster version, and configuring Kubernetes with different container runtimes.
For more information about these, please see the [Kubespray wiki](https://kubespray.io/).

SLATE builts on top of Kubespray by providing a playbook that works with the created Kubespray inventory file to automate cluster registration.

These instructions assume you are installing a Kubernetes cluster with MetalLB and Calico.
To configure the cluster without these or with other parameters, please read [Additional Configurations](#additional-configurations) first.