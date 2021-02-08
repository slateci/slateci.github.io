---
title: Reset 
overview: Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown
---

If you want to wipe your cluster and start from scratch (e.g. if your cluster was put into a bad state), you can run the following command:

`ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> reset.yml`