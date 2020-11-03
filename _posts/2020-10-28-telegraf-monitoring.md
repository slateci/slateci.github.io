---
title: "Using SLATE to Deploy Telegraf Monitoring"
overview: A guide to using SLATE to monitor hosts with Telegraf.
published: true
permalink: blog/telegraf-monitoring.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

The SLATE platform provides a powerful, simple way to deploy a large variety of applications.
In this blog post, we will demonstrate how SLATE can be leveraged to quickly deploy a monitoring solution for ScienceDMZ network infrastructure. 
We will assume collected metrics will be sent to a database at Indiana University's Global Research Network Operations Center ([GlobalNOC](https://globalnoc.iu.edu/)).  
With some additional configuration explained below, metrics can also be sent to a separate InfluxDB database.

This application uses Telegraf to monitor a group of hosts with the Simple Network Management Protocol, primarily referred to as SNMP.
More information about SNMP can be found [here](http://www.net-snmp.org/).



<!--end_excerpt-->

### Prerequisites

It is assumed that you already have access to a SLATE-registered Kubernetes cluster, and that you already have installed and set up the SLATE client.
If not, instructions can be found at [SLATE Quickstart](https://slateci.io/docs/quickstart/).
Additionally, it is assumed that you have configured an SNMP daemon (responds to SNMP requests) on one or more target hosts.

On CentOS 7, a simple SNMP setup can be installed by running the following commands:
```bash
yum install net-snmp net-snmp-utils
systemctl enable snmpd
systemctl restart snmpd
```
More detail can be found [here](https://support.managed.com/kb/a2390/how-to-install-snmp-and-configure-the-community-string-for-centos.aspx).

 
### Configuration

First, a configuration file for the application must be fetched.
The SLATE client provides a simple way to do this with the command below:
```bash
slate app get-conf telegraf > telegraf.yaml
```

This will save a local copy of the telegraf configuration, formatted as a .yaml file.
We will modify this configuration accordingly, and eventually deploy the application with this configuration.
First, open the configuration file with your preferred text editor.
Locate the `hostGroup` section, under `targets`.
It will look something like this:

```yaml
targets:
  - hostGroup:
      community: "public"
      hosts:
        - "127.0.0.1:161"
      oids: |-
        [[inputs.snmp.field]]
          oid = "DISMAN-EVENT-MIB::sysUpTimeInstance"
          name = "uptime"
```

**Hosts**

Under `hosts`, replace the placeholder IP address with the IP address or full DNS name of the host you want to monitor.
Add as many additional hosts underneath as wanted. As per yaml syntax, preface them with a hyphen and surround with quotes to reduce ambiguity.

**Community String**

Next, change the `community` parameter to the appropriate SNMP community string.

**OIDs**

Following this, configure the appropriate OIDs to monitor.
The `oids` parameter is formatted a little differently than the rest of the file.
To provide fine-grained control over these parameters, this section inherits from the Telegraf service's syntax. Specify the OIDs you want to monitor by following documentation [here](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/snmp).

Note that these hosts must all share a common community string, as well as a common set of OIDs being monitored.
To monitor additional hosts with different community strings or desired OIDs, simply duplicate the entire `hostGroup` section, and populate it with the different configuration.
The default configuration file includes two `hostGroup` sections to illustrate this.
If only one configuration is required, delete the second `hostGroup` section.


**Database Configuration**

*Not yet fully implemented*


**Additional Parameters**

There are two other parameters that can be configured. The first of these is `writeToStdout`.
When set to true, Telegraf will additionally write its metrics to stdout inside its container.
This can be useful for debugging, but is not necessary. Set this as needed.

The second parameter is `interval`. This controls the frequency at which Telegraf collects SNMP metrics.
Specify your desired value here by combining an integer with a time unit. 
Valid time units include "ns", "us", "ms", "s", "m" and "h".
For example, to collect metrics every five seconds, enter the following:
```yaml
interval: 5s
```


### Installation

Once the application has been properly configured, we must deploy it.
To install the application onto a SLATE cluster, simply run the command below:
```bash
slate app install telegraf --group <group_name> --cluster <cluster_name> --conf telegraf.yaml
```
This installs the Telegraf application onto the cluster specified, with the configuration previously specified.


### Configuration Notes

The following table lists the configurable parameters of the Telegraf monitoring application and their default values.

|           Parameter           |           Description           |           Default           |
|-------------------------------|---------------------------------|-----------------------------|
|`writeToStdout`| Optionally write to stdout in container |`true`|
|`interval`| Data collection interval |`5s`|
|`targets.hostGroup.community`| Community string of `hostGroup` |`public`|
|`targets.hostGroup.hosts`| Target hosts list |`127.0.0.1:161`|
|`targets.hostGroup.oids`| SNMP OIDs to poll |*telegraf configuration monitoring system uptime*|
|`endpoint`| Database endpoint |`http://127.0.0.1:9999`|
|`database`| Database name |`telegraf`|
