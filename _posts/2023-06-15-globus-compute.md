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

You'll need the **Client UUID** at the top of the page

1. click "Add Client Secret" and enter a name. 
1. Copy the Secret; it is the only chance you will have to copy it. (In the next steps we will use the **Client UUID** at the top of the Page in addition to the secret you just created. After you copy the secret, there is another UUID that is displayed in the box at the bottom of the list - This is **NOT** the UUID that you will use).

The Client UUID and the secret are private to the endpoint and will not be entered in the configuration file. Instead, we will create a SLATE Secret with this information. 

Create an environment variable file to use when making the SLATE secret:
```
touch client_creds.env
chmod 0600 client_creds.env
```

Open client_creds.env and enter the **Client UUID** and **secret** (replace these values with the values you received from Globus):
```
FUNCX_SDK_CLIENT_ID=1111111-2222-3333-4444-000000000000
FUNCX_SDK_CLIENT_SECRET=ABCDEFGHIJKLMNOP0123456789=
```

Using the client_creds.env file we can create a SLATE secret:
```
$ slate secret create my-secret --group <my-group> --cluster <my-cluster> --from-env-file ./client_creds.env
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

Copy the UUID and enter it into the following value. 

**NOTE**: This endpointUUID that you create is the **endpointUUID** that you use to submit a function to your Globus Compute endpoint in the final steps below.

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

## Client Functions

Now that the Globus Compute Endpoint is running on your SLATE cluster, you are able to submit functions to the service: 

Using the same client credentials you obtained while setting up the the Globus Client, set the following environment variables, replacing the values with your client credentials:

```bash
$ export FUNCX_SDK_CLIENT_ID="11111111-2222-3333-4444-000000000000"
$ export FUNCX_SDK_CLIENT_SECRET="ABCDEFGHIJKLMNOP0123456789="
```

[https://funcx.readthedocs.io/en/latest/Tutorial.html](https://funcx.readthedocs.io/en/latest/Tutorial.html)

Submitting a function to your endpoint requires the **endpointUUID** that you created above for the configuration file. (**NOT** the Globus Client UUID). 

the step requires Python version 3.10:

```bash
$ python3 -m venv path/to/globus_compute_venv
$ source path/to/globus_compute_venv/bin/activate
(globus_compute_venv) $ python3 -m pip install globus-compute-sdk
```

Now create a simple "Hello World!" example to submit to your Globus Compute Endpoint. 

Create a new file: function.py

```python
from globus_compute_sdk import Client

gcc = Client()

def hello_world():
    return "Hello World!"

func_uuid = gcc.register_function(hello_world)

# Use the endpointUUID you generatated for the config file
endpointUUID = '11111111-1111-1111-1111-111111111111' # replace with endpointUUID
res = gcc.run(endpoint_id=endpointUUID, function_id=func_uuid)

print(res)
```

Now create a file to get the result: result.py

```python
import sys
from globus_compute_sdk import Client

gcc = Client()

print(gcc.get_result(sys.argv[1]))
```

Run function.py

```bash
$ python3 function.py
```
The result will output a UUID. We will uses this 



NOTE: When the Globus Compute Endpoint receives a job it fires up a worker to run the function, because we don't have an idle worker running initially, it takes a few seconds to start the worker. When following the tutorial listed above, it may take a few extra seconds to get the result. If the result  is not ready  when running the get_result() function, you'll see an error that says `TaskPending(task["status"])`. Just wait a few more seconds and try again.

