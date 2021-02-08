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

SLATE uses containers to run applications, which are ephemeral. Without an external volume, the container writes data locally, and that data is lost when the container is shut down or fails. In SLATE, if an application container fails, it is relaunched. Without a persistent volume, any data written to disk is not available to the relaunched instances of that application. Persistent volumes live outside the container and are mounted to a directory within the application container. If the application is relaunched, the persistent volume will again be mounted, making the data available to the new instance. An application instance can also be deleted and a new one created with the same persistent volume. We often see this when upgrading software or changing the configuration.

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

In this example replace `<group-name>` with the name of your group. 

```
$ slate volume create --group <group-name> --cluster uchicago-prod --size 100Mi --accessMode ReadWriteMany --storageClass slateci-nfs my-volume

Creating volume...
Successfully created volume my-volume with ID volume_xxxxxxxxx
```

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

### Conclusion

With just a few commands we were able create a persistent volume and run an application that consumes that volume. Applications running on SLATE are run through containers and are ephemeral. If an application crashes or is otherwise not responding, SLATE will relaunch the application. Without a persistent volume, anything saved in the applicationw would be lost as it is just written locally in the container. However, with a persistent volume the application will relaunch and mount that volume so that saved data is available to the new container.

## Logging into JupyterLab

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