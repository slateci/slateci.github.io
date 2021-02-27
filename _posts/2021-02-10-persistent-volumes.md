---
title: Managing Storage with Persistent Volumes
overview: Managing Storage with Persistent Volumes
published: true
permalink: blog/persistent-volumes.html
attribution: Jason Stidd 
layout: post
type: markdown
---

A commonly requested feature for SLATE has been to add persistent volumes. We are now introducing persistent volumes for the SLATE platform. Adding a persient volume is easy and can be used with any application that accepts persistent volumes in their configuration. 

<!--end_excerpt-->

## Persistent Volumes in K8s

Persistent Volumes is a Kubernetes [concept](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), it is a piece of storage in the cluster that has been provisioned by an administrator or dynamically provisioned using Storage Classes. Persistent Volumes have a lifecycle that are independent of an application. 

## Create a Persistent Volume

In SLATE, we provide this functionality in the CLI and the web Portal. In this blog post we will use the CLI to setup a persistent volume. To add a persistent volume to an application, we first create the persistent volume, then we add the name of the volume to the configuration file of the application we are launching. 

To see what options are available in SLATE, I recommend using the -h flag. 

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


- `size` takes a number plus the size suffix: options include T, G, M, K  and their power of two equivalents: Ti, Gi, Mi, Ki. An example of size is `10Mi` for 10 megabytes.
- `accessMode` is the read write mode of the volume and accepts the following values: ReadWriteOnce, ReadOnlyMany, or ReadWriteMany. 
- The `storageClass` name is determined by the cluster administrator and may be different on each cluster. We are currently working out a way to advertise the storage classes' names on each cluster. In the meantime, it may be necessary to communicate with the cluster administrator to find out what is currently available. The point of contact for each cluster is listed in the SLATE Portal on the website. 

Here is the CLI command to implement a persistent volume on `uchicago-prod` cluster with storage class `slateci-nfs`.

In this example replace `<group-name>` with the name of your group. 

```
$ slate volume create --group <group-name> --cluster uchicago-prod --size 100Mi --accessMode ReadWriteMany --storageClass slateci-nfs my-volume

Creating volume...
Successfully created volume my-volume with ID volume_avhVWbvRhVg 
```

We can now verify the volume with `slate volume info <volume_id>`, which uses the volume id provided in the previous command: 

```
$ slate volume info volume_avhVWbvRhVg

Name      Created                         Group     Cluster       ID
my-volume 2021-Feb-10 22:45:27.006551 UTC <group-name> uchicago-prod volume_avhVWbvRhVg

Details:
Storage Request Access Mode   Volume Mode Storage Class
100Mi           ReadWriteMany Filesystem  slateci-nfs

Status:
Status
Bound
```


## Demo with an App

We will use this persistent volume with JupyterLab. The following command will download the configuration file for SLATE's version of JupyterLab and save it to a file name jupyter.conf. 

```
$ slate app get-conf jupyter-notebook --dev > jupyter.conf
```

Open the config file and change the PersistentVolume field with the name of your persistent volume created above - in this case, I named it my-volume. 

```
# Persistent Volume mounted as 'data' in the user's home directory
PersistentVolume: my-volume
```

We can now launch JupyterLab with this configuration file. It will set up a directory named data in the user's home directory where the user can save their notebooks. 

```
$ slate app install jupyter-notebook --dev --group <group-name> --cluster uchicago-prod --conf jupyter.conf

Installing application...
Successfully installed application jupyter-notebook as instance jupyter-notebook with ID instance_********
```

## Conclusion

With just a few commands we were able create a persistent volume and run an application that consumes that volume. Persistent volumes have a lifecycle independent of an application. If an application is relaunched (for an upgrade or restarted after a crash) the data on the volume is still available to the new application instance.  

## Final notes: Logging into JupyterLab

If you followed along with this tutorial you will now have JupyterLab running on a SLATE cluster. While the tutorial demonstrating how to use persistent volumes is complete, it would be nice to know how to log into your new JupyterLab instance and save a notebook to the persistent volume.

There were more options available in the JupyterLab configuration file.Since I did not change any configuration beyond adding the persistent volume I will domenstrate logging in with the default settings. 

Run the following command to get the URL to your instance of JupyterLab and the randomly generated token required to login: 

```
$ slate instance info instance_********
```

(The instance ID was provided after launching the application above)

result: 
```
Services:
Name             Cluster IP   External IP     Ports          URL
jupyter-notebook 10.96.184.79 xxx.xxx.xxx.xxx 8888:***** /TCP http://jupyter.uchicago-prod.slateci.net/
```

Scroll down to see the Configuration section. There is a randomly generated token: 

```
Token: !<!> 90249339b038==RandomlyGenerated==cf4276925cb6b152
```

Visit the URL in your web browser and you will see a form requesting a token. Copy the token into the form and submit. 

Once logged in, you can create a new notebook and save it into the `data` directory. You could now delete and relaunch the application on SLATE with the same volume, and your data will be available when you log in. Or, if a node were to crash, you would not lose any data.

