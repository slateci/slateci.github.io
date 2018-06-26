---
title: Preparing a Helm chart
overview: The third step is to prepare and test a Helm chart

order: 60

layout: docs
type: markdown
---
{% include home.html %}

The third and final step to preparing an application for SLATE is creating a Helm Chart for the application.

The Helm Chart should offer customization of application parameters, but should be balanced with abstraction of the application.  
An example of this is the Frontier Squid Helm package. The values.yaml file (required for all Helm packages) is as follows:  
```
# Instance to label use case of Frontier Squid deployment
# Generates app name as "osg-frontier-squid-[Instance]"
# Enables unique instances of Frontier Squid in one namespace
Instance: global

Service:
  # Port that the service will utilize.
  Port: 3128
  # Must be true/false
  # Defines whether the service can be used globally, or only within the cluster.
  ExternallyVisible: true

SquidConf:
  # The amount of memory (in MB) that Frontier Squid may use on the machine.
  # Per Frontier Squid, do not consume more than 1/8 of system memory with Frontier Squid
  CacheMem: 128
  # The amount of disk space (in MB) that Frontier Squid may use on the machine.
  # The default is 10000 MB (10 GB), but more is advisable if the system supports it.
  CacheSize: 10000
  # The range of external IP addresses that will be allowed to use the proxy.
  # Multiple ranges can be provided, each seperated by a space.
  # Example: 255.255.0.0/16 255.256.1.1/32
  # Use 0.0.0.0/0 for open access.
  IPRange: 0.0.0.0/0
```  
In this example you can see that there are only 6 settings to manipulate in order to deploy an instance of Frontier Squid. These are the settings most pertinent to the functionality of Frontier Squid, and provide enough flexibility for general users. 

Some notes about creating the Helm Chart and deciding on values:
* Limit the number of variables a user must keep track of to only what is most important.
* Provide simple documentation for each variable within the file for ease of access.
* Choose default values that are immediately functional for a general purpose.
* Avoid using technical terminology of kubernetes or docker. In the example we use "ExternallyVisible" rather than "LoadBalancer".

SLATE Standardization:
* Include an `Instance` variable in your naming scheme such that each part of the deployment can by uniquely labeled by instance using the template `[Application name]-[Instance]-[Utility type]`. Ex) `osg-frontier-squid-global-configuration`.
