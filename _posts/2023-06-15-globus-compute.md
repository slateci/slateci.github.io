---
title: Globus Compute Endpoint on SLATE
overview: Running a Globus Compute Endpoint on SLATE
published: true
permalink: blog/globus-compute-endpoint.html
attribution: The SLATE Team
layout: post
tag: draft
type: markdown
---

[Globus Compute](https://www.globus.org/compute) is a federated Function-as-a-Service (FaaS) that allows users to run Python functions on remote computers.

There are two parts to the service: the Client that submits functions (through a python library) and the endpoint running those functions. Installing an endpoint through SLATE allows the Globus Compute Endpoint to run on any federated SLATE Kubernetes cluster.

<!--end_excerpt-->

The Globus Compute Endpoint uses [Globus Client Credentials](https://docs.globus.org/api/auth/developer-guide/#register-app), which we will place into a SLATE secret.

### Globus Client Credentials

Step 1: Visit [https://app.globus.org/settings/developers](https://app.globus.org/settings/developers)
    a: Or login from the [home page](https://www.globus.org/) and select settings. 
Step 2: Click the developer tab at the top of the page. 
Step 3: Select Advanced Registration

1. select "none of the above - create a new project" and hit continue
1. Enter a project name and a contact email
1. On the next page enter an app name
1. The redirect URL is `https://localhost:5000/*`
1. Select "Use effective identity (ID token + userinfo)"
1. Click Regsiter App

You'll need the Client UUID and a secret

1. click "Add Client Secret" and enter a name. 
1. Copy the Secret, it is only chance you will have to copy it. 

This information is private to the endpoint and will not be entered in the configuration file. Instead, we will create a SLATE Secret with this information. 

We will create an environment variable file to use when making the SLATE secret:
```
touch client_creds.env
chmod 0600 client_creds.env
```

Open client_creds.env and enter the Client UUID and secret (replace these values with the values you received from Globus):
```
FUNCX_SDK_CLIENT_ID=1111111-2222-3333-4444-000000000000
FUNCX_SDK_CLIENT_SECRET=ABCDEFGHIJKLMNOP0123456789=
```

Using the client_creds.env file we can create a SLATE secret:
```
$ slate secret create my-secrets --group <my-group> --cluster <my-cluster> --from-env-file ./client_creds.env
```

### Configuration

Download the configuration file:
```
$ slate app get-conf globus-compute-endpoint > my-conf
```

We will update few items in the configuration file. First we need to get a new UUID:

#### Method 1: 

```
$ sudo apt install uuid
```
the enter the uuid command:
```
$ uuid
```

#### Method 2:`
```python
>>> import uuid
>>> uuid.uuid4()
```

Copy the UUID and enter it into the following value

my-conf
```yaml
endpointUUID: <UUID>
```

Update the `Instance` tag with a unique name:
```
Instance: name
```

Update the `secrets` field with the name of your SLATE secret and make sure the `useClientCredentials` is set to `true`:
```
secrets: my-secrets
useClientCredentials: true
```

Make sure to set `minBlocks` in the config file to zero. Currently, if `minBlocks` is greater than zero, those resources will not exit when uninstalling the Compute Endpoint from SLATE. Setting it to zero just means that the Endpoint does not keep an idle worker available - a new worker will be setup when a client request comes in to the Endpoint and will shut down shortly after. 

### Install

Install the Globus Compute Endpoint with the following command (update the cluster name and group with your information):
```bash
$ slate app install globus-compute-endpoint --group <my-group> --cluster <my-cluster> --conf my-conf
```

### Client Functions

Now that the Globus Compute Endpoint is running on your SLATE cluster, you are able to submit functions to the service: 

Using the same client credentials you obtained for the Endpoint, set the following environment variables, replacing the values with your client credentials ([click here for more information about setting up client credentials for use with the Globus Compute Client](https://funcx.readthedocs.io/en/latest/sdk.html#client-credentials-with-clients)):

```bash
$ export FUNCX_SDK_CLIENT_ID="11111111-2222-4444-8888-000000000000"
$ export FUNCX_SDK_CLIENT_SECRET="ABCDEFGHIJKLMNOP0123456789="
```

By following this guide in the Globus Compute documentation you will be able to submit the python function using your Endpoint UUID: 

[https://funcx.readthedocs.io/en/latest/Tutorial.html](https://funcx.readthedocs.io/en/latest/Tutorial.html)

In the Tutorial, replace the tutorial_endpoint ID with the UUID you created for your SLATE instance of a Globus Compute Endpoint. 

