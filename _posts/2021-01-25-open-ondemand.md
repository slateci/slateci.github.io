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
OnDemand, through an extensible plugin system, provides many different ways to interact with these resources.
Most simply, OnDemand can launch a shell to remote resources in one's web browser.
Currently, SLATE only supports this functionality, but more applications are
in development.
Additionally, OnDemand can provide several ways of submitting batch jobs and launching interactive computing sessions.
It is also able to serve as a portal to computationally expensive software running on remote HPC nodes.
For example, users can launch remote Jupyter Notebooks or Matlab instances.

The SLATE platform provides a simple way to rapidly deploy this application in
a containerized environment, complete with integration into an existing LDAP user directory.


<!--end_excerpt-->


## Prerequisites

It is assumed that you already have access to a SLATE-registered Kubernetes
cluster, and that you already have installed and configured the SLATE command
line interface.  If not, instructions can be found at 
[SLATE Quickstart](https://slateci.io/docs/quickstart/).  

Additionally, this application requires persistent storage in the form of a
SLATE/Kubernetes volume. The SLATE cluster that Open OnDemand is being 
installed on must have some sort of volume provisioner installed.
More information about this can be found [here](https://slateci.io/docs/tools/client-manual.html#volume-commands) and [here](https://slateci.io/blog/persistent-volumes.html).


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

At the top of the configuration file is a value called `Instance`.
Set this to a unique string you wish to identify your application with.
Take note of this value, as it will eventually form part of the URL you will access your OnDemand instance with.
Next, set the `claimName` value to the name of the SLATE volume that you will eventually create.
Set the `SLATE.Cluster.DNSName` value to the DNS name of the cluster the application is being installed on.
Then, configure the LDAP and Kerberos sections according to your institution's setup.



### Volume Setup

To store user data, a SLATE volume must be created.
This can be done with the SLATE command line tool. To create a volume, run the
following command:
```bash
slate volume create --group <group_name> --cluster <cluster> --size 50M --storageClass <storage_class> <slate_volume_name>
```
Make sure that the name of this volume matches the `claimName` value you set earlier.

To determine the storage classes supported by each cluster, consult individual
cluster documentation. (`slate cluster info <cluster_name>`) If this does not
yield helpful output, contact your cluster administrator.



## Installation

Now that Open OnDemand has been properly configured, and persistent storage set
up, we can install the application. Run the following SLATE command:
```bash
slate app install open-ondemand --group <group_name> --cluster <cluster> --conf /path/to/ood.yaml
```


## Testing

After a short while, your SLATE OnDemand application should be live at
`<slate_instance_id>.ondemand.<slate_cluster_name>.slateci.net`.
Navigate to this URL with any web browser, and you will be directed to a
Keycloak login page. A successful login will then direct you to the Open OnDemand portal home page.


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
