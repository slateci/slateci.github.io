---
title: Application Development Conventions
overview: Best practices for SLATE container development

order: 60

layout: docs
type: markdown
---
{% include home.html %}

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
