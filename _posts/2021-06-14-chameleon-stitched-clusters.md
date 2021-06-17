---
title: "Stitching SLATE Clusters on Chameleon"
overview: "A guide to spinning up stitched SLATE clusters on two different Chameleon sites."
published: true
permalink: blog/chameleon-stitched-clusters.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

Chameleon is an OpenStack-based research platform for provisioning compute and networking resources.
Chameleon has the capability to create a virtual LAN with hosts stitched over two geographically disparate sites.
In this blog post, we demonstrate how to setup two SLATE clusters at separate sites, stitched together with a VLAN.
We will also run various tests to determine network performance over this stitched link.

For a more basic SLATE-on-Chameleon setup, please see the [Deploying a SLATE Cluster on Chameleon](https://slateci.io/blog/slate-on-chameleon.html) blog post. If you have no experience with Chameleon, we recommend that you read through and follow this blog post first to familiarize yourself with the platform.

<!--end_excerpt-->


## Requirements

To run a SLATE cluster on [Chameleon](https://www.chameleoncloud.org/), you must first have access to a Chameleon account, as well as be on an existing Chameleon project. 
The [Chameleon Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html) contains lots of useful information regarding this.
Other helpful Chameleon documentation includes [this page](https://chameleoncloud.readthedocs.io/en/latest/technical/networks/networks_stitching.html#connecting-stitchable-isolated-networks-across-chameleon-sites) on network stitching.

Additionally, you must have a SLATE account with an access token.


### Chameleon Blazar Client

Due to Chameleon limitations, a stitched network can only be created with the OpenStack CLI.
Install the OpenStack/Chameleon Blazar client for creating leases.
It can be downloaded with the following command:
```bash
pip install git+https://github.com/ChameleonCloud/python-blazarclient.git
```
It is important to be aware of different client versions, as Chameleon expects version `2.2.2` to be used.


### Application Credential

You must also have an unrestricted application credential for both Chameleon sites, ["CHI@UC"](https://chi.tacc.chameleoncloud.org/project/) and ["CHI@TACC"](https://chi.uc.chameleoncloud.org/project/).

To do this, log into the first site's portal.
1. In the left sidebar, navigate to the "Identity" tab, and click "Application Credentials".
1. Then, click "Create Application Credential", fill out the name field, and check the "Unrestricted" box.
1. Click "Create Application Credential" again, and download the `openrc` file somewhere safe.

Then, repeat these steps for the other site.


## Chameleon Setup

### Network Lease

A stitch-able network lease must be created at each Chameleon site.
First, authenticate with a Chameleon site by running this command:
```bash
source /path/to/openrc.sh
```
This `openrc.sh` file is the application credential you created earlier.
You should have one for each site.

Then, use the following command to create a network lease:
```bash
`blazar lease-create --reservation resource_type=network,network_name=<network_name_here>,resource_properties='["==","$physical_network","exogeni"]' --start-date <start_date> --end-date "<end_date>" <lease_name>`
```
Note that the start and end date parameters must include a time as well.
The time and date should be specified with the following format:
```bash
"YYYY-MM-DD HH:MM"
```
The time zone is UTC, and a 24-hour clock should be used.

Repeat these steps for the other Chameleon site.
Note that these networks or leases cannot be named the same thing.

Once the leases have instantiated correctly, a network will automatically be created at each site.
This can be verified on the online portal, using the "Networks" tab.

Once both networks are up, a ticket will need to be submitted to the Chameleon help desk.
This ticket should request the creation of an AL2S circuit between the sites, and should specify the Project ID, network name, and network ID of each network.
This information can be found by clicking on each network name.
Additionally, the lifetime of the stitched network should also be specified.

Submit a ticket containing this information, and wait for it to be approved.


### Network Setup 

#### Create a router

Next, a router must be created to serve as a default gateway for our instances to access the rest of the internet.

1. Login to one of the Chameleon portals.
1. Navigate to the "Routers" section under the "Network" tab on the left sidebar.
1. Then, on the right-hand side, click the "Create Router" button.
1. Next, name this router. We like to use `slate-router`.
1. Click the external network drop-down menu, and select "public".
1. Leave everything else as-is, and click "Create Router".
1. Repeat these steps for the other Chameleon site.


#### Create a subnet

Next, we will create a subnet under our existing network.

1. Login to one of the Chameleon portals.
1. Navigate to the left sidebar and select "Network", then select "Networks" underneath this.
1. Locate the network that was already created for you, and click the drop down menu next to your network on the right side.
1. From the drop down menu, select "Create Subnet".
1. The only value that needs to be changed here is the "Network Address" parameter (no subnet name is needed). Use `192.168.1.0/24` for the network address.
1. Following this, click "Next" again. You will be brought to the "Subnet Details" section. Leave this as-is, and click "Create".
1. Repeat these steps on the other Chameleon site/portal.

If you would like to learn more about networks in Chameleon, more information can be found in the [Chameleon documentation](https://chameleoncloud.readthedocs.io/en/latest/technical/networks.html).


#### Connect your router to your new network

Here, we will connect the router object we made to our custom network.

1. Login to one of the Chameleon portals.
1. Navigate back to the "Routers" section under the "Network" tab on the left sidebar.
1. Click on the name of the router you created earlier (most likely called `slate-router`).
1. Select the "Interfaces" tab, and then click "Add Interface"
1. Under the "Subnet" drop-down menu, select the network that was created earlier.
1. Leave everything else as-is, and click "Submit".
1. Repeat these steps on the other Chameleon site/portal.


### Instance Setup

Now, we need to launch two compute nodes, on the subnets that we already created.
More detailed instructions regarding creating instances and associating IP addresses can be found in the [Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html).

#### Launch Instances

1. First, login to one of the Chameleon portals.
1. Click the "Reservations" tab on the left side, and select the "Leases" menu underneath it.
1. Click "Create Lease", and create a lease for as much time as you need. Any node type that can run CentOS 7 is acceptable.
1. Next, navigate to the "Instances" page under the "Compute" menu on the left-hand side.
1. Then, on the right side of the page, click the "Launch Instance" button.
1. Under the "Details" tab, give this instance a name (we like `slate-instance`). Additionally, select the reservation that was previously created.
1. Under the "Source" tab, select "Image" under the "Select Boot Source" drop-down menu. Then, select the `CC-CentOS7` image.
1. Under the "Network" tab, make sure that the only network that is selected is our new network.
1. Under the "Key Pair" tab, make sure you have configured the correct SSH keys. This is explained in more detail in [this documentation](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html#getting-started).
1. Click the "Launch Instance" button, and wait for the instance to spin up. This may take 5 to 10 minutes.
1. Repeat these steps for the other site.


#### Associate Public IP and Log In

To access our instance, we need to NAT a floating public IP to our instance.
1. First, login to one Chameleon portal.
1. Next, go to the "Network" tab on the left and select "Floating IPs".
1. Click the "Allocate IP to Project" button located on the right side.
1. Leave the default settings and click "Allocate IP".
1. Once an IP address has been allocated, click the "Associate" button to the right of the IP address.
1. From the "Port to be Associated" menu, select the instance you created earlier.
1. Click "Associate"
1. Repeat for the other instance on the other Chameleon site.

For more information regarding associating floating IP addresses, visit the [Chameleon Getting Started Guide](https://chameleoncloud.readthedocs.io/en/latest/getting-started/index.html).

To login to any Chameleon node, log in as user `cc`, with `ssh cc@<PUBLIC_INSTANCE_IP>`.
This user should have password-less `sudo` access.


#### Disable Firewall

Before you go any further, make sure any firewalls are disabled, as they will impact cluster creation.
On Chameleon, `ufw` is often running, even on CentOS.
Disable it with `sudo ufw disable`.


#### Assign Cluster Hostnames

Our testing software, perfSONAR, requires a DNS name, not an IP address.
To get around this, we are simply going to edit the `/etc/hosts` file on both of our clusters.
Open this file on both nodes, and append the following lines:
```bash
<node_1_internal_ip> cluster1.slateci.net
<node_2_internal_ip> cluster2.slateci.net
```
Note that the internal IP of each node can be found from each node's respective web portal.
These IPs will be assigned from the `192.168.1.0/24` subnet that we created earlier.


## Testing

### Test Basic Connectivity 

First, use the ping command on each node to reach the other node.  

From the first cluster, run: `ping cluster2.slateci.net`.

From the second cluster, run: `ping cluster1.slateci.net`.

If these ping commands succeed, we have successfully stitched the two Chameleon sites together!


### Testing with iPerf

Next, as a preliminary method of verifying throughput, `iperf` can be used.
If `iperf` is not already installed, it can be installed with:
```bash
sudo yum install iperf
```
Note that both nodes will need to have `iperf` installed.

Afterwards, run an iPerf server on the first node with this command:
```bash
iperf -s
```
Then, run the iPerf client on the second node and connect to the server on the first node with this command:
```bash
iperf -c <node_1_internal_ip>
```
After a little while, the test will complete, and you should see bandwidth results.


### Testing with perfSONAR

The `perfsonar-testpoint` application can be installed with its default values.
Do this with the following command:
```bash
slate app install perfsonar-testpoint --cluster <cluster_2> --group <your_group>
```

The `perfsonar-checker` application will require a small amount of configuration.
First, to fetch its configuration file, run:
```bash
slate app get-conf --dev perfsonar-checker > perfsonar-checker.conf
```
Navigate to the `Instance` section, and give your application an appropriate instance tag.
Next, navigate to the `PerfsonarChecker` section, and change the `Dest1` parameter to the appropriate hostname that was set up earlier in `/etc/hosts/`.
The `Dest2` and `Dest3` values can be commented out, or left as-is, if you would also like to run tests to those endpoints.

Now, we are ready to install this application with this command:
```bash
slate app install --dev perfsonar-checker --cluster <cluster_1> --group <your_group> --conf perfsonar-checker.conf
```
After the application finishes installing, an instance ID will be printed out.
Take note of this ID.
Then, give the application some time to run, and check the results with this command:
```bash
slate instance logs --max-lines 0 <perfsonar_checker_instance_id>
```


## Other Testbeds

Similar setups can be created on other testbeds as well.
The testing methods outlined in the post will also work on other testbeds.
Additionally, the SLATE Nginx application (without ingress controller) can be used to test.
Host an Nginx instance on both nodes, and access each instance from the opposing node over NodePort using `curl`.

CloudLab-to-CloudLab setups have been verified to work, as well as GENI-to-Chameleon@UC.

More documentation about stitching networks between Chameleon and other testbeds/external domains can be found in the [Chameleon documentation](https://chameleoncloud.readthedocs.io/en/latest/technical/networks/networks_stitching.html#connecting-stitchable-isolated-networks-across-chameleon-sites).


## Contact Us

If you have any additional comments or questions, please contact [our team](https://slateci.io/community/)!

