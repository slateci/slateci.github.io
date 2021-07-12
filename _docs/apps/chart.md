---
title: Preparing a Helm chart
overview: The third step is to prepare and test a Helm chart

order: 60

layout: docs2020
type: markdown
---
{% include home.html %}

The third and final step to preparing an application for SLATE is creating a Helm Chart for the application.

An intro on how to create and use Helm Charts can be found [on Helm's website](https://helm.sh/docs/chart_template_guide/getting_started/)

The Helm Chart for SLATE should offer customization of application parameters, but should be balanced with abstraction of the application.  
An example of this is the Frontier Squid Helm package. The values.yaml file (required for all Helm packages) is as follows:  
```
# Instance to label use case of Frontier Squid deployment
# Generates app name as "osg-frontier-squid-[Instance]"
# Enables unique instances of Frontier Squid in one namespace
Instance: global

### SLATE-START ###
# Deployment specific information used for the SLATE methodology
SLATE:
  # ElasticSearch information for sending application logs
  Logging:
    Enabled: true
    Server:
      Name: atlas-kibana.mwt2.org
      Port: 9200
  # The name of the cluster that the application is being deployed on
  Cluster:
    Name: mini-SLATE
  LocalStorage: false
  Instance:
    ID: "untagged"
### SLATE-END ###

Service:
  # Port that the service will utilize.
  Port: 3128
  # Controls how your service is can be accessed. Valid values are:
  # - LoadBalancer - This ensures that your service has a unique, externally
  #                  visible IP address
  # - NodePort - This will give your service the IP address of the cluster node 
  #              on which it runs. If that address is public, the service will 
  #              be externally accessible. Using this setting allows your 
  #              service to share an IP address with other unrelated services. 
  # - ClusterIP - Your service will only be accessible on the cluster's internal 
  #               kubernetes network. Use this if you only want to connect to 
  #               your service from other services running on the same cluster. 
  ExternalVisibility: NodePort

SquidConf:
  # The amount of memory (in MB) that Frontier Squid may use on the machine.
  # Per Frontier Squid, do not consume more than 1/8 of system memory with Frontier Squid
  CacheMem: 128
  # The amount of disk space (in MB) that Frontier Squid may use on the machine.
  # The default is 10000 MB (10 GB), but more is advisable if the system supports it.
  # Current limit is 999999 MB, a limit inherent to helm's number conversion system.
  CacheSize: 10000
  # The range of incoming IP addresses that will be allowed to use the proxy.
  # Multiple ranges can be provided, each seperated by a space.
  # Example: 192.168.1.1/32 192.168.2.1/32
  # Use 0.0.0.0/0 for open access.
  # The default set of ranges are those defined in RFC 1918 and typically used 
  # within kubernetes clusters. 
  IPRange: 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16
```  
In this example you can see that there are only 6 non-SLATE settings to manipulate in order to deploy an instance of Frontier Squid. These are the settings most pertinent to the functionality of Frontier Squid, and provide enough flexibility for general users. The settings in the SLATE category are provided by the api at the time of deployment to appropriately reflect the environment that the application is being deployed to. These defaults are for localized testing purposes.

Some notes about creating the Helm Chart and deciding on values:
* Limit the number of variables a user must keep track of to only what is most important.
* Provide simple documentation for each variable within the file for ease of access.
* Choose default values that are immediately functional for a general purpose.
* Avoid using technical terminology of kubernetes or docker.

### SLATE Standardization
* An `Instance` variable is required for SLATE to deploy unique instances of the application. This should be included in the metadata names using the helper function below in the _helpers.tpl file. If there is a resource associated with the deployment, it should be named as {% raw %} `{{ template "[chart].fullname" . }}-[resourceName]` {% endraw %}  
{% raw %}
```
{{- define "[chart].fullname" -}} #replace the chart name with yours
  {{- $name := default .Chart.Name .Values.Instance -}}
  {{- if contains $name .Chart.Name -}}
    {{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
  {{- else -}}
    {{- printf "%s-%s" .Chart.Name $name | trunc 63 | trimSuffix "-" -}}
  {{- end -}}
{{- end -}}
```
{% endraw %}
* It is not required to include the SLATE set variables shown above in every chart, but they should be included if they will be used in your deployment.
* Additionally a `instanceID` label is needed inside the app's deployment or StatefulSet under `metadata`.
{% raw %}
```
...
instanceID: {{ .Values.SLATE.Instance.ID | quote  }}
```
{% endraw %}

### SLATE Metadata

SLATE has the capability to automatically inject metadata into any chart it installs, if such information is needed.
Any or all of the following values can be used in any SLATE chart:
```yaml
### SLATE-START ###
SLATE:
  Logging:
    Enabled: "trueOrFalse"
    Server: "server"
      Name: "name"
      Port: "port"
  Cluster:
    Name: "some-cluster"
    DNSName: "some-cluster.slateci.net"
    ClusterID: "cluster-id"
  Instance:
    ID: "instance-id"
  Metadata:
    Group: "group-name"
    GroupEmail: "group-email"
### SLATE-END ###
```
To use any of these, simply add them to your `values.yaml` file between the `### SLATE-START ###` and `### SLATE-END ###` tags.
The values they are assigned can here can be arbitrary, as they will be overridden at application install time by the correct values.

