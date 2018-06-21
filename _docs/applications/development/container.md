---
title: Preparing a Docker container
overview: The first step is to prepare and test a Docker container 

order: 20

layout: docs
type: markdown
---
{% include home.html %}


Creating Container for SLATE Application
----------------------------------------

There are various different ways to create a container in Docker. For SLATE, 
we *strongly recommend* using a `Dockerfile` to create the container(s) for 
a SLATE application. The Dockerfile` allows a third party, such as the SLATE 
app curators, to easily follow and understand the contents of a Docker 
container. We will only show how to create and populate a `Dockerfile` for 
now.

The starting point for any `Dockerfile` is the baseline Docker image to 
import. This is typically an OS image, such as `centos:7` or `centos:6`, 
a container that is already part of SLATE or OSG, such as the 
[OSG worker image](). 
In a docker file this will be, for example,

```
FROM centos:7:latest
````

at the top of the file. 


Each SLATE application should reside in a separate git repository in the
githube slateci group. The name of the repository should be containter-app-name.
The directory structure should look like

```
root: Contains Dockerfile (if the app is a single container), README, LICENSE.
 |
 --- app: Contains all the sources for the application. The main script should
 |        be called entrypoint.sh where appropriate
 --- local-test: Contains the deployment for a local minikube
 |
 --- build: Contains build.sh to build the images and run.sh to start the app
            in minikube
```

Each application should include a README that document how to use the container.
In particular, it should include a table with all the ways in which the container
can be configured in the following format:


|   | Type | Description  | Example |
|---|---|---|---|
| MY_PARAM | Conf param (ENV)  | A parameter passed through an environment variable.  | -e MY_PARAM=value |
| /etc/myapp/myapp.conf  | Conf file (VOLUME)  | A configuration file passed through volumes. | -v ~/myapp.conf:/etc/myapp/myapp.conf  |
| /var/data/myapp  | Data dir (VOLUME)  | Persistent storage that must survive redeployment. | -v /storage/data/myapp:/var/data/myapp |
| /var/cache/myapp  | Cache dir (VOLUME)  | Storage space that is preferable to survive between redeployment but can be deleted.  | -v /tmp/cache/myapp:/var/cache/squid |
| /var/scratch  | Temp dir (VOLUME)  | Temporary storage space that can be deleted when done. | -v /tmp/scratch:/var/scratch |

We strongly recommend CentOS or Ubuntu for base applications.
