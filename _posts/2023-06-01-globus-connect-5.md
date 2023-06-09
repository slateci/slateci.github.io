---
title: "Globus Connect v5 on SLATE"
overview: Blog
published: true
permalink: blog/slate-globus-connect-5.html
attribution: The SLATE Team
layout: post
type: markdown
---

Globus Connect Server v5 (GCS 5) provides a secure way to transfer large volumes of data between systems. Users can use it to securely transfer data between sites reliably at high speeds. SLATE provides GCS 5 as an application that can be deployed on SLATE clusters.

<!--end_excerpt-->

In this blog post we will go through installing and configuring GCS 5 on a SLATE cluster. Although deploying the application through SLATE is straightforward, configuring the endpoint is somewhat complex.

## GCS 5

[Globus Connect](https://globus.org/data-transfer) provides a reliable, high performance service that enables researchers to transfer data between facilities with minimal effort. Sites and admins can set up endpoints and data collections and users can initiate data transfers between endpoints or collections using a website. Once transfers are completed, users are notified and can start working on the transferred data.

## Deploying GCS 5 Using SLATE

SLATE provides a way to easily deploy GCS 5 to SLATE clusters. Once SLATE is configured to deploy GCS 5 endpoints, new endpoints can easily be deployed to a site. 

In order to deploy GCS 5 on SLATE, you will need to:

1. Create endpoint credentials.
1. Configure and deploy an endpoint through SLATE.
1. Configure the endpoint through Globus.

### Creating the Endpoint Credentials

Normally GCS 5 uses an interactive procedure to create an endpoint and set up associated nodes. However, if you obtain the following three credentials for the endpoint, this procedure can be automated.

1. **A client UUID:** obtained by registering the Globus Connect endpoint on https://www.globus.org/.
1. **A client secret:** obtained using the steps described below.
1. **A deployment key file:** obtained by using a container to generate the deployment key file and then saving a copy of it.

### Creating a `passwd` File

GCS 5 maps authenticated users to local user accounts and then assumes the identity of that local user account to perform transfers. As part of the configuration, a `passwd` file with users that GCS 5 will utilize is created and placed on your cluster by SLATE.

### Deploying 

Once the setup is completed, download the configuration to a local file.

```shell
$ slate app get-conf globus-connect-v5 > gcs5.conf
```

Edit the local `gcs5.conf` file by specifying a new instance name (the other parameters can be left as-is for testing purposes).

Now install GCS 5.

```shell
$ slate app install --cluster <cluster> --group <group> globus-connect-v5 --conf gcs5.conf
```

* Replace `<cluster>` with the SLATE cluster where GCS 5 is being installed.
* Replace `<group>` with an appropriate SLATE group.
 
After waiting a few minutes, run:

```shell
slate instance logs <instance>
```

* Replace `<instance>` with the instance given by the installation command above.

At this point you should see something like the following:

```text
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

Make special note of the ID portion of the output (`Globus endpoint deployed with id: <id>`). It will be referenced in the steps below.

## Configuration 

Once the endpoint is deployed, configure it so that it will show up to Globus Connect users. Log into the endpoint using a SLATE provided container and:
1. Create a storage gateway.
1. Create a storage collection to configure which users are allowed to access the endpoint and which files they can access.

Once that is done, the collection should appear in Globus Connect for users to access. 

## Usage

* For further instructions on how to use Globus in general, see their [documentation site](https://docs.globus.org/).
* For detailed step-by-step instructions:
  * See the Globus Connect Server v5 [README.md](https://github.com/slateci/slate-catalog-incubator/blob/master/charts/globus-connect-v5/README.md)
  * Or the instructions for the application on the [SLATE Portal](https://portal.slateci.io/applications/incubator/globus-connect-v5).
