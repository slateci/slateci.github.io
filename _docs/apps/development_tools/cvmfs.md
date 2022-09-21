---
title: CVMFS Repositories
overview: How to mount a CVMFS repository as a persistent read-only filesystem for your application

order: 40

layout: docs2020
type: markdown
---
{% include home.html %}

CVMFS is the CernVM File System, which is used to mount remote repositories as local read-only filesystems accessible through HTTP. This can be very useful in the case of computation of large datasets. Additionally, users often use an HTTP Proxy Cache such as Frontier Squid to cache accessed data from the repository.

## CVMFS Client on SLATE

The CVMFS client provisioner developed by CERN has been provided as a tool for developers within SLATE. This tool allows developers to mount a CVMFS repository as persistent storage within their application.

## Creating a Storage Class

In order to specify the repository and HTTP proxy that the CVMFS client should connect to, a user must create a storage class specifying these parameters.  

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: my-repo-sc
provisioner: csi-cvmfsplugin
parameters:
  repository: my.repo.ch
  proxy: 0.42.42.42:3128
reclaimPolicy: Delete
```
{:data-add-copy-button='true'}

* If `proxy` is not provided, the CVMFS client will default to using a direct connection to the repository.
* A `tag` or `hash` parameter may also be provided, but not both. If not provided, `tag` will default to `trunk`.

## Creating a Persistent Volume Claim

The CVMFS Container Storage Interface (CSI) will dynamically provision a persistent volume once a persistent volume claim is created for a storage class that uses the provisioner.

Here is an example of a `pvc` that uses the above storage class.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-pvc
spec:
  accessModes:
  - ReadOnlyMany
  resources:
    requests:
      storage: 5Gi
  storageClassName: my-repo-sc
```
{:data-add-copy-button='true'}

What is important to note is that this claim is `ReadOnlyMany`. The claim must be `ReadOnly` or `ReadOnlyMany` because there are no write permission to the repository through the CVMFS client.

## Mounting the Volume

In order to use the provisioned volume within your application, it must be mounted as a volume.

```yaml
...
volumeMounts:
- mountPath: /srv
  name: mypvc
...
volumes:
- name: mypvc
  persistentVolumeClaim:
    claimName: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-pvc
    readOnly: true
...
```
{:data-add-copy-button='true'}
