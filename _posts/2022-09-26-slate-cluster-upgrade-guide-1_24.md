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

The team has been busy preparing SLATE for Kubernetes (K8s) `v1.24.x` and today we are happy to announce that this work is now live. As cluster administrators there are several upgrade tasks you must perform to continue using SLATE with this new version of K8s.

<!--end_excerpt-->

## Table of Contents

This post will walk you, the cluster administrator, through the following tasks:

### Kubernetes Tasks

1. Upgrade your SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24.x` using `kubeadm` (<a href="#upgrade-k8s">see below</a>)
2. (Optional) Upgrade manifests with  `v1beta1` Ingress objects to `v1` (<a href="#update-ingress-objects">see below</a>)
3. (Recommended) Update the Calico CNI to `>= v3.24.1` (<a href="#update-calico-cni">see below</a>)
4. (Recommended) Update MetalLB to `>= v0.13.5` (<a href="#update-metallb">see below</a>)

### SLATE Tasks

1. Upgrade the SLATE Federation Controller roles (<a href="#update-fed-ctrl-role">see below</a>)
2. Update the SLATE Federation Controller itself (<a href="#update-fed-ctrl">see below</a>)
3. Upgrade the SLATE Ingress Controller (<a href="#update-ingress-ctrl">see below</a>)

## Kubernetes Tasks

<span id="upgrade-k8s"></span>
### Upgrade to K8s `v1.24.x`

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

#### Check the status of the cluster

Start by SSH-ing to your control plane and switching to the `root` user.

```shell
[you@controlplane] $ sudo su -
```
{:data-add-copy-button='true'}

Configure `kubectl`/`kubeadm` and check the state of the Kubernetes nodes.

```shell
[root@controlplane] # export KUBECONFIG=/etc/kubernetes/admin.conf
```
{:data-add-copy-button='true'}

```shell
[root@controlplane ~]# kubectl get nodes
NAME                    STATUS   ROLES           AGE     VERSION
<worker>                Ready    <none>          2y68d   v1.22.1
<controlplane>          Ready    control-plane   2y68d   v1.22.1
```
{:data-add-copy-button='true'}

#### Determine the upgrade path

Best practice is to upgrade from one Kubernetes minor release to the next and so forth down the line all the way to `v1.24.x`. For example, if you are starting at `v1.21.x` the upgrade path should resemble:

  * `v1.21.x` --> `v1.22.13`
  * `v1.22.13` --> `v1.23.10`
  * `v1.23.10` --> `v1.24.x`

#### Upgrade the control plane

Let's assume that like the example above, we are beginning with Kubernetes `v1.21.x`. Install the related packages for Kubernetes `v1.22.13`, making sure the `kubernetes` YUM repo is enabled.

```shell
yum update --enablerepo=kubernetes kubelet-1.22.13 kubeadm-1.22.13 kubectl-1.22.13
```
{:data-add-copy-button='true'}

Check that your cluster can be upgraded from `v1.21.x` --> `v1.22.13`.

```shell
kubeadm upgrade plan
```
{:data-add-copy-button='true'}

If there aren't any issues proceed with the upgrade. 

```shell
[root@controlplane ~]# kubeadm upgrade apply v1.22.13
[upgrade/successful] SUCCESS! Your cluster was upgraded to "v1.22.13". Enjoy!

[upgrade/kubelet] Now that your control plane is upgraded, please proceed with upgrading your kubelets if you haven't already done so.
```
{:data-add-copy-button='true'}

Restart `kubelet` and check its status.

```shell
systemctl daemon-reload && \
systemctl restart kubelet && \
systemctl status kubelet 
```
{:data-add-copy-button='true'}

#### Upgrade the worker nodes one at a time

Leaving a terminal connected to the control plane, SSH to your first worker node in a fresh terminal, and switch to the `root` user.

```shell
[you@workernode1] $ sudo su -
```
{:data-add-copy-button='true'}

Install the related packages for Kubernetes `v1.22.13`, making sure the `kubernetes` YUM repo is enabled.

```shell
yum update --enablerepo=kubernetes kubelet-1.22.13 kubeadm-1.22.13 kubectl-1.22.13
```
{:data-add-copy-button='true'}

Back in the control plane terminal window apply the upgrade and prepare the worker node for maintenance.

```shell
kubeadm upgrade node && \
kubectl drain <workernode1> --ignore-daemonsets
```
{:data-add-copy-button='true'}

In the worker node terminal window restart `kubelet` and check its status.

```shell
systemctl daemon-reload && \
systemctl restart kubelet && \
systemctl status kubelet 
```
{:data-add-copy-button='true'}

If everything looks good, finish up by uncordoning the node in the control plane terminal window.

```shell
kubectl uncordon <workernode1>
```
{:data-add-copy-button='true'}

Log out of your worker node terminal window and rinse-repeat for your remaining worker nodes.

#### Verify the status of the cluster

Now that the `kubelet` has been upgraded on the control plane and worker nodes, once more SSH to your control plane and switch to the `root` user.

```shell
[you@controlplane] $ sudo su -
```
{:data-add-copy-button='true'}

Configure `kubectl`/`kubeadm` and check the state of the Kubernetes nodes.

```shell
[root@controlplane] # export KUBECONFIG=/etc/kubernetes/admin.conf
```
{:data-add-copy-button='true'}

```shell
[root@controlplane ~]# kubectl get nodes
NAME                    STATUS   ROLES           AGE     VERSION
<worker>                Ready    <none>          2y68d   v1.22.13 
<controlplane>          Ready    control-plane   2y68d   v1.22.13 
```
{:data-add-copy-button='true'}

If everything was successful the control plane and workers should all report as `v1.22.13`.

#### Next steps: `v1.22.13` to `v1.23.10`

At this point in the example your cluster should be running `v1.22.13`. Repeat the steps described above to upgrade from `v1.22.13` to `v1.23.10`, adjusting the K8s versions described in the commands accordingly.

#### Next steps: `v1.23.10` to `v1.24.x`

Once your cluster is running `v1.23.10` you are nearly are ready to make the final jump to `v1.24.x`. Before repeating the steps above, switch from `dockershim` to `containerd` as the default container runtime for your cluster.  If you don't have 
`containerd` installed, [this guide](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/change-runtime-containerd/) 
has instructions on updating from Docker to `containerd.`

SSH to your control plane and switching to the `root` user.

```shell
[you@controlplane] $ sudo su -
```
{:data-add-copy-button='true'}

Configure `kubectl`/`kubeadm`.

```shell
[root@controlplane] # export KUBECONFIG=/etc/kubernetes/admin.conf
```
{:data-add-copy-button='true'}

Stop any existing `containerd` service, set it the default runtime, and enable the service. 

```shell
systemctl stop containerd && \
containerd config default | sudo tee /etc/containerd/config.toml && \
systemctl enable --now containerd
```
{:data-add-copy-button='true'}

Stop the `kubelet` service, configure `containerd` as the new runtime endpoint, and restart the service.  

```shell
systemctl stop kubelet
```
{:data-add-copy-button='true'}

```shell
echo 'KUBELET_KUBEADM_ARGS="--pod-infra-container-image=k8s.gcr.io/pause:3.4.1 --container-runtime=remote --container-runtime-endpoint=unix:///run/containerd/containerd.sock"' > /var/lib/kubelet/kubeadm-flags.env
```
{:data-add-copy-button='true'}

```shell
systemctl daemon-reload && \
systemctl restart kubelet
```
{:data-add-copy-button='true'}

Next, for each worker node edit its manifest.

```shell
kubectl edit node <workernode>
```
{:data-add-copy-button='true'}

In the file content replace:

```yaml
...
metadata:
   annotations:
      ...
      kubeadm.alpha.kubernetes.io/cri-socket: /var/run/dockershim.sock
      ...
...
```
{:data-add-copy-button='true'}

with:

```yaml
...
metadata:
   annotations:
      ...
      kubeadm.alpha.kubernetes.io/cri-socket: unix:///run/containerd/containerd.sock
      ...
...
```
{:data-add-copy-button='true'}

Save the file and exit the editor.

Finally, complete the final upgrade from `v1.23.10` to `v1.24.x` using the steps described above, adjusting the K8s versions described in the commands accordingly.

#### Additional information

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24.x` using `kubeadm`.


<span id="update-ingress-objects"></span>
### (Optional) Update Ingress Objects

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

Support for `v1beta1` Ingress objects have been deprecated and completely removed by Kubernetes `v1.22`.  You will only
need to update manifests to use the new Ingress objects.  Any Ingress objects currently active on your cluster will 
automatically get updated when Kubernetes is upgraded to `v1.22`.  See the 
[Kubernetes deprecation guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/#ingress-v122) for
more details on the deprecation.

If you need to update a manifest, [this article](https://awstip.com/upgrading-kubernetes-ingresses-from-v1beta1-to-v1-7f9235765332) 
gives step by step instructions on what is needed.  

If you need further assistance, please contact the [the SLATE team](/community/).



<span id="update-calico-cni"></span>
### (Recommended) Update Calico CNI

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

Update the Calico CNI to `>= v3.24.1`.
* If you followed our [Manual Cluster Installation](https://slateci.io/docs/cluster/manual/slate-master-node.html#pod-network) instructions when initially setting up your cluster, use the example below to update your Tigera operators and custom resources files.
* If you chose a different route for initially installing and configuring Calico, please refer directly to the [Calico documentation](https://projectcalico.docs.tigera.io/maintenance/kubernetes-upgrade) for update procedures.

#### Example

{% include alert/note.html content="If you changed the default IPv4 range during the initial installation, download, modify, and apply your own `custom-resources.yaml`." %}

Install a newer version of Calico using the operator: 

```shell
CALICO_VERSION=3.24.1 && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/tigera-operator.yaml && \
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

For more information on updating Calico see [Upgrade Calico on Kubernetes](https://projectcalico.docs.tigera.io/maintenance/kubernetes-upgrade).

<span id="update-metallb"></span>
### (Recommended) Update MetalLB

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

Update MetalLB to `>= v0.13.5`.
* If you followed our [Manual Cluster Installation](https://slateci.io/docs/cluster/manual/slate-master-node.html#load-balancer) instructions when initially setting up your cluster, use the example below to update your MetalLB installation.
* If you chose a different route for initially installing and configuring MetalLB, please refer directly to the [MetalLB documentation](https://metallb.universe.tf/installation/) for update procedures.

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

Create a new custom resource (CR) with the gathered IP pool information:

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

Then create a Layer 2 advertisement for the `first-pool` address pool:

```shell
cat <<EOF > /tmp/metallb-ipaddrpool-advert.yml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: example
  namespace: metallb-system
spec:
  ipAddressPools:
  - first-pool
EOF
```
{:data-add-copy-button='true'}

```shell
kubectl create -f /tmp/metallb-ipaddrpool-advert.yml
```
{:data-add-copy-button='true'}

Finally, remove the deprecated `ConfigMap`:

```shell
kubectl delete configmap config -n metallb-system
```
{:data-add-copy-button='true'}

For more information on updating MetalLB see [Installation By Manifest](https://metallb.universe.tf/installation/#installation-by-manifest).

## SLATE Tasks

<span id="update-fed-ctrl-role"></span>
### Update the SLATE Federation Controller Role

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

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

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

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

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

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
