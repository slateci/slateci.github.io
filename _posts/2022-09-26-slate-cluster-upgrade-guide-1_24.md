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
2. Allow pods to run on single-node clusters (<a href="#untaint">see below</a>)
3. (Optional) Upgrade manifests with  `v1beta1` Ingress objects to `v1` (<a href="#update-ingress-objects">see below</a>)
4. (Recommended) Update the Calico CNI to `>= v3.24.1` (<a href="#update-calico-cni">see below</a>)
5. (Recommended) Update MetalLB to `>= v0.13.5` (<a href="#update-metallb">see below</a>)

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

Configure `kubectl`/`kubeadm` and check the state of the Kubernetes nodes.

```shell
export KUBECONFIG=/etc/kubernetes/admin.conf
```
{:data-add-copy-button='true'}

```shell
kubectl get nodes
```
{:data-add-copy-button='true'}

The output should resemble:

```shell
NAME                    STATUS   ROLES           AGE     VERSION
<worker>                Ready    <none>          2y68d   v1.22.1
<controlplane>          Ready    control-plane   2y68d   v1.22.1
```

#### Install and configure `containerd`
If you are using Docker on your cluster, you'll need to switch the kubernetes runtime from Docker to `containerd` because Kubernetes removed support for Docker in `v1.24.0`.  [This guide](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/change-runtime-containerd/) 
has instructions on updating from Docker to `containerd.`  Please note that [this step](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/change-runtime-containerd/#configure-the-kubelet-to-use-containerd-as-its-container-runtime) 
in the guide needs to be done for each node in your kubernetes cluster.

#### Determine the upgrade path

Best practice is to upgrade from one Kubernetes minor release to the next and so forth down the line all the way to `v1.24.x`. For example, if you are starting at `v1.21.x` the upgrade path should resemble:

  * `v1.21.x` --> `v1.22.15`
  * `v1.22.15` --> `v1.23.12`
  * `v1.23.12` --> `v1.24.x`

*Note:* The patchlevel of the minor releases may have changed since this
document was written.  See [this
page](https://kubernetes.io/releases/patch-releases/) to get the latest
patchlevel to use for each minor release.  E.g. `v1.22.16` instead of `v1.22.15`

#### Upgrade the control plane

Let's assume that like the example above, we are beginning with Kubernetes `v1.21.x`. Install the related packages for Kubernetes `v1.22.15`, making sure the `kubernetes` YUM repo is enabled.

```shell
yum update --enablerepo=kubernetes kubelet-1.22.15 kubeadm-1.22.15 kubectl-1.22.15
```
{:data-add-copy-button='true'}

Check that your cluster can be upgraded from `v1.21.x` --> `v1.22.15`.

```shell
kubeadm upgrade plan
```
{:data-add-copy-button='true'}

If there aren't any issues proceed with the upgrade. 

```shell
kubeadm upgrade apply v1.22.15
```
{:data-add-copy-button='true'}

The output should resemble:

```shell
[upgrade/successful] SUCCESS! Your cluster was upgraded to "v1.22.15". Enjoy!

[upgrade/kubelet] Now that your control plane is upgraded, please proceed with upgrading your kubelets if you haven't already done so.
```

Restart `kubelet` and check its status.

```shell
systemctl daemon-reload && \
systemctl restart kubelet && \
systemctl status kubelet 
```
{:data-add-copy-button='true'}

#### Upgrade the worker nodes one at a time

Leaving a terminal connected to the control plane, SSH to your first worker node in a fresh terminal, and switch to the `root` user.

Install the related packages for Kubernetes `v1.22.15`, making sure the `kubernetes` YUM repo is enabled.

```shell
yum update --enablerepo=kubernetes kubelet-1.22.15 kubeadm-1.22.15 kubectl-1.22.15
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

Configure `kubectl`/`kubeadm` and check the state of the Kubernetes nodes.

```shell
export KUBECONFIG=/etc/kubernetes/admin.conf
```
{:data-add-copy-button='true'}

```shell
kubectl get nodes
```
{:data-add-copy-button='true'}

The output should resemble:

```shell
NAME                    STATUS   ROLES           AGE     VERSION
<worker>                Ready    <none>          2y68d   v1.22.15 
<controlplane>          Ready    control-plane   2y68d   v1.22.15 
```

If everything was successful the control plane and workers should all report as `v1.22.15`.

#### Next steps: `v1.22.15` to `v1.23.12`

At this point in the example your cluster should be running `v1.22.15`. Repeat the steps described above to upgrade from `v1.22.15` to `v1.23.12`:
* Adjusting the K8s versions described in the commands accordingly.

#### Next steps: `v1.23.12` to `v1.24.x`

At this point in the example your cluster should be running `v1.23.12`. Repeat the steps described above to upgrade from  `v1.23.12` to `v1.24.x`:
* Adjusting the K8s versions described in the commands accordingly.
* Removing the `--network-plugin` option from `/var/lib/kubelet/kubeadm-flags.env` before restarting each of the `kubelet`s.

#### Additional information

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24.x` using `kubeadm`.

<span id="untaint"></span>
### Single-Node Clusters

By default, Kubernetes prevents pods from running on the Control-Plane/Master node. Running a single-node cluster requires removing this setting so that Kubernetes has the resources to run pods. **If you a running a multi-node cluster, this step is not necessary.** 

The following command has two options based on the terminology change from Master node to Control-Plane node. If the first command referencing the Master node results in an error, try the second command, which instead references the Control-Plane node. 

```shell
kubectl taint nodes --all node-role.kubernetes.io/master:NoSchedule-
```
{:data-add-copy-button='true'}

If the previous command resulted in an error, try running this command instead: 

```shell
kubectl taint nodes --all node-role.kubernetes.io/control-plane:NoSchedule-
```
{:data-add-copy-button='true'}

<span id="update-ingress-objects"></span>
### (Optional) Update Ingress Objects

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

Support for `v1beta1` Ingress objects have been deprecated and completely removed by Kubernetes `v1.22`.  You will only
need to update manifests to use the new Ingress objects.  Any Ingress objects currently active on your cluster will 
automatically get updated when Kubernetes is upgraded to `v1.22`.  See the 
[Kubernetes deprecation guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/#ingress-v122) for
more details on the deprecation.

If you need to update a manifest, [this article](https://awstip.com/upgrading-kubernetes-ingresses-from-v1beta1-to-v1-7f9235765332) 
gives step-by-step instructions on what is needed.  

If you need further assistance, please contact [the SLATE team](/community/).



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
kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/main/resources/installation/federation-role.yaml
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
   kubectl apply -f https://raw.githubusercontent.com/slateci/federation-controller/main/resources/installation/upgrade-controller-debug.yaml
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

*Note:* You will need helm to update the SLATE Ingress controller.  If you do
not have helm installed, you can install it following [these
instructions.](https://helm.sh/docs/intro/install/)

Updating the SLATE Ingress Controller involves the following steps:

1. Download the manifest for the nginx-controller by running the following command:

   ```shell
   wget https://raw.githubusercontent.com/slateci/slate-client-server/develop/resources/nginx-ingress.yaml

   ```
   {:data-add-copy-button='true'}

2. Edit the manifest and replace all instances of `{% raw %} {{SLATE_NAMESPACE}} {% endraw %}` with the namespace that slate is using on your cluster (i.e `slate-system`)

3. Install the new SLATE Ingress Controller 

   ```shell
   kubectl apply -f nginx-ingress.yaml
   ```
   {:data-add-copy-button='true'}
