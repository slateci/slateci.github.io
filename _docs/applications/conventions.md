---
title: Application development conventions
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
