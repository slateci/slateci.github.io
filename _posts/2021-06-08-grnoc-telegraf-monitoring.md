---
title: "Using SLATE to Deploy GlobalNOC Telegraf Monitoring"
overview: A guide to using SLATE to monitor hosts with Telegraf.
published: true
permalink: blog/grnoc-telegraf-monitoring.html
attribution: The SLATE Team
layout: post
type: markdown
---

The SLATE platform provides a powerful, simple way to deploy a large variety of applications.
In this blog post, we will demonstrate how SLATE can be leveraged to quickly deploy a monitoring solution for Internet2 network infrastructure.
Collected metrics regarding network traffic through monitored nodes will be sent to a database at Indiana University's Global Research Network Operations Center ([GlobalNOC](https://globalnoc.iu.edu/)).
Our monitoring solution will use [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) to monitor a group of hosts with the Simple Network Management Protocol, usually referred to as SNMP.
More information about SNMP can be found [here](http://www.net-snmp.org/).
In addition, metrics can also be sent to a separate [InfluxDB](https://www.influxdata.com/) database.

<!-- Add information about what data specifically is collected --> 
<!-- Clarify that this parallel traceroute project is different -->
<!-- talk more about why this application is cool/useful -->

<!--end_excerpt-->


## GlobalNOC Time-Series Data Services

Metrics marked for export using the `tsds` Telegraf output plugin are sent to the GlobalNOC Time-Series Data Services (TSDS) endpoint.
Metrics exported to this database join metrics for devices at many research institutions on the Internet2 network. 
This wealth of data exposes possibilities for many interesting applications. 
One such application is the [Parallel Traceroute Visualization Project](http://network-viz.chpc.utah.edu:8080/about.html) being developed at the [University of Utah Center for High Performance Computing](https://www.chpc.utah.edu/).
The project aims to be a tool for researchers to better understand data transfer nodes and the links between them by running and displaying a visualization of traceroutes between pairs of specified hosts. 

The metrics we are going to collect enter the picture after the traceroute has been run.
Once a traceroute is visualized, users are able to hover over hosts in this traceroute that are being monitored by this Telegraf application (or similar applications that send metrics to GlobalNOC), and view a relevant historical network performance/traffic chart.

Additionally, this viewing of historical network data for specific hosts is also useful in many other contexts.
For example, it can be useful for reasoning about data transfer node performance and other troubleshooting in general.
Overall, the Parallel Traceroute Visualization Project and others like it are able to use the data stored in the TSDS to create more informative tools for researchers and research institutions.


## Prerequisites

It is assumed that you already have access to a SLATE-registered Kubernetes cluster, and that you already have installed and set up the SLATE command line interface.
If not, instructions can be found at [SLATE Quickstart](https://slateci.io/docs/quickstart/).
Additionally, it is assumed that there is an SNMP daemon (responds to SNMP requests) running on all target hosts.

On CentOS 7, a simple SNMP setup can be installed by running the following commands:
```bash
yum install net-snmp net-snmp-utils
systemctl enable snmpd
systemctl restart snmpd
```
{:data-add-copy-button='true'}
More details can be found [here](https://support.managed.com/kb/a2390/how-to-install-snmp-and-configure-the-community-string-for-centos.aspx).

 
## Configuration

To begin, a configuration file for the application must be fetched.
The SLATE client provides a simple way to do this with the command below:
```bash
slate app get-conf grnoc-telegraf > grnoc-telegraf.yaml
```
{:data-add-copy-button='true'}

This will save a local copy of the Telegraf configuration, formatted as a .yaml file.
We will modify this configuration accordingly, and eventually deploy the application with this configuration.
Open the configuration file with your preferred text editor, and follow the instructions below to configure each piece of the application.


### GlobalNOC Database Configuration

Navigate to the `grnocOutput` section.
To push to GlobalNOC's databases, credentials must be obtained.

Contact GlobalNOC to obtain these credentials.
<!-- todo: add more information about getting credentials -->

Once you have credentials, store the password in a SLATE secret by running the following command:
```bash
slate secret create --group <slate_group> --cluster <slate_cluster> --from-literal password=<your_password> <secret_name>
```
{:data-add-copy-button='true'}
Make a note of the name you gave this secret, as we will use it later.

Next, configure the database endpoint by filling out the `grnocOutput` section with the hostname, username, and secret name that you setup earlier.
This section will look like this:
```yaml
grnocOutput:
  hostname: "tsds.hostname.net"
  username: "tsds_username"
  passwordSecretName: "secret_name"
```
{:data-add-copy-button='true'}

### Target Configuration

Locate the `hostGroup` section, under `targets`.
It will look something like this:

```yaml
targets:
  - hostGroup:
      community: "public"
      timeout: "15s"
      retries: 2
      hosts:
        - "127.0.0.1:161"
      counter64Bit: false
```


**Hosts**

Under `hosts`, replace the placeholder IP address with the IP address or full DNS name of the host(s) you want to monitor.
You can specify as many hosts as necessary here in a list.
Just note that they must all share the same settings (community string, counter type, etc).
As per yaml syntax, preface each host with a hyphen and surround with quotes to reduce ambiguity.
Additionally, specify the default SNMP port (161) on each host by appending a colon followed by 161.


**Community String**

Next, change the `community` parameter to the appropriate SNMP community string.


**Timeout**

This value controls the amount of time before an SNMP request is considered failed.
For most situations, the default value is acceptable.


**Retries**

This value controls the number of times an SNMP request will be retried before it is considered failed.
Again, the default value here is fine for most situations.


**Counter Type**

The `counter64Bit` flag switches between two different sets of OIDs, one for hosts with 64-bit SNMP counters, and one for hosts with 32-bit SNMP counters.
You will need to find out which type of counter the machines you are attempting to monitor are using, and set this flag accordingly. 
(Set to "true" if you have 64-bit counters, and "false" if you have 32-bit counters.)


**Host Groups**

Note that the hosts configured earlier must all share the same group of settings.
To monitor additional hosts with different configurations (e.g. different community strings or desired OIDs), simply duplicate the entire `hostGroup` section, and populate it with the alternate configuration.
This can be done as many times as needed.
The default configuration file includes two `hostGroup` sections to illustrate this.
If only one host group is required, delete the second `hostGroup` section.


### Additional Parameters

There are several other parameters that can be configured. The first of these is `writeToStdout`.
When set to true, Telegraf will additionally write its metrics to stdout inside its container.
This can be useful for debugging, but is not necessary. Set this as needed.

Another configurable parameter is `collectionInterval`. 
This controls the frequency at which Telegraf collects SNMP metrics.
Specify your desired value here by combining an integer with a time unit. 
Valid time units include "ns", "us", "ms", "s", "m" and "h".
For example, to collect metrics every five seconds, enter the following:
```yaml
collectionInterval: 5s
```
{:data-add-copy-button='true'}
The `collectionInterval` parameter is paired with a `collectionJitter` parameter.
This `collectionJitter` parameter will offset data collection times by a random amount not exceeding its value.

Another configurable parameter is `flushInterval`.
This controls the frequency at which Telegraf writes to its output databases.
Set this in the same fashion as the `collectionInterval` parameter.
Additionally, this parameter is also paired with a jitter parameter.
It functions in the same manner as previously discussed, but for database writes instead of data collection.


### InfluxDB Configuration

If you would like to optionally enable InfluxDB output, navigate to the `influxOutput` section of the configuration file. It will look like this:
```yaml
influxOutput:
  enabled: false
  endpoint: "http://127.0.0.1:9999"
  database: "telegraf"
  httpBasicAuth:
    enabled: false
    username: "telegraf"
    password: "metrics"
```

First, set `enabled` to true. 
Next, set `endpoint` to the endpoint of the database you wish to push to.
Make sure to specify the proper protocol and port.
Then, specify the database name as the `database` parameter.
If basic http authentication has been enabled on your database, you will need to set the `httpBasicAuth` flag to true, and supply the proper username and password. 
If not, this section can be left disabled.


## Installation

Once the application has been configured, we can deploy it.
To install the application onto a SLATE cluster, simply run the command below:
```bash
slate app install grnoc-telegraf --group <group_name> --cluster <cluster_name> --conf telegraf.yaml
```
{:data-add-copy-button='true'}
This installs the `grnoc-telegraf` application onto the cluster specified, with the configuration previously specified.

After installation, metrics will be pushed to the [GlobalNOC database](https://tsds.wash2.net.internet2.edu/community/?method=browse&measurement_type=interface).
The page linked above contains data from various Internet2 infrastructure.
Use the search/filter boxes to find your hosts, and verify that metrics are being pushed.


## Troubleshooting

In the event that something is not working properly, logs from the container running Telegraf can be printed with the following command:
```bash
slate instance logs <instance_id>
```
{:data-add-copy-button='true'}
An `instance_id` is a unique, randomly-generated string prefaced with "instance" that SLATE assigns to each running experiment.
This ID is printed on app installation. 
Additionally, a list of running applications and their IDs can be printed with the command:
```bash
slate instance list
```
{:data-add-copy-button='true'}

For additional help, or to report a bug, please contact the [SLATE team](https://slateci.io/community/).


## Configuration Notes

The following table lists the configurable parameters of the Telegraf monitoring application and their default values.

|           Parameter           |           Description           |           Default           |
|-------------------------------|---------------------------------|-----------------------------|
|`Instance`| Optional string to differentiate SLATE experiment instances |""|
|`writeToStdout`| Optionally write to stdout in container |`true`|
|`collectionInterval`| Data collection interval |`5s`|
|`collectionJitter`| Data jitter interval |`10s`|
|`flushInterval`| Output flush interval |`15s`|
|`flushJitter`| Output jitter interval |`10s`|
|`grnocOutput.hostname`| Database endpoint |`tsds.hostname.net`|
|`grnocOutput.username`| Database username |`tsds username`|
|`grnocOutput.passwordSecretName`| GlobalNOC database password secret name |`tsds-password-secret`|
|`targets.hostGroup.community`| Community string of `hostGroup` |`public`|
|`targets.hostGroup.timeout`| SNMP timeout length of `hostGroup` |`15s`|
|`targets.hostGroup.retries`| Number of retries to attempt for `hostGroup` |`2`|
|`targets.hostGroup.hosts`| Hosts to monitor |`127.0.0.1:161`|
|`targets.hostGroup.counter64bit`| Type of SNMP counter on host machine |`false`|
|`influxOutput.enabled`| Whether to write to InfluxDB |`true`|
|`influxOutput.endpoint`| Database endpoint |`http://127.0.0.1:9999`|
|`influxOutput.database`| Database name |`telegraf`|
|`influxOutput.httpBasicAuth.enabled`| Whether http basic authentication is enabled |`false`|
|`influxOutput.httpBasicAuth.username`| Database username |`telegraf`|
|`influxOutput.httpBasicAuth.password`| Database password |`metrics`|

