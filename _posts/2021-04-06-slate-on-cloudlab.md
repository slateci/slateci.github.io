---
title: "Deploying a SLATE Cluster on CloudLab"
overview: A guide to running a SLATE cluster on CloudLab.
published: true
permalink: blog/slate-on-cloudlab.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

CloudLab is a research platform for provisioning compute and networking resources.
It can be easily leveraged to provide the resources upon which a SLATE cluster can run.
This post will outline the process of setting up this SLATE cluster.
More information about CloudLab can be found [here](https://www.cloudlab.us/).

<!--end_excerpt-->


## Prerequisites

To begin, CloudLab access is necessary.
An account can be requested [here](https://cloudlab.us/signup.php).
Request to join the [SLATE](https://www.cloudlab.us/show-project.php?project=SLATE) CloudLab project.

Additionally, a SLATE account and CLI credentials are necessary.
Instructions for doing this can be found [here](https://slateci.io/docs/quickstart/).


## Launching CloudLab Experiment

Next, a CloudLab experiment must be created.
This experiment will contain the compute and networking resources needed to launch a SLATE cluster.
Several CloudLab profiles have already been created to make this process easier.

Useful profiles:
* [30-cluster-bring-up](https://www.cloudlab.us/show-profile.php?uuid=bfb6a8ec-0361-11eb-b7c5-e4434b2381fc)
* [slate-single-node-cluster](https://www.cloudlab.us/show-profile.php?uuid=a0e779b6-1435-11eb-b7c5-e4434b2381fc)
* [slate-three-node-cluster](https://www.cloudlab.us/show-profile.php?uuid=93f70990-034c-11eb-b7c5-e4434b2381fc)
* [slate-vm-cluster](https://www.cloudlab.us/show-profile.php?uuid=77e8915c-01d7-11eb-b7c5-e4434b2381fc)

For simplicity, we will be using the `slate-single-node-cluster` profile.

*Note:*
Additional custom profiles can also be used;
however, for full functionality, there are a few recommend guidelines. 
First, although many different Linux distributions can be used, the SLATE team recommends CentOS 7.
Second, an additional pool of floating public IP addresses must be allocated for ingress and OSG applications to work.


## Kubernetes Cluster Creation

Once our CloudLab experiment/instances have fully spun up, we can begin installing Kubernetes on the node(s).

The SLATE team recommends that the [`kubespray`](https://kubespray.io/#/) tool be used for this.

Instructions can be found [here](https://slateci.io/docs/cluster/automated/introduction.html).


## SLATE Registration

Once our Kubernetes cluster is operational, we can finally register it with SLATE!
There is another Ansible playbook that has been developed to make this process easy as well.


## Testing

To verify cluster install, the Nginx SLATE application can be deployed.
Do this by running `slate app install nginx --cluster <your_cloudlab_cluster> --group <your_slate_group>`.
If everything has been done properly, your SLATE cluster on CloudLab should now be serving an Nginx page!


## Limitations

If you registered your SLATE cluster with the `slate-dev` API server, SLATE will not automatically configure DNS records for your cluster.
This must then be done outside of SLATE.


## Contact Us

Contact the SLATE team [here](https://slateci.io/community/).


