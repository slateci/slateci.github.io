---
title: "Using SLATE to Deploy Open OnDemand"
overview: A guide to using SLATE to run an Open OnDemand instance.
published: true
permalink: blog/slate-open-ondemand.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---


[Open OnDemand](https://openondemand.org/) is an web application enabling simple access to high-performance computing resources.
The SLATE platform provides a simple way to rapidly deploy this application in
containers, complete with a user-management and authentication system.


<!--end_excerpt-->


## Prerequisites

It is assumed that you already have access to a SLATE-registered Kubernetes
cluster, and that you already have installed and configured the SLATE command
line interface.  If not, instructions can be found at 
[SLATE Quickstart](https://slateci.io/docs/quickstart/).  

Additionally, this application requires persistent storage in the form of a
SLATE/Kubernetes volume. The SLATE cluster that Open OnDemand is being 
installed on must have some sort of volume provisioner installed.


## Configuration

Initially, a configuration file for the Open OnDemand application must be
obtained. The SLATE client will do this with the following command:
```bash
slate app get-conf open-ondemand > ood.yaml
```

This will save a local copy of the OnDemand configuration, formatted as a 
.yaml file. We will modify this configuration accordingly, and eventually 
deploy Open OnDemand with this configuration.

With your preferred text editor, open this configuration file and follow the 
instructions below.


### Modifying Default Values

Modify configuration file to ensure appropriate setup.
	* Set the `SLATE.Cluster.DNSName` value to the DNS name of the cluster the application is being installed on
	* Set the `claimName` value to the name of the previously created SLATE volume.


### Volume Setup

To store user data, a SLATE volume must be created.
This can be done with the SLATE command line tool. To create a volume, run the
following command:
```bash
slate volume create --group <group_name> --cluster <cluster> --size 50M --storageClass <storage_class> <slate_volume_name>
```

To determine the storage classes supported by each cluster, consult individual
cluster documentation. (`slate cluster info <cluster_name>`)

*TODO: figure out how to get information about storage classes*


## Installation

Now that Open OnDemand has been properly configured, and persistent storage set
up, we can install the application. Run the following SLATE command:
```bash
slate app install open-ondemand --group <group_name> --cluster <cluster> --conf /path/to/ood.yaml
```


## Testing

After a short while, your SLATE OnDemand application should be live at
`<slate_instance_id>.ondemand.<slate_cluster_name>.slateci.net`.
Navigate to this URL with any web browser, and you should be directed to a
Keycloak login page. Logging in should direct you to the Open OnDemand portal
home page.


## Configurable Parameters:

The following table lists the configurable parameters of the Open OnDemand application and their default values.

|           Parameter           |           Description           |           Default           |
|-------------------------------|---------------------------------|-----------------------------|
|`Instance`| Optional string to differentiate SLATE experiment instances. |`global`|
|`replicaCount`| The number of replicas to create. |`1`|
|`setupKeycloak`| Runs Keycloak setup script if enabled. |`true`|
|`claimName`| The name of the SLATE volume to store configuration in. |`keycloak-db`| 
|`SLATE.Cluster.DNSName`| DNS name of the cluster the application is deployed on. |`slate-cluster`|
|`setupLDAP`| Set up LDAP automatically based on following values. |`true`| 
|`ldap.connectionURL`| URL to access LDAP at. |`ldap://your-ldap-here`| 
|`ldap.importUsers`| Import LDAP users to Keycloak. |`true`| 
|`ldap.rdnLDAPAttribute`| LDAP configuration |`uid`| 
|`ldap.uuidLDAPAttribute`| LDAP configuration |`uidNumber`| 
|`ldap.userObjectClasses`| LDAP configuration |`inetOrgPerson, organizationalPerson`| 
|`ldap.usersDN`| LDAP configuration |`usersDN`| 
|`kerberos.realm`| Kerberos realm to connect to. |`kerberos_realm`| 
|`kerberos.serverPrincipal`| Kerberos server principal |`kerberos_server_principal`| 
|`kerberos.keyTab`| Kerberos configuration |`/etc/krb5.keytab`| 
|`kerberos.kerberosPasswordAuth`| Use Kerberos for password authentication. |`true`| 
|`kerberos.debug`| Writes additional debug logs if enabled. |`true`| 

