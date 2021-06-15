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


<!-- Intro: TO-DO -->


## Requirements


## Chameleon Setup

### Chameleon Blazar Client

Due to Chameleon limitations, a stitched network can only be created with the CLI.
Install the OpenStack/Chameleon Blazar client for creating leases.
It can be downloaded with the following command: `pip install git+https://github.com/ChameleonCloud/python-blazarclient.git`.
It is important to be aware of different client versions.
Chameleon expects version `2.2.2` to be used.


### Network Lease


Afterwards, a ticket will need to be submitted to the Chameleon help desk.

### Provision Resources


### Assign Cluster Hostnames

Our testing software, perfSONAR, requires a DNS name, not an IP address.
To get around this, we are simply going to edit the `/etc/hosts` file on both of our clusters.
Open this file on both machines, and append the following lines:
```bash
<node_1_internal_ip> cluster1.slateci.net
<node_2_internal_ip> cluster2.slateci.net
```


## Testing with iPerf

As a preliminary method of verifying connectivity, `iperf` can be used.
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


## perfSONAR Testing

The `perfsonar-testpoint` application can be installed with its default values.

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

Now, we are ready to install this application with this command:
```bash
slate app install --dev perfsonar-checker --cluster <cluster_1> --group <your_group> --conf perfsonar-checker.conf
```




[Chameleon documentation on stitched networks](https://chameleoncloud.readthedocs.io/en/latest/technical/networks/networks_stitching.html#connecting-stitchable-isolated-networks-across-chameleon-sites)


### Network leases
```bash
blazar lease-create --reservation resource_type=network,network_name=slate-network-1,resource_properties='["==","$physical_network","exogeni"]' --start-date "2021-05-10 8:00" --end-date "2021-05-13 19:00" vlan-lease-1
```
```bash
`blazar lease-create --reservation resource_type=network,network_name=slate-network-2,resource_properties='["==","$physical_network","exogeni"]' --start-date "2021-05-10 8:00" --end-date "2021-05-13 19:00" vlan-lease-2`
```

### Leases in general
Use the lease-create command. The following arguments are required:
* `--reservation` with the `resource_type` and `network_name` attributes
* `--start-date` in "YYYY-MM-DD HH:MM" format
* `--end-date` in "YYYY-MM-DD HH:MM" format
* A lease name

Example:
```bash
blazar lease-create --physical-reservation min=1,max=1,resource_properties='["=", "$node_type","compute_haswell"]' --start-date "2021-05-10 06:00" --end-date "2021-05-13 19:00" slate_reservation
```

### Instructions

Once the stitched networks have been created, a subnet must be added to each network.
Additionally, a router must be attached to each network for external access.

"After having stitchable isolated networks on UC and TACC sites, a request should be sent to the Help Desk for creation of AL2S circuits. In the request, following information should be specified: - Information for the network at UC (Project ID, name of the network, ID of the network) - Information for the network at TACC (Project ID, name of the network, ID of the network) - Duration of the circuit in active state"


## Pitfalls
* Be aware of Blazar client versions. Seems to only work with 2.2.2, not 3.2.0.
* Both networks cannot be named the same, otherwise an error will result.


## Experiments

* Ran `iperf` between both nodes - very high speeds - 700 megabits or so - see screenshot
* Hosted an Nginx application (without ingress controller) on both nodes, and accessed from other node


## Experiments

* Ran Nginx instances on each cluster and accessed from other cluster
* Ran `iperf` both ways - 105 to 106 megabits per second


### perfSONAR
* Used `/etc/hosts` to simulate DNS records
* Ran `perfsonar-testpoint` on one cluster, and `perfsonar-checker` on the other
* Repeated both ways

No added latency:
* See `multiple-clusters/logs/perfsonar-output-1.log`, and `multiple-clusters/logs/perfsonar-output-2.log`

50ms added latency:
* See `multiple-clusters/logs/perfsonar-50ms-1.log`, and `multiple-clusters/logs/perfsonar-50ms-2.log`






