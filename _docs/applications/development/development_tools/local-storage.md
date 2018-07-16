---
title: Persistent Local Storage
overview: How to claim persistent local storage on a cluster for your application

order: 20

layout: docs
type: markdown
---
{% include home.html %}

# Persistent Local Storage
By default, storage for a deployment exists within the container as ephemeral storage. For some applications, such as caches, persistent local storage may be important for optimizing application use.

## Local Storage Provisioning on SLATE
Local storage space is currently being provisioned by the Kubernetes `nfs-provisioner` mounted to the filesystem of one node within a cluster. This allows the storage to be dynamically provisioned and cleaned up with deployments in a user-friendly way.

Kubernetes v1.12 will include a `local-provisioner` as an alpha feature. This is likely the direction that SLATE will take in the future. This change will likely only affect the `storageClassName` for developers utilizing the local storage system.

## Creating a Persistent Volume Claim
In order to claim persistent local storage, a user must create a `persistent volume claim` (`pvc`) and mount it as a `volume` within their application.

The `pvc` template should look similar to  
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-pvc
spec:
  accessModes:
    - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: {% raw %}{{ .Values.LocalStorageSize }}{% endraw %}Gi
  storageClassName: nfs-provisioner
```  
The important feature of this is the `storageClassName` which must match `nfs-provisioner`.

The `pvc` is then mounted within the application deployment as a volume as follows 
```yaml
...
volumeMounts:
- mountPath: /etc/
  subPath: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-cache
  name: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-pvc
...
volumes:
- name: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-pvc
  persistentVolumeClaim:
    claimName: my-application-{% raw %}{{ .Values.Instance }}{% endraw %}-pvc
```

## Including a Node Affinity
In order for an application to utilize persistent local storage, it must exist on the same node in the cluster as the persistent local storage was provisioned. In order to guarantee this property, we use a `NodeSelector` in the deployment which schedules the application on the same node as the provisioner.  
```yaml
...
nodeSelector:
  storage: "local"
...
```
