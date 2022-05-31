---
title: Preparing a Docker container
overview: The first step is to prepare and test a Docker container 

order: 20

layout: docs2020
type: markdown
---
{% include home.html %}

The first goal is to create a set of Docker containers properly packaged to run all processes related to the application.

If the application is already packaged as a Docker container by the original developers and is already available on a container registry like [Docker Hub](http://hub.docker.com), you can use that directly and skip this step.

While there are various different ways to create a container in Docker, within SLATE we recommended using a `Dockerfile`. This allows a third party, such as the SLATE app curators, to easily follow and understand the contents of a Docker container. You can look at the [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) for examples and guidance.

Each SLATE application should reside in a separate Git repository in the [GitHub slateci group](https://github.com/slateci). The name of the repository should be `container-appname`. The directory structure should look like:

```text
├── app
│   ├── <content>
│   ├── entrypoint.sh
├── local-test
│   ├── <content>
├── build
    ├── build.sh
    ├── run.sh
├── Dockerfile
├── LICENSE
├── README.md 
└── .gitignore
```

* `app`: Contains all the sources for the application. The main script should be called `entrypoint.sh` where appropriate.
* `local-test`: Contains the deployment for a local minikube.
* `build`: Contains `build.sh` to build the images and `run.sh` to start the app in minikube.

As a base image, we recommend CentOS 7+ or Ubuntu.

Each application should include a 'README.md' that documents how to use the container. In particular, it should include a table with all the ways in which the container can be configured in the following format:

|                         | Type                 | Description                                                                          | Example                                      |
|-------------------------|----------------------|--------------------------------------------------------------------------------------|----------------------------------------------|
| `MY_PARAM`              | Conf param (`ENV`)   | A parameter passed through an environment variable.                                  | `-e MY_PARAM=value`                          |
| `/etc/myapp/myapp.conf` | Conf file (`VOLUME`) | A configuration file passed through volumes.                                         | `-v ${PWD}/myapp.conf:/etc/myapp/myapp.conf` |
| `/var/data/myapp`       | Data dir (`VOLUME`)  | Persistent storage that must survive redeployment.                                   | `-v /storage/data/myapp:/var/data/myapp`     |
| `/var/cache/myapp`      | Cache dir (`VOLUME`) | Storage space that is preferable to survive between redeployment but can be deleted. | `-v /tmp/cache/myapp:/var/cache/squid`       |
| `/var/scratch`          | Temp dir (`VOLUME`)  | Temporary storage space that can be deleted when done.                               | `-v /tmp/scratch:/var/scratch`               |

Each image should be published through a container registry of your choice:
* [Docker Hub](http://hub.docker.com).
* [OSG Harbor](https://hub.opensciencegrid.org) (preferred for in-house images)
* [GitHub](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
* etc.

Use the template below for single-image repositories in the chosen container registry:

```text
slateci/appname
```

In the case where your repository has more than one image use the following template instead:

```text
slateci/appname-componentname
```
