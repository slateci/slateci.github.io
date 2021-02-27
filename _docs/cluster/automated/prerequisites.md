---
title: Prerequisites
overview: Prequisites for Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown

---

Ansible can be executed anywhere (your laptop, OOB machine, etc), including on a machine that is to be part of your Kubernetes cluster.
The host that is executing Ansible is referred to as the "Ansible executor" in these prerequisites.

### Ansible & Kubespray

- On each machine that is to part of the cluster, you have a user (`<SSH_USER>`) with key-based SSH access *and* passwordless sudo access.
  - The Ansible executor must be able to SSH into each machine in the cluster as this `<SSH_USER>` using an SSH key.
- Must have Ansible version >= 2.9 and &lt; 2.10 installed on the Ansible executor.
- Clone of Kubespray on the Ansible executor: `git clone https://github.com/kubernetes-sigs/kubespray.git -b v2.15.0`
- Kubespray Python dependencies installed: `sudo pip3 install -r requirements.txt` or `sudo pip install -r requirements.txt`

### Kubernetes

- Kubernetes packages are not installed on any machine that is to be part of the cluster.
  - You can remove these with `sudo yum remove 'kube*' -y`.
  - We recommend also removing the Kubernetes repo if it exists.
- The current `systemd` version on every machine to be part of the cluster supports `TaskAccounting`.
  - For CentOS 7, this is systemd version `>=219-37`.
  - For other distributions, this is systemd version `>=227`.
- [For MetalLB] At least one publicly routable, floating (i.e. not assigned) IP address.

### SLATE

- Clone of SLATE registration playbook on the Ansible executor: `git clone https://github.com/slateci/slate-ansible.git`
- SLATE token obtained from the [CLI access page](https://portal.slateci.io/cli).
