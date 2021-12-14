---
title: Kubernetes Certificates
overview: 
index: false

layout: docs2020
type: markdown
---

{% include section-index.html %}

To renew the Kubernetes certificates, you can use the below commands (or refer to the official kubernetes documentation [Certificate Management with kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/) for more details on this):

### Certificate Renewal

To renew all certs for clusters with kubernetes version 1.19 or earlier, run:

	$ kubeadm alpha certs renew all
	
And for clusters running kubernetes version 1.20 or above, run: 

	$ kubeadm certs renew all

### Renewal Check

To verify that certs have been renewed for clusters with kubernetes version 1.19 or earlier, run the below command:

	$ kubeadm alpha certs check-expiration

And for cluster running kubernetes version 1.20 or above, run:

	$ kubeadm certs check-expiration
