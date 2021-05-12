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

This blog post will demonstrate how to run a SLATE cluster on the Chameleon testbed, with MetalLB functionality enabled.

This post is intended as an optional follow-up to the ["SLATE On Chameleon"](https://slateci.io/blog/slate-on-chameleon.html) blog post.
If you have not read this initial post, do so, as it is a prerequisite to this one.


<!--end_excerpt-->


## Chameleon Setup

To run a SLATE cluster with MetalLB on [Chameleon](https://www.chameleoncloud.org/), you must first have access to a Chameleon account, as well as be on an existing Chameleon project. 
The [first blog post](https://slateci.io/blog/slate-on-chameleon.html) in this series outlines gaining Chameleon access.

Once you have access to the Chameleon testbed, you will need to select a specific site to run your Chameleon experiment on. 
For this post, we are going to use the "KVM" site, which is slightly different than the sites used in the previous post; however, it can be accessed in the same fashion. 

On the [Chameleon](https://www.chameleoncloud.org/) homepage, navigate to the drop-down menu at the top titled "Experiment".

Click this menu, and observe the options under "Sites". 

Select the "KVM" site, and you will be brought to the KVM portal page.


### Network Setup

First, to create a SLATE cluster with MetalLB enabled internally in Chameleon,
we must set up a different private network that we control.

This is necessary because Chameleon's default "shared-net" will block MetalLB functionality. 
By default, to Chameleon, MetalLB will look like it is executing an ARP-spoofing attack.


#### Create a router

1. Navigate to the "Routers" section under the "Network" tab on the left sidebar.
1. Then, on the right-hand side, click the "Create Router" button.
1. Next, name this router. We like to use `slate-router`.
1. Click the external network drop-down menu, and select "public".
1. Leave everything else as-is, and click "Create Router".

#### Create an additional network

1. Navigate to the left sidebar and select "Network", then select "Networks" underneath this.
1. Then, click the "Create Network" button.
1. Leave all options as they are, but give this new network a name. We like to name ours `slate-net`.
1. Click "Next", and you will be brought to the "Subnet" section.
1. The only value that needs to be changed here is the "Network Address" parameter (no subnet name is needed).
1. The exact network you choose is not important as long as it has space for all the hosts you will need, and at least one extra IP for the Nginx Ingress Controller.
1. That being said, we used this subnet: 192.168.1.0/24.
1. Following this, click "Next" again.
1. You will be brought to the "Subnet Details" section.
1. Here, we will be changing the "Allocation Pools" values. This will restrict the number of IPs Chameleon is allowed to allocate, thus leaving some free for MetalLB.
1. In the "Allocation Pools" box, enter `192.168.1.3,192.168.1.250`. This will leave four IPs reserved for MetalLB.

If you would like to learn more about networks in Chameleon, more documentation can be found [here](https://chameleoncloud.readthedocs.io/en/latest/technical/networks.html).

<!-- 192.168.1.0 - network -->
<!-- 192.168.1.1 - default gateway -->
<!-- 192.168.1.2 - DHCP -->
<!-- 192.168.1.251 - MetalLB -->
<!-- 192.168.1.252 - MetalLB -->
<!-- 192.168.1.253 - MetalLB -->
<!-- 192.168.1.254 - MetalLB -->
<!-- 192.168.1.255 - Broadcast -->

#### Connect your router to your new network

1. Navigate back to the "Routers" section under the "Network" tab on the left sidebar.
1. Click on the name of the router you created earlier (most likely called `slate-router`).
1. Select the "Interfaces" tab, and then click "Add Interface"
1. Under the "Subnet" drop-down menu, select the network you created earlier (most likely called `slate-net`).
1. Leave everything else as-is, and click "Submit".

#### Create Security Groups

By default, KVM restricts traffic on the control plane to instances.
To communicate with our instance over SSH, and for SLATE to communicate with our instance, we need to create a few additional security rules.

First, we'll create an SSH rule.
1. Navigate to the "Security Groups" section under the "Network" tab on the left sidebar.
1. Click "Create Security Group".
1. Name this group `ssh`, and click "Create Security Group".
1. Next, locate this new group in the list of security groups, and click the "Manage Rules" button to the right.
1. Add an SSH rule.


Next, we'll create a SLATE API server rule.
1. Follow the same steps as before for creating a security group, but name this one `slate`. 
1. Instead of adding an `ssh` rule, add a rule that allows all traffic on port 6443.

### Launch VM Instances

Unlike at the UC or TACC sites, on KVM, you do not need a reservation/lease to provision instances.
We can simply bring them up as needed.

1. First, navigate to the "Instances" page under the "Compute" menu on the left-hand side.
1. Then, on the right side of the page, click the "Launch Instance" button.
1. Under the "Details" tab, give this instance a name (we like `slate-vm`).
1. Under the "Source" tab, select "Image" under the "Select Boot Source" drop-down menu. Then, select the `CC-CentOS7` image.
1. Under the "Flavor" tab, select the `m1.medium` VM flavor.
1. Under the "Network" tab, make sure that the only network that is selected is our new network (`slate-net`).
1. Under the "Security Groups" tab, select the `slate` and `ssh` security groups that were created earlier.
1. Under the "Key Pair" tab, make sure you have configured the correct SSH keys. This is explained in more detail in [this documentation](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html#getting-started).
1. Click the "Launch Instance" button, and wait for the instance to spin up. This should not take long.
1. Set up SSH access according to the directions in the previous blog post.

Detailed instructions regarding creating instances and associating IP addresses can be found in the [Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html).
If you are not familiar with Chameleon, it is recommended that you read this document and follow the instructions there.


### Logging In

To login to any Chameleon node, log in as user `cc`, with `ssh cc@<PUBLIC_INSTANCE_IP>`.
This user should have password-less `sudo` access.
Before you go any further, make sure any firewalls are disabled, as they will impact cluster creation.
On Chameleon, `ufw` is often running, even on CentOS. 
Disable it with `sudo ufw disable`.


### Disable OpenStack ARP-Spoofing Protection

This next step requires access to your Chameleon resources through the OpenStack CLI.

The Chameleon docs provide information on setting this up [here](https://chameleoncloud.readthedocs.io/en/latest/technical/cli.html).
We at SLATE recommend using application credentials for authenticating command line clients.

Once you have OpenStack CLI access, use the following command to view a list of the IDs of your OpenStack/Chameleon ports.
```bash
openstack port list
```

You will see some output that looks similar to this:
```bash
+--------------------------------------+------+-------------------+--------------------------------------------------------------------------------+--------+
| ID                                   | Name | MAC Address       | Fixed IP Addresses                                                             | Status |
+--------------------------------------+------+-------------------+--------------------------------------------------------------------------------+--------+
| 17752ced-1919-48c8-b133-91c8dbb9cf8e |      | fa:16:3e:aa:aa:aa | ip_address='xxx.xxx.xxx.xxx', subnet_id='a9a7cb27-14e0-4b11-85cc-c4fd30846124' | N/A    |
| 1c48f086-2d38-447c-9a98-814c80ac6db0 |      | fa:16:3e:aa:aa:aa | ip_address='192.168.1.5', subnet_id='f488d515-176a-4922-b52d-48486ca9fd1d'     | ACTIVE |
+--------------------------------------+------+-------------------+--------------------------------------------------------------------------------+--------+
```
Copy the ID field from the port that has the internal IP address of your SLATE instance.
In this case, we would want the second ID in the list, because its IP address is the internal address of the instance in question.

Then, disable ARP-spoofing protection for each one of your MetalLB IP addresses with this command:
```bash
openstack port set <port-id> --allowed-address ip-address=<additional-ip-address>
```

In our case, we need to run this command four times, once for each IP address we have set aside for MetalLB:
```bash
openstack port set <port-id> --allowed-address ip-address=192.168.1.251
openstack port set <port-id> --allowed-address ip-address=192.168.1.252
openstack port set <port-id> --allowed-address ip-address=192.168.1.253
openstack port set <port-id> --allowed-address ip-address=192.168.1.254
```

## Cluster Setup

To create a Kubernetes cluster and register it with SLATE, follow documentation [here](https://slateci.io/docs/cluster/automated/introduction.html), with a few changes.
Specifically, follow the instructions for setting up a cluster behind a NAT, but leave MetalLB enabled.

This will mean the following changes to cluster configuration:
1. Add the `supplementary_addresses_in_ssl_keys` variable.
1. Give MetalLB this configuration:
```yaml
metallb_enabled: true
metallb_ip_range:
  - "192.168.1.251-192.168.1.254"
metallb_version: v0.9.3
```

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

MetalLB is only provisioning internal IP addresses, so access will be limited to inside the experimental plane.
This means DNS services or other similar dependencies must be done without or set-up inside the experimental plane.


## Contact Us

If you have any additional comments or questions, please contact [our team](https://slateci.io/community/)!

