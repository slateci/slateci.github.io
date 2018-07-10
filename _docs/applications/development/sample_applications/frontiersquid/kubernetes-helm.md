---
title: Kubernetes Deployment and Helm Chart
overview: Docker container and Helm Chart for OSG Frontier Squid

order: 40

layout: docs
type: markdown
---
{% include home.html %}

The Kubernetes deployment and Helm chart for OSG Frontier Squid can be found in [the
application catalog](https://github.com/slateci/slate-catalog/tree/master/incubator/osg-frontier-squid).
Refer there for the latest technical details.

The Kubernetes deployment and Helm chart consist of five main part:
* The [Values](https://github.com/slateci/slate-catalog/blob/master/incubator/osg-frontier-squid/values.yaml)
file, which contains the parameters for the installation.
* The [ConfigMap](https://github.com/slateci/slate-catalog/blob/master/incubator/osg-frontier-squid/templates/customizeConfigMap.yaml)
that holds the service configuration. This takes the parameters from the chart
Values and constructs the appropriate `customize.sh`.
* The [PersistenceVolumeClaim](https://github.com/slateci/slate-catalog/blob/master/incubator/osg-frontier-squid/templates/pvc.yaml)
which create an allocation for local storage based on the size selected in the
Values file.
* The [Deployment](https://github.com/slateci/slate-catalog/blob/master/incubator/osg-frontier-squid/templates/deployment.yaml)
which uses the Docker container, mounted with the configuration and volume defined above.
* The [Service](https://github.com/slateci/slate-catalog/blob/master/incubator/osg-frontier-squid/templates/service.yaml)
which exposes the OSG Frontier Squid proxy to the network.

