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
Our monitoring solution will use [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) to monitor a group of hosts with the Simple Network Management Protocol, usually referred to as SNMP.
More information about SNMP can be found [here](http://www.net-snmp.org/).
We will assume collected metrics will be sent to a database at Indiana University's Global Research Network Operations Center ([GlobalNOC](https://globalnoc.iu.edu/)).
However, metrics can also be sent to a separate [InfluxDB](https://www.influxdata.com/) database.


<!--end_excerpt-->



## Prerequisites

It is assumed that you already have access to a SLATE-registered Kubernetes cluster, and that you already have installed and set up the SLATE command line interface.
If not, instructions can be found at [SLATE Quickstart](https://slateci.io/docs/quickstart/).
Additionally, it is assumed that there is an SNMP daemon (responds to SNMP requests) running on one or more target hosts.

On CentOS 7, a simple SNMP setup can be installed by running the following commands:
```bash
yum install net-snmp net-snmp-utils
systemctl enable snmpd
systemctl restart snmpd
```
More details can be found [here](https://support.managed.com/kb/a2390/how-to-install-snmp-and-configure-the-community-string-for-centos.aspx).

 
## Configuration

To begin, a configuration file for the application must be fetched.
The SLATE client provides a simple way to do this with the command below:
```bash
slate app get-conf telegraf > telegraf.yaml
```

This will save a local copy of the telegraf configuration, formatted as a .yaml file.
We will modify this configuration accordingly, and eventually deploy the application with this configuration.
Open the configuration file with your preferred text editor, and follow the instructions below to configure each piece of the application.


### GlobalNOC Database Configuration

Navigate to the `grnocOutput` section.
First, make sure that the `enabled` flag is set to true.
Next, to push to GlobalNOC's databases, credentials must be obtained.

*Process for getting credentials here*

Next, configure the database endpoint by filling out the `grnocOutput` section with the hostname, username, and password obtained earlier. 
This section will look like this:
```yaml
grnocOutput:
  enabled: true
  hostname: "tsds.hostname.net"
  username: "tsds username"
  password: "tsds password"
```

Note that if GRNOC output is enabled, you will not be able to specify a custom set of OIDs. 
An OID is an identifier specifying a metric to monitor. More information can be found [here](https://www.ittsystems.com/snmp-oid-versions-functionality/).


### Target Configuration

Locate the `hostGroup` section, under `targets`.
It will look something like this:

```yaml
targets:
  - hostGroup:
      community: "public"
      hosts:
        - "127.0.0.1:161"
      counter64Bit: false
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

**Counter Type**

The `counter64Bit` parameter is only relevant if GRNOC output has been enabled.
The `counter64Bit` flag switches between two different sets of OIDs, one for hosts with 64-bit SNMP counters, and one for hosts with 32-bit SNMP counters.

**OIDs**

Following this, configure the appropriate OIDs to monitor.
The `oids` parameter is formatted a little differently than the rest of the file.
To provide fine-grained control over these parameters, this section inherits from the Telegraf service's syntax. Specify the OIDs you want to monitor by following documentation [here](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/snmp).

**Host Groups**

Note that the hosts configured earlier must all share the same group of settings.
To monitor additional hosts with different configurations (e.g. different community strings or desired OIDs), simply duplicate the entire `hostGroup` section, and populate it with the alternate configuration.
This can be done as many times as needed.
The default configuration file includes two `hostGroup` sections to illustrate this.
If only one host group is required, delete the second `hostGroup` section.


### InfluxDB Configuration

To enable InfluxDB output, navigate to the `influxOutput` section of the configuration file. It will look like this:
'''yaml
influxOutput:
  enabled: false
  endpoint: "http://127.0.0.1:9999"
  database: "telegraf"
  httpBasicAuth:
    enabled: false
    username: "telegraf"
    password: "metrics"
'''
First, set `enabled` to true. 
Next, set `endpoint` to the endpoint of the database you wish to push to.
Make sure to specify the proper protocol and port.
Then, specify the database name as the `database` parameter.
If basic http authentication has been enabled on your database, you will need to set the `httpBasicAuth` flag to true, and supply the proper username and password. 
If not, this section can be left disabled.


### Additional Parameters

There are three other parameters that can be configured. The first of these is `writeToStdout`.
When set to true, Telegraf will additionally write its metrics to stdout inside its container.
This can be useful for debugging, but is not necessary. Set this as needed.

The second parameter is `interval`. This controls the frequency at which Telegraf collects metrics.
Specify your desired value here by combining an integer with a time unit. 
Valid time units include "ns", "us", "ms", "s", "m" and "h".
For example, to collect metrics every five seconds, enter the following:
```yaml
interval: 5s
```

The third parameter is 'flushInterval`. This control the frequency at which Telegraf flushes its output plugins, or writes to the specified databases.
Set this in the same fashion as the `interval` parameter.


## Installation

Once the application has been properly configured, we must deploy it.
To install the application onto a SLATE cluster, simply run the command below:
```bash
slate app install telegraf --group <group_name> --cluster <cluster_name> --conf telegraf.yaml
```
This installs the Telegraf application onto the cluster specified, with the configuration previously specified.


## Testing

### Testing with Netcat

If you want to quickly test the application without setting up a database, `netcat` can be used as an improvised database endpoint.
On the machine you want to receive metrics on, enter the command:
```bash
nc -lk 9999
```
This will listen for any incoming data on port 9999.
Then, configure the InfluxDB endpoint to point to port 9999 on this machine. Enter something like this:
```yaml
influxOutput:
  enabled: true
  endpoint: "http://<machine_ip_here>:9999"
  database: "telegraf"
```


### Testing with InfluxDB

Alternately, an InfluxDB endpoint can be simply set up using Docker.
Configure Docker on the machine you want to receive metrics on, and pull the InfluxDB image with:
```bash
docker pull influxdb
```
Next, run the image in a container with the appropriate ports and volumes:
```bash
docker run -p 9999:9999 -v $PWD:/var/lib/influxdb influxdb
```

Configure Telegraf's InfluxDB output to push over http to this endpoint on port 9999.



## Troubleshooting

In the event that something is not working properly, logs from the container running Telegraf can be printed with the following command:
```bash
slate instance logs <instance_id>
```
An `instance_id` is a unique, randomly-generated string prefaced with "instance" that SLATE assigns to each running experiment.
This ID is printed on app installation. 
Additionally, a list of running applications and their IDs can be printed with the command:
```bash
slate instance list
```



## Configuration Notes

The following table lists the configurable parameters of the Telegraf monitoring application and their default values.

|           Parameter           |           Description           |           Default           |
|-------------------------------|---------------------------------|-----------------------------|
|`Instance`| Optional string to differentiate SLATE experiment instances |""|
|`writeToStdout`| Optionally write to stdout in container |`true`|
|`interval`| Data collection interval |`5s`|
|`flushInterval`| Output flush interval |`300s`|
|`grnocOutput.enabled`| Whether to write to GlobalNOC database |`true`|
|`grnocOutput.hostname`| Database endpoint |`tsds.hostname.net`|
|`grnocOutput.username`| Database username |`tsds username`|
|`grnocOutput.password`| Database password |`tsds password`|
|`targets.hostGroup.community`| Community string of `hostGroup` |`public`|
|`targets.hostGroup.hosts`| Hosts to monitor |`127.0.0.1:161`|
|`targets.hostGroup.counter64bit`| Type of SNMP counter on host machine |`false`|
|`targets.hostGroup.oids`| SNMP OIDs to poll |*telegraf configuration monitoring system uptime*|
|`influxOutput.enabled`| Whether to write to InfluxDB |`true`|
|`influxOutput.endpoint`| Database endpoint |`http://127.0.0.1:9999`|
|`influxOutput.database`| Database name |`telegraf`|
|`influxOutput.httpBasicAuth.enabled`| Whether http basic authentication is enabled |`false`|
|`influxOutput.httpBasicAuth.username`| Database username |`telegraf`|
|`influxOutput.httpBasicAuth.password`| Database password |`metrics`|
