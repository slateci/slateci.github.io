---
title: "Globus Connect 5 on SLATE"
overview: Blog
published: true
permalink: blog/slate-globus-connect-5.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

Globus Connect provides a secure way to transfer large volumes of data
between systems.  Users can use it to securely transfer data between sites
reliably at high speeds. SLATE provides Globus Connect 5 as an application
that can be deployed on SLATE clusters.

<!--end_excerpt-->

We'll go through installing and configuring Globus Connect 5 on a SLATE cluster
in this document. Although deploying the application through SLATE is straighforward, 
configuring the endpoint is somewhat complex. 

## Globus Connect

[Globus Connect](https://globus.org/data-transfer)  provides a reliable, high 
performance service that enables researchers to transfer data between facilities
with minimal effort.  Sites and admins can setup endpoints and data collections
and users can initiate data transfers between endpoints or collections using a website.
Once transfers are completed, users are notified and can start working on the 
transferred data.

## Deploying Globus Connect Using SLATE

SLATE provides a way to easily deploy Globus Connect Server 5 (GCS 5) to SLATE 
clusters. Once SLATE is configured to deploy GCS 5 endpoints, new endpoints can 
easily be deployed to a site.  

In order to deploy GCS 5 on SLATE, we'll need to:

1. Create endpoint credentials
2. Configure and deploy an endpoint through SLATE
3. Configure the endpoint through Globus


### Creating the endpoint credentials

Normally GCS 5 uses an interactive procedure to create an endpoint and setup nodes
for an endpoint.  However, if we obtain credentials for the endpoint, this procedure
can be automated.  We need just 3 credentials to automate things:

* A client UUID
* A client secret
* A deployment key file

We obtain the first credentials by registering the Globus Connect endpoint on the
globus.org website.  The last credential is obtained by using a container to
generate the deployment key file and then saving a copy of it.


### Creating a `passwd` File

Globus Connect maps authenticated users to local user accounts and then does 
transfers as that local user account.  As part of the configuration, a passwd file
with users that Globus Connect will use is created and placed on the cluster by
SLATE.


### Deploying 

Once the setup is completed, download the configuraiton:

```shell
$ slate app get-conf globus-connect-v5 > gcs5.conf
```

Edit the configuration file (`gcs5.conf`) and set an instance name.  The other
parameters can be left as is for a test instance. Once that is done, 
install Globus Connect:

```shell
$ slate app install --cluster <cluster> --group <group> globus-connect-v5  --conf gcs5.conf
```

You'll need to replace `<cluster>` with the cluster were Globus is being installed and
`<group>` with your slate group.  After waiting a few minutes, you can run (replacing
`<instance>` with the instance given by the install command):

```shell
slate instance logs <instance>
```

You should see something like the following 

```
IP address not specified, using 192.170.231.205
Configuring endpoint
Starting services
Launching GCS Manager
Launching GCS Assistant
Launching Apache httpd
Launching GridFTP Server
GCS container successfully deployed
Globus endpoint deployed with id: d35f1f87-0145-4efe-8a06-7a9da6aac3f7
Skipping endpoint configuration
```

You'll need to note done the endpoint id for the following steps.


# Configuration 

Once the endpoint is deployed, we'll need to configure it so that it'll show up
to Globus Connect users. To do this, we'll use a SLATE provided container and then 
login to the endpoint.  Once logged in, we'll create a storage gateway and a
storage collection to configure which users are allowed to access the endpoint and
which files they can access.  Once that is done, the collection should appear in 
Globus Connect for users to access. 



## Usage
For further instrucions on how to use globus please read this
[documentation](https://docs.globus.org/).  For detailed step-by-step instructions,
see [this page](https://github.com/slateci/slate-catalog-incubator/blob/master/charts/globus-connect-v5/README.md) 
or the instructions for the application on the SLATE portal.

