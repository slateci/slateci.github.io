---
title: Preparing a Docker container
overview: The first step is to prepare and test a Docker container 

order: 20

layout: docs2020
type: markdown
---
{% include home.html %}

The first goal is to create a set of Docker containers properly packaged to run all
processes related to the application.

If the application is already packaged as a Docker container by the original developers
and is already available on [Docker Hub](http://hub.docker.com), you can use that
directly and skip this step.

While there are various different ways to create a container in Docker, within SLATE
we recommended using a `Dockerfile`. This allows a third party, such as the SLATE 
app curators, to easily follow and understand the contents of a Docker 
container. You can look at the
[container repositories](https://github.com/search?q=topic%3Acontainer+org%3Aslateci&type=Repositories)
on SLATE GitHub for examples and guidance.

Each SLATE application should reside in a separate git repository in the
GitHub slateci group. The name of the repository should be container-appname.
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

As a base image, we recommend CentOS or Ubuntu.

Each application should include a README that documents how to use the container.
In particular, it should include a table with all the ways in which the container
can be configured in the following format:

|   | Type | Description  | Example |
|---|---|---|---|
| MY_PARAM | Conf param (ENV)  | A parameter passed through an environment variable.  | -e MY_PARAM=value |
| /etc/myapp/myapp.conf  | Conf file (VOLUME)  | A configuration file passed through volumes. | -v ~/myapp.conf:/etc/myapp/myapp.conf  |
| /var/data/myapp  | Data dir (VOLUME)  | Persistent storage that must survive redeployment. | -v /storage/data/myapp:/var/data/myapp |
| /var/cache/myapp  | Cache dir (VOLUME)  | Storage space that is preferable to survive between redeployment but can be deleted.  | -v /tmp/cache/myapp:/var/cache/squid |
| /var/scratch  | Temp dir (VOLUME)  | Temporary storage space that can be deleted when done. | -v /tmp/scratch:/var/scratch |

Each image should be published through [Docker HUB](https://hub.docker.com/).
Make sure you have an account on DockerHub. On DockerHub, logged in as the organization, create
a repository linked to the github repository.
The name of the repository on DockerHub should match “slateci/appname” where
appname matches the github repository “container-appname”.
In case the github repository has more than one image, the DockerHub repository
should match “slateci/appname-componentname”.
