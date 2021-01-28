---
title: "Persistent Volumes"
overview: Introducing Persistent Volumes.
published: true
permalink: blog/persistent-volumes.html
attribution: Jason Stidd 
layout: post
type: markdown
tag: draft
---

A commonly requested feature for SLATE has been to add persistent volumes. We are now introducing persistent volumes for the SLATE platform. Adding a persient volume is easy and can be used with any application that accepts persistent volumes in their configuration. 

<!--end_excerpt-->

Currently, we have this feature available in the CLI. We are still working on adding it to the website portal to provide a graphical interface to add persistent volumes. The Portal should be updated in the next few days. 

To add a persistent volume to an application through the CLI, we first create the persistent volume. Then we add the name of the volume to the configuration file of the application we are launching. 

```
$ slate -h 

Subcommands:
  version                     Print version information
  completion                  Print a shell completion script
  group                       Manage SLATE groups
  cluster                     Manage SLATE clusters
  app                         View and install SLATE applications
  instance                    Manage SLATE application instances
  secret                      Manage SLATE secrets
  volume                      Manage SLATE volumes
  whoami                      Fetch current user credentials
  user                        Manage SLATE users
```

Now to see what options are available under volumes, I use the -h flag again. 

```
$ slate volume -h

Subcommands:
  list                        List volumes
  info                        Fetch information about a volume
  create                      Create a new volume
  delete                      Remove a volume from SLATE
```

I am creating a new volume and need to see the required (and optional) parameters; therefore, I use the -h flag again. 

```
$ slate volume create -h

Options:
  -h,--help                   Print this help message and exit
  --group TEXT REQUIRED       Group for which to create volume
  --cluster TEXT REQUIRED     Cluster to create volume on
  --size TEXT REQUIRED        Size of the volume's storageRequest (specify units)
  --accessMode TEXT           AccessMode of the volume (default is ReadWriteOnce)
  --volumeMode TEXT           VolumeMode (Filesystem or Block)
  --storageClass TEXT REQUIRED
                              The StorageClass the volume will be requested from
```

As usual, the group and cluster are required. Also required are the size, access mode, and storage class. 

Storage class is a term used in Kubernetes, the technology we use under the hood for SLATE. In SLATE it is the name of underlying storage offered by a cluster. This storage may be Network File Storage (NFS) or Ceph, or any other number of methods for providing persistent storage. The storage class's name is determined by the cluster administrator and may be different on each cluster. We are currently working out a way to advertise the storage classes' names on each cluster. In the meantime, it may be necessary to communicate with the cluster administrator to find out what is currently available. The point of contact for each cluster is listed in the SLATE Portal on the website. 

Size, also a required field, takes a number plus the size suffix: options include T, G, M, K  and their power of two equivalents: Ti, Gi, Mi, Ki. An example of size is `10Mi` for 10 megabytes.

accessMode is the read write mode of the volume and accepts the following values: ReadWriteOnce, ReadOnlyMany, or ReadWriteMany. 

Here is the CLI command to implement a persistent volume on `uchicago-prod` cluster with storage class `slateci-nfs`.

```
$ slate volume create --group <group-name> --cluster uchicago-prod --size 100Mi --accessMode ReadWriteMany --volumeMode Filesystem --storageClass slateci-nfs my-volume

Creating volume...
Successfully created volume my-volume with ID volume_xxxxxxxxx
```

To be continued with an exmaple of configuring an application to use the persistent volume that I just created...

