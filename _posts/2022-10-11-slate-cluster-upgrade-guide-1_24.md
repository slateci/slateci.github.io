---
title: SLATE Cluster Upgrade Guide - K8s v1.24
overview: Update SLATE clusters to K8s v1.24
published: true
permalink: blog/slate-cluster-upgrade-guide-1_24.html
attribution: The SLATE Team
layout: post
type: markdown
---

The team has been busy preparing SLATE for Kubernetes (K8s) `v1.24.x` and today we are happy to announce that this work is now live. As cluster administrators there are several upgrade tasks you must perform to continue using SLATE with this new version of K8s.

<!--end_excerpt-->

## Table of Contents

This post will walk you, the cluster administrator, through the following tasks:

### Kubernetes Tasks

1. Upgrade your SLATE Kubernetes Cluster from K8s `v1.x` to `v1.24.x` using `kubeadm` (<a href="#upgrade-k8s">see below</a>)
2. Allow pods to run on single-node clusters (<a href="#untaint">see below</a>)
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

<br>

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

<br>

#### Install and configure `containerd`
If you are using Docker on your cluster, you'll need to switch the kubernetes runtime from Docker to `containerd` because Kubernetes removed support for Docker in `v1.24.0`.  [This guide](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/change-runtime-containerd/) 
has instructions on updating from Docker to `containerd.`  Please note that [this step](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/change-runtime-containerd/#configure-the-kubelet-to-use-containerd-as-its-container-runtime) 
in the guide needs to be done for each node in your kubernetes cluster.

After updating to containerd, one more change must be made to the service to increase the number of open files. The default value is limitNOFILE=infinity, but due to a regression, 'infinity' sets the limit at 65k. The following commands will increase it to 100k, which is required to run some applications such as XCache. 

```shell
systemctl edit containerd
```
{:data-add-copy-button='true'}

In the editor add the following line:
```shell
LimitNOFILE=1048576
```
{:data-add-copy-button='true'}

Then restart the service
```shell
systemctl restart containerd
```
{:data-add-copy-button='true'}

<br>

#### Determine the upgrade path

Best practice is to upgrade from one Kubernetes minor release to the next and so forth down the line all the way to `v1.24.x`. For example, if you are starting at `v1.21.x` the upgrade path should resemble:

  * `v1.21.x` --> `v1.22.15`
  * `v1.22.15` --> `v1.23.13`
  * `v1.23.13` --> `v1.24.x`

*Note:* The patchlevel of the minor releases may have changed since this
document was written.  See [this
page](https://kubernetes.io/releases/patch-releases/) to get the latest
patchlevel to use for each minor release.  E.g. `v1.22.16` instead of `v1.22.15`

<br>

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

<br>

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

<br>

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

<br>

#### Next steps: `v1.22.15` to `v1.23.12`

At this point in the example your cluster should be running `v1.22.15`. Repeat the steps described above to upgrade from `v1.22.15` to `v1.23.12`:
* Adjusting the K8s versions described in the commands accordingly.

<br>

#### Next steps: `v1.23.12` to `v1.24.x`

At this point in the example your cluster should be running `v1.23.12`. Repeat the steps described above to upgrade from  `v1.23.12` to `v1.24.x`:
* Adjusting the K8s versions described in the commands accordingly.
* Removing the `--network-plugin` option from `/var/lib/kubelet/kubeadm-flags.env` before restarting each of the `kubelet`s.

<br>

#### Additional information

See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) for complete instructions on updating a Kubernetes cluster from `v1.x` to `v1.24.x` using `kubeadm`.

<br>

<span id="untaint"></span>
### Single-Node Clusters

By default, Kubernetes prevents pods from running on the Control-Plane/Master node. Running a single-node cluster requires removing this setting so that Kubernetes has the resources to run pods. **If you a running a multi-node cluster, this step is not necessary.** 

```shell
kubectl taint nodes --all node-role.kubernetes.io/master:NoSchedule-
```
{:data-add-copy-button='true'}

<br>

<span id="update-calico-cni"></span>
### (Recommended) Update Calico CNI

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

Run this command to get the version of Calico CNI currenlty installed:

```shell
 kubectl describe pod -n `kubectl get pods -A | grep calico | grep controller | awk '{print $1" "$2}'` | grep Image: | awk -F: '{print $3}'
```
{:data-add-copy-button='true'}

<br>

If the version is < v3.24.1, update the Calico CNI to `>= v3.24.1`.
* If you followed our [Manual Cluster Installation](https://slateci.io/docs/cluster/manual/slate-master-node.html#pod-network) instructions when initially setting up your cluster, use the example below to update your Tigera operators and custom resources files.
* If you chose a different route for initially installing and configuring Calico, please refer directly to the [Calico documentation](https://projectcalico.docs.tigera.io/maintenance/kubernetes-upgrade) for update procedures.

<br>

#### Example

{% include alert/note.html content="If you changed the default IPv4 range during the initial installation, download, modify, and apply your own `custom-resources.yaml`." %}

Install a newer version of Calico using the operator: 

```shell
CALICO_VERSION=3.24.1 && \
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/tigera-operator.yaml && \
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v${CALICO_VERSION}/manifests/custom-resources.yaml
```
{:data-add-copy-button='true'}

For more information on updating Calico see [Upgrade Calico on Kubernetes](https://projectcalico.docs.tigera.io/maintenance/kubernetes-upgrade).

<br>

Once Calico is updated, you can verify it is working with the following commands: 

```shell
kubectl run pingtest --image=busybox -it /bin/sh
```
{:data-add-copy-button='true'}

```shell
ping google.com
```
{:data-add-copy-button='true'}

This shows that the DNS is working and is a good indication that Calico is working. 

<br>

<span id="update-metallb"></span>
### (Recommended) Update MetalLB

{% include alert/note.html content="If you encounter an error while performing these steps contact [the SLATE team](/community/) for further assistance." %}

Run this command to get the version of MetalLB currently installed:
```shell
kubectl describe pod -n `kubectl get pods -A | grep metal | grep controller | awk '{print $1" "$2}'` | grep Image: | awk -F: '{print $3}'
```
{:data-add-copy-button='true'}

<br>

If the version is < v0.13.5, update MetalLB to `>= v0.13.5`.
* If you followed our [Manual Cluster Installation](https://slateci.io/docs/cluster/manual/slate-master-node.html#load-balancer) instructions when initially setting up your cluster, use the example below to update your MetalLB installation.
* If you chose a different route for initially installing and configuring MetalLB, please refer directly to the [MetalLB documentation](https://metallb.universe.tf/installation/) for update procedures.

<br>

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

Create a new custom resource (CR) with the gathered IP pool information. Replace the IP addresses in this example with the IP addresses from the previous command. 

```shell
cat <<EOF > /tmp/metallb-ipaddrpool.yml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb-system
spec:
  addresses:
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

<br>

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

<br>

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

The logs should look something like the following: 

```
I1011 21:00:41.448491       1 clusterns_controller.go:138] Waiting for informer caches to sync
I1011 21:00:41.448598       1 reflector.go:219] Starting reflector *v1alpha2.ClusterNS (30s) from pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167
I1011 21:00:41.448618       1 reflector.go:255] Listing and watching *v1alpha2.ClusterNS from pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167
I1011 21:00:41.549025       1 shared_informer.go:270] caches populated
I1011 21:00:41.549062       1 clusterns_controller.go:143] Starting workers
I1011 21:00:41.549091       1 clusterns_controller.go:149] Started workers
I1011 21:01:01.452612       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync
I1011 21:01:11.452267       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync
I1011 21:01:31.453082       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync
I1011 21:03:31.455629       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync
...
I1013 01:02:06.178662       1 reflector.go:536] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: Watch close - *v1alpha2.ClusterNS total 7 items received
I1013 01:02:14.611427       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync
I1013 01:02:34.311275       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync
I1013 01:02:42.263067       1 reflector.go:536] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: Watch close - *v1.Deployment total 12 items received
I1013 01:02:44.612985       1 reflector.go:382] pkg/mod/k8s.io/client-go@v0.23.5/tools/cache/reflector.go:167: forcing resync

```

A line like the following is normal and does not indicate that an error
occurred:

```
W1011 21:00:31.445414       1 client_config.go:617] Neither --kubeconfig nor --master was specified.  Using the inClusterConfig.  This might not work.
```

<br>

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

1. Edit the manifest and make the following changes:
   1. Replace all instances of `{{ "{{" }} SLATE_NAMESPACE {{ "}} }}` with the namespace that slate is using on your cluster (i.e `slate-system`)
   1. If your cluster is using IPv4, replace `{% raw %} {{IP_FAMILY_POLICY}} {% endraw %}` with `SingleStack` and `{% raw %} {{IP_FAMILIES}} {% endraw %}` with `IPv4`
   1. If your cluster is using IPv6, replace `{% raw %} {{IP_FAMILY_POLICY}} {% endraw %}` with `SingleStack` and `{% raw %} {{IP_FAMILIES}} {% endraw %}` with `IPv6`
   1. If your cluster is using IPv6, replace `{% raw %} {{IP_FAMILY_POLICY}} {% endraw %}` with `PreferDualStack` and `{% raw %} {{IP_FAMILIES}} {% endraw %}` with

      ```
   		- IPv6
        - IPv4

      ```


1. Install the new SLATE Ingress Controller 

   ```shell
   kubectl apply -f nginx-ingress.yaml
   ```
   {:data-add-copy-button='true'}

If you look at the logs, a line like the following may appear but is normal:

```
E1026 18:56:04.160926       8 reflector.go:140] k8s.io/client-go@v0.25.2/tools/cache/reflector.go:169: Failed to watch *v1.EndpointSlice: unknown (get endpointslices.discovery.k8s.io)
```
