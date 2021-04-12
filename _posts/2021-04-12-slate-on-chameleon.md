---
title: "Deploying a SLATE Cluster on Chameleon"
overview: A guide to running a SLATE cluster on Chameleon.
published: true
permalink: blog/slate-on-chameleon.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

Chameleon is an OpenStack-based research platform for provisioning compute and networking resources.

<!--end_excerpt-->


## Chameleon Setup

To run a SLATE cluster on [Chameleon](https://www.chameleoncloud.org/), you must first have access to a Chameleon account, as well as be on an existing Chameleon project. 
The [Chameleon Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html) contains lots of useful information about this.

Once you have access to the Chameleon testbed, create a reservation for one instance and one floating public IP address. Then, instantiate one CentOS 7 instance, and associate the previously allocated floating public IP to this instance. More detailed instructions regarding this process can also be found in the [Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html). If you would like to setup a multiple-node cluster, provision additional machines at this time.

Now, we are ready to set up a Kubernetes cluster on this machine.


## Cluster Setup

To create a Kubernetes cluster and register it with SLATE, follow documentation [here](https://slateci.io/docs/cluster/automated/introduction.html), with a few changes.

First, make sure MetalLB is disabled. 

Second, follow the additional configuration steps for setting up a cluster behind a NAT (for one-to-one NATs). 

Instructions for both of these things can be found in the [additional configurations](https://slateci.io/docs/cluster/automated/additional-configs.html) section of the docs. Make sure to not forget the `supplementary_addresses_in_ssl_keys` variable.

Third, make sure any firewalls are disabled. On Chameleon, `ufw` is often running, even on CentOS. Disable it with `sudo ufw disable`.

Finally, to run the Ansible playbook (run in `kubespray` directory):
```bash
ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> cluster.yml
```


### SLATE Registration

To register the previously created Kubernetes cluster with SLATE, navigate to the `slate-ansible` directory, and run the following command:
```bash
ansible-playbook -i /path/to/kubespray/inventory/<CLUSTER_NAME>/hosts.yaml -u <SSH_USER> --become --become-user=root \
 -e 'slate_cli_token=<SLATE_CLI_TOKEN>' \
 -e 'slate_cli_endpoint=<SLATE_API_ENDPOINT>' \
 -e 'cluster_access_ip=<EXTERNAL_NAT_IP>:6443' \
 -e 'slate_enable_ingress=false' \
 site.yml
```

After this command runs, you should have a SLATE cluster!


## Limitations

Currently, SLATE on Chameleon does not support a floating-IP address provisioner (MetalLB on most SLATE clusters). Thus, most OSG applications cannot be run. Additionally, the functionality of the ingress controller present on most SLATE clusters will be limited.


## Additional Components

### Ingress Controller - NodePort
	
Due to some current limitations of Chameleon, a fully-operational ingress controller cannot be installed. 
However, there is a workaround, but it requires all ingress traffic to be routed though a NodePort service on the main node IP.
This means all ingress requests must have the ingress controller NodePort appended to their URL.

To install the ingress controller, login to a cluster node with `kubectl` access, and download the following Kubernetes manifest:
```bash
curl -o deploy.yaml https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/baremetal/deploy.yaml`
```

Next, open this file with your preferred editor, and navigate to the line that contains this argument: `--ingress-class=nginx`
Change this `ingress-class` parameter from `nginx` to `slate`. 

Finally, deploy the ingress controller with `kubectl`:
```bash
kubectl apply -f /path/to/deploy.yaml
```

At this point, you will have an operational ingress controller. All that remains is to see which ports the ingress controller is running on. This can be done with `kubectl get services -n ingress-nginx`. 
You will see an `ingress-nginx-controller` NodePort service, with ports 80 and 443 mapped to two different high ports. One of these ports (80 is http, 443 is https) must be appended to any and all requests using the ingress controller.


### Ingress Controller - Separate IP

*in progress*

It is possible to create a slightly more functional SLATE cluster on Chameleon by provisioning another IP manually.

* Create an extra network
* Set up reservation with a node that has two NICs
* Associate both networks with instance upon launch
* Associate two public IPs with instance


## Contact Us

If you have any additional comments or questions, please contact [our team](https://slateci.io/community/)!

