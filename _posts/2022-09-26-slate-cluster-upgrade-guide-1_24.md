---
title: SLATE Cluster Upgrade Guide - K8s v1.24
overview: Update SLATE clusters to K8s v1.24
published: true
permalink: blog/slate-cluster-upgrade-guide-1_24.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

The team has been busy preparing SLATE for Kubernetes (K8s) `v1.24` and today we are happy to announce that this work is now live. As cluster administrators there are several upgrade tasks you must perform to continue using SLATE with this new version of K8s.

<!--end_excerpt-->

## Table of Contents

This post will walk you, the cluster administrator, through the following required tasks:

### Kubernetes Tasks

1. Upgrade your SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24` using `kubeadm` (<a href="#upgrade-k8s">see below</a>)
2. Upgrade all `v1beta1` Ingress objects to `v1` (<a href="#update-ingress-objects">see below</a>)
3. Update the Calico CNI to `>= v3.24.1` (<a href="#update-calico-cni">see below</a>)
4. Update MetalLB to `>= v0.13.5` (<a href="#update-metallb">see below</a>)

### SLATE Tasks

1. Upgrade the SLATE Federation Controller roles (<a href="#update-fed-ctrl-role">see below</a>)
2. Update the SLATE Federation Controller itself (<a href="#update-fed-ctrl">see below</a>)
3. Upgrade the SLATE Ingress Controller (<a href="#update-ingress-ctrl">see below</a>)

## Kubernetes Tasks

<span id="upgrade-k8s"></span>
### Upgrade to K8s `v1.24`

{% include alert/tip.html content="Upgrade one [Kubernetes minor release](https://kubernetes.io/releases/patch-releases/) at a time." %}

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24` using `kubeadm`.

<span id="update-ingress-objects"></span>
### Update Ingress Objects

{% include alert/note.html content="If your cluster is already at `v1.22` (or newer) skip this section." %}

Support for `v1beta1` Ingress objects have been [deprecated](https://kubernetes.io/blog/2021/07/14/upcoming-changes-in-kubernetes-1-22/#what-to-do) and completely removed by Kubernetes `v1.22`. You may need to update any existing Ingress objects accordingly.

Below is a sample `v1beta1` Ingress object for the fictitious `hello-app-example`:

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: hello-app-example
  labels:
     app: hello-app-example
     chart: hello-app-example-chart
     release: hello-app-example-release
     instance: hello-app-example-instance
  annotations:
    kubernetes.io/ingress.class: slate
spec:
  rules:
  - host: hello.some-cluster.slateci.net
    http:
      paths:
        - path: /
          backend:
            serviceName: hello-app-example
            servicePort: 80
```

To update the Ingress object to `v1` you need to:
1. Change the `apiVersion` to `networking.k8s.io/v1`
2. Move the `ingress.class` annotation to `spec.ingressClassName`
3. Add a `pathType` to each specified `path`
4. Expand the `backend` structure from:
   ```yaml
   backend:
     serviceName: hello-app-example
     servicePort: 80
   ```
   to:
   ```yaml
   backend:
     service:
       name: hello-app-example
       port:
         number: 80
   ```   

Putting everything together gives us the new `v1` Ingress object:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-app-example
  labels:
     app: hello-app-example
     chart: hello-app-example-chart
     release: hello-app-example-release
     instance: hello-app-example-instance
spec:
  ingressClassName: slate
  rules:
  - host: hello.some-cluster.slateci.net
    http:
      paths:
        - path: /
          pathType: ImplementationSpecific
          backend:
            service:
              name: hello-app-example
              port:
                number: 80
```

For more information on Ingress objects see the [Kubernetes Ingress documentation](https://kubernetes.io/docs/concepts/services-networking/ingress).

<span id="update-calico-cni"></span>
### Update Calico CNI

Update the Calico CNI to `>= v3.24.1` using the steps described in [How to: Install Calico](https://projectcalico.docs.tigera.io/getting-started/kubernetes/self-managed-onprem/onpremises).

#### Example

{% include alert/note.html content="If you changed the default IPv4 range during the initial installation, download, modify, and apply your own `custom-resources.yaml`." %}

Install a newer version of Calico using the operator: 

```shell
CALICO_VERSION=3.24.1 && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/tigera-operator.yaml && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

<span id="update-metallb"></span>
### Update MetalLB

Update MetalLB to `>= v0.13.5`  using the steps described in [Installation By Manifest](https://metallb.universe.tf/installation/#installation-by-manifest).

#### Example

Install a newer version of MetalLB using the new native manifest:

```shell
METALLB_VERSION=0.13.5 && \
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v${METALLB_VERSION}/config/manifests/metallb-native.yaml
```
{:data-add-copy-button='true'}

If you are updating from a version of MetalLB that uses `ConfigMap`s, gather the current address pool information by executing the following:

```shell
kubectl describe configmap config -n metallb-system
```
{:data-add-copy-button='true'}

Create a new custom resource (CR) with the gathered IP pool information. For example:

```shell
cat <<EOF > /tmp/metallb-ipaddrpool.yml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.10.0/24
  - 192.168.9.1-192.168.9.5
EOF
```
{:data-add-copy-button='true'}

```shell
kubectl create -f /tmp/metallb-ipaddrpool.yml
```
{:data-add-copy-button='true'}

Finally, remove the deprecated `ConfigMap`:

```shell
kubectl delete configmap config -n metallb-system
```
{:data-add-copy-button='true'}

## SLATE Tasks

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

<span id="update-fed-ctrl-role"></span>
### Update the SLATE Federation Controller Role

Update the role using the following command:

```shell
FEDERATION_CONTROLLER_VERSION=main && \
kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/${FEDERATION_CONTROLLER_VERSION}/resources/installation/federation-role.yaml
```
{:data-add-copy-button='true'}

Upon execution, `kubectl` should update the controller and output something similar to:

```shell
clusterrole.rbac.authorization.k8s.io/federation-cluster configured
clusterrole.rbac.authorization.k8s.io/federation-cluster-global unchanged
```

<span id="update-fed-ctrl"></span>
### Update the SLATE Federation Controller

Updating the federation controller is a two-step process.

1. The old `nrp-controller` deployment needs to be deleted by running:

   ```shell
   kubectl -n kube-system delete deployment nrp-controller 
   ```
   {:data-add-copy-button='true'}

2. The new controller deployment needs to be installed by running:

   ```shell
   FEDERATION_CONTROLLER_VERSION=main && \
   kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/${FEDERATION_CONTROLLER_VERSION}/resources/installation/upgrade-controller-debug.yaml
   ```
   {:data-add-copy-button='true'}

After running the second command, you should see a `federation-controller` pod in the `kube-system` namespace. Running the following command should display the logs:

```shell
kubectl logs -n kube-system <federation-controller-pod-name>
```
{:data-add-copy-button='true'}

<span id="update-ingress-ctrl"></span>
### Update the SLATE Ingress Controller

Updating the SLATE Ingress Controller involves the following steps:

1. Obtain the load balancer IP from the output of the following command:

   ```shell
   kubectl get service -n slate-system
   ```
   {:data-add-copy-button='true'}

   Set the IP address aside for the final step below.

2. Add the Nginx Ingress Helm repository:

   ```shell
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   ```
   {:data-add-copy-button='true'}

3. Clean up the old installation:

   ```shell
   kubectl delete deployment  nginx-ingress-controller -n slate-system && \
   kubectl delete service -n slate-system ingress-nginx
   ```
   {:data-add-copy-button='true'}

4. Install the new SLATE Ingress Controller using the IP address from the first step:

   ```shell
   helm install ingress -n slate-system  ingress-nginx/ingress-nginx \
     --set controller.ingressClass=slate \
     --set controller.service.loadBalancerIP="<ip_address_from_step_1>"
   ```
