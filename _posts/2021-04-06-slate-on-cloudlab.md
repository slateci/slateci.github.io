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
It can be leveraged to provide the resources upon which a SLATE cluster can run.
This post will outline the process of setting up this SLATE cluster.
More information about CloudLab can be found [here](https://www.cloudlab.us/).

<!--end_excerpt-->


## Prerequisites

To begin, CloudLab access is necessary.
Instructions for obtaining an account can be found [here](http://docs.cloudlab.us/users.html).
Request to join the [SLATE](https://www.cloudlab.us/show-project.php?project=SLATE) CloudLab project.

Additionally, a SLATE account and CLI credentials are necessary.

A SLATE account can be created [here](https://portal.slateci.io/slate_portal).
Click button that says "Sign Up" in the top right corner, and follow the prompts.

Once signed in to SLATE, you can access your SLATE CLI token [here](https://portal.slateci.io/cli).
This token is for the SLATE production API, and corresponds with an API endpoint of `https://api.slateci.io:443`.

For more information about getting started with SLATE, consult our quick-start guide [here](https://slateci.io/docs/quickstart/).

Additionally, comprehensive documentation for CloudLab can be found [here](http://docs.cloudlab.us/).


## Launching CloudLab Experiment

Next, a CloudLab experiment must be created.
This experiment will contain the compute and networking resources needed to launch a SLATE cluster.
Several CloudLab profiles have already been created to make this process easier.

Current SLATE-on-CloudLab profiles are listed here:
* [cloudlab-slate](https://www.cloudlab.us/show-profile.php?uuid=6ab61da6-97c2-11eb-b1eb-e4434b2381fc)
* [30-cluster-bring-up](https://www.cloudlab.us/show-profile.php?uuid=bfb6a8ec-0361-11eb-b7c5-e4434b2381fc)
* [slate-single-node-cluster](https://www.cloudlab.us/show-profile.php?uuid=a0e779b6-1435-11eb-b7c5-e4434b2381fc)
* [slate-three-node-cluster](https://www.cloudlab.us/show-profile.php?uuid=93f70990-034c-11eb-b7c5-e4434b2381fc)
* [slate-vm-cluster](https://www.cloudlab.us/show-profile.php?uuid=77e8915c-01d7-11eb-b7c5-e4434b2381fc)

For simplicity, we will be using the [`cloudlab-slate`](https://www.cloudlab.us/show-profile.php?uuid=6ab61da6-97c2-11eb-b1eb-e4434b2381fc) profile.
This profile will bring up a single CENTOS 7 bare-metal node, as well as allocate a variable number of additional floating IPs.

To instantiate this profile, navigate to [this](https://www.cloudlab.us/instantiate.php) page.
Click the "Change Profile" button, and select the `cloudlab-slate` profile from the list of options.
Next, you will be asked how many additional public IPs to allocate.
Leave this at the default value, which is 2.
Click next, and then select a cluster to install this profile on. Any CloudLab cluster should be fine.
After clicking next again, set an experiment duration (the default of 16 hours is OK).
Finally, click "Finish" and wait for your experiment to fully spin up.

If you require more guidance instantiating your experiment, CloudLab has additional documentation [here](https://docs.cloudlab.us/getting-started.html).


*Note:
Additional custom profiles can also be used;
however, for full functionality, there are a few recommended guidelines. 
First, although many different Linux distributions can be used, the SLATE team recommends CentOS 7.
Second, an additional pool of floating public IP addresses must be allocated for ingress and OSG applications to work.
The CloudLab documentation has instructions for this [here](http://docs.cloudlab.us/advanced-topics.html#%28part._dynamic-public-ip%29).*


## Kubernetes Cluster Creation / SLATE Registration

Once our CloudLab experiment/instances have fully spun up, we can begin installing Kubernetes on the node(s).

The SLATE team recommends that [Kubespray](https://kubespray.io/#/) be used for this.

Follow the official SLATE instructions [here](https://slateci.io/docs/cluster/automated/introduction.html) to install Kubernetes with Kubespray.
The standard installation instructions can be followed exactly, with the exception of making changes to accommodate a single-node cluster if necessary.

Once the Kubernetes cluster is operational, we can finally register it with SLATE!
There is another Ansible playbook that has been developed to make this process easy as well.

The guide listed above will also cover the SLATE registration process [here](https://slateci.io/docs/cluster/automated/kubernetes-cluster-creation.html#slate-cluster-registration).


## Testing

To verify cluster install, the Nginx SLATE application can be deployed.
Do this by running `slate app install nginx --cluster <your_cloudlab_cluster> --group <your_slate_group>`.
If everything has been done properly, your SLATE cluster on CloudLab should now be serving an Nginx page!


## Limitations

If you registered your SLATE cluster with the `slate-dev` API server,
SLATE will not automatically configure DNS records for ingress into your cluster.
This must then be done outside of SLATE.


## Contact Us

Contact the SLATE team [here](https://slateci.io/community/).


