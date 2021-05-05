---
title: "Deploying a SLATE Cluster on Chameleon with MetalLB"
overview: A guide to running a SLATE cluster on Chameleon with MetalLB.
published: true
permalink: blog/metallb-on-chameleon.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

This blog post is intended as an optional follow-up to the ["SLATE On Chameleon"](https://slateci.io/blog/slate-on-chameleon.html) blog post.
If you have not read this initial post, it is helpful to read it first before beginning this one.


<!--end_excerpt-->


## Chameleon Setup

To run a SLATE cluster on [Chameleon](https://www.chameleoncloud.org/), you must first have access to a Chameleon account, as well as be on an existing Chameleon project. 
The [Chameleon Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html) contains lots of useful information about this.

Once you have access to the Chameleon testbed, you will need to select a specific site to run your Chameleon experiment on. 
The homepage for [Chameleon](https://www.chameleoncloud.org/) has a drop-down menu at the top titled "Experiment".
Click this menu, and observe the options under "Sites". There are currently three sites that your experiment can be instantiated at.
For installing a cluster on bare metal, which we will be doing in this post, select either "CHI@TACC" or "CHI@UC".
Selecting either of these will bring you to the Chameleon portal specific to that site.
Both sites' portals will be identical other than the resources they access.


### Network Setup

First, to create a SLATE cluster with MetalLB enabled internally in Chameleon,
we must set up a different private network that we control.
This is necessary because Chameleon's default "shared-net" will block MetalLB functionality. 
By default, to Chameleon, MetalLB looks like it is executing an ARP-spoofing attack.

To set up an additional network, we must first create a router. 
1. First, create a router in the Chameleon interface, and connect it to the public network.
1. Create an additional network (we like to name ours `slate-net` or something similar). The exact network is not important, but we used this one: 192.168.0.0/24. 
More documentation on setting up networks in Chameleon can be found [here](https://chameleoncloud.readthedocs.io/en/latest/technical/networks.html).
1. Create an interface on the router that connects to this new network.
1. Spin up instances, and in the "Network" section, make sure that the only network that is selected is our new network.

1. Disable all firewalls

### Disable OpenStack ARP-Spoofing Protection

This next step requires access to your Chameleon resources through the OpenStack CLI.

<!-- todo: add information about setting this up  -->

Once you have CLI access, use the following command to view the ID of your OpenStack/Chameleon port.
```bash
openstack port list
```

Then, disable ARP-spoofing protection for each one of your MetalLB IP addresses with this command:
```bash
openstack port set <port-id> --allowed-address ip-address=<additional-ip-address>
```
*Note that this command is not allowed on the main "shared-net".*

`openstack port set <port-id> --disable-port-security`
results in the following error: "ConflictException: 409: Client Error for url: https://chi.uc.chameleoncloud.org:9696/v2.0/ports/183c2e42-8d82-4263-9236-8b9a2cbcf376, Port Security must be enabled in order to have allowed address pairs on a port."


### Old Stuff

Once you are in the Chameleon portal, create a reservation for one instance and one floating public IP address. 
Then, instantiate one CentOS 7 instance.
There are multiple CentOS 7 instances available through Chameleon; choose the one titled `CC-CentOS7`.
Next, associate the previously allocated floating public IP to this instance. 

Detailed instructions regarding creating instances and associating IP addresses can be found in the [Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html).
If you are not familiar with Chameleon, it is recommended that you read this document and follow the instructions there.

### Additional Considerations
* You must create a reservation (which won't physically provision anything) before you can instantiate actual instances under that reservation.
* If there are no resources available at your selected site, try the other one. If there are still no resources available, you may have to wait until a later time.
* If you would like to setup a multiple-node cluster, provision additional machines at this time.


The instance(s) will take about 10 minutes to spin up.
Once they are done, we are ready to set up a Kubernetes cluster.

### Logging In

To login to any Chameleon node, log in as user `cc`, with `ssh cc@<PUBLIC_INSTANCE_IP>`.
This user should have password-less `sudo` access.
Before you go any further, make sure any firewalls are disabled, as they will impact cluster creation.
On Chameleon, `ufw` is often running, even on CentOS. 
Disable it with `sudo ufw disable`.


## Cluster Setup

To create a Kubernetes cluster and register it with SLATE, follow documentation [here](https://slateci.io/docs/cluster/automated/introduction.html), with a few changes.
Specifically, follow the instructions for setting up a cluster behind a NAT.

This will mean the following changes to cluster configuration:
* MetalLB will be disabled. 
* The `supplementary_addresses_in_ssl_keys` variable will need to be added.

<!-- TODO: update this link -->
<!-- Instructions for both of these things can be found in the [additional configurations](https://slateci.io/docs/cluster/automated/additional-configs.html) section of the docs. -->

To run the Ansible playbook (run in `kubespray` directory):
```bash
ansible-playbook -i inventory/<CLUSTER_NAME>/hosts.yaml --become --become-user=root -u <SSH_USER> cluster.yml
```

This playbook will take a while to run (around 10 minutes, depending).
Once it has finished, login to the node and run `sudo kubectl get nodes`.
If all nodes say that they are `Ready`, then Kubernetes cluster creation was successful!


### SLATE Registration

Currently, SLATE operates two separate federations, a development federation and a production federation.
When you register your cluster, you will need to decide which federation to register with.
By default, you will be given a token for the SLATE production endpoint.
If you would like to register your cluster with the production federation, then you simply use the default SLATE token given to you, 
and `https://api-dev.slateci.io:18080` as the `slate_cli_endpoint` parameter in the following command.

However, if you would like to register your cluster with the development federation, reach out to the SLATE team about obtaining a development token.
Once you have done this, the development API endpoint is `https://api.slateci.io:443`.

To register the previously created Kubernetes cluster with SLATE, navigate to the `slate-ansible` directory, and run the following command:
```bash
ansible-playbook -i /path/to/kubespray/inventory/<CLUSTER_NAME>/hosts.yaml -u <SSH_USER> --become --become-user=root \
 -e 'slate_cli_token=<SLATE_CLI_TOKEN>' \
 -e 'slate_cli_endpoint=<SLATE_API_ENDPOINT>' \
 -e 'cluster_access_ip=<EXTERNAL_NAT_IP>:6443' \
 site.yml
```

After this command runs, you should have a SLATE cluster!
Run `slate cluster list`, and if everything was successful, you should see your cluster listed in the output.


## Limitations

Currently, SLATE on Chameleon does not support a floating-IP address provisioner (MetalLB on most SLATE clusters). Thus, most OSG applications cannot be run. Additionally, the functionality of the ingress controller present on most SLATE clusters will be limited.


## Additional Components

### Ingress Controller - NodePort
	
Due to some current limitations of Chameleon, a fully-operational ingress controller cannot be installed. 
However, there is a workaround, but it requires all ingress traffic to be routed though a NodePort service on the main node IP.
This means all ingress requests must have the ingress controller NodePort appended to their URL.

To install the ingress controller, login to a cluster node with `kubectl` access, and download the following Kubernetes manifest:
```bash
curl -o deploy.yaml https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/baremetal/deploy.yaml
```

Next, open this file with your preferred editor, and navigate to the line that contains this argument: `--ingress-class=nginx`
Change this `ingress-class` parameter from `nginx` to `slate`. 

Finally, deploy the ingress controller with `kubectl`:
```bash
sudo kubectl apply -f /path/to/deploy.yaml
```

At this point, you will have an operational ingress controller. All that remains is to see which ports the ingress controller is running on. This can be done with `sudo kubectl get services -n ingress-nginx`. 
You will see an `ingress-nginx-controller` NodePort service, with ports 80 and 443 mapped to two different high ports. One of these ports (80 is http, 443 is https) must be appended to any and all requests using the ingress controller.


### MetalLB on Internal Network

Depending on your use case, running an ingress controller through a NodePort service may not be ideal.
More functionality can be achieved, with some caveats, by running MetalLB behind Chameleon's NAT.

In this case, instead of using MetalLB to provision additional public IPs,
we can use MetalLB to provision additional private IP addresses.
Thus, the Nginx ingress controller and any other services/applications that use additional IPs will operate as normal, but only inside the Chameleon experimental plane. 
This approach requires provisioning Chameleon resources in a moderately different way, and so will be discussed in a separate blog post linked [here](todo).


## Contact Us

If you have any additional comments or questions, please contact [our team](https://slateci.io/community/)!

