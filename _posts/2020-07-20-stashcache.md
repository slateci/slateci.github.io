---
title: "Deploying OSG Caches with SLATE"
overview: Blog
published: true
permalink: blog/deploying-stashcache.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft
---

One of the challenges of distributed high-throughput computing is efficiently moving data to and from jobs across a national fabric of resources. To tackle this problem, the Open Science Grid developed a data caching technology known as StashCache. Sites who are already providing compute resources to the OSG can streamline data access by deploying a cache at their site. Thanks to nice fail-over properties, caches are an excellent way to get started with SLATE at your site while streamlining data access and reducing overall bandwidth consumed by OSG jobs. In this blog post, we'll fully deploy an OSG StashCache service and link it up to the federation. 

## Prerequisites

This post assumes that you already have a working SLATE cluster, but if not you can visit the Cluster installation guide here: https://slateci.io/docs/cluster/

If you plan to join this StashCache to the OSG federation, you'll additionally need to get a IGTF host certificate for this service from your institution.

## Installing the StashCache application

First, you'll want to get the configuration for the StashCache application:

```bash
slate app get-conf stashcache > stashcache.yaml
```

Open it in your favorite editor, e.g. vim:

```bash
vim stashcache.yaml
```

You'll want to make changes in 4 sections. First, change the Instance tag to something memorable. I used "iu-mwt2".
```yaml
# Label for this particular deployed instance
# Results in a name like "stashcache-[Instance]"
Instance: "iu-mwt2"
```

### Configuring the host
If you want to use this cache for real data, you'll want to point StashCache at some directory on your _host_ system, from which StashCache will serve data. 

For this deployment, I have mounted an XFS filesystem to the mountpoint "/slate-cache" on the host system. The configuration will need to be modified correspondingly. 
```yaml
StashCache:
  # The directory on the host system in which the cache should store its data.
  # If unspecified, ephemeral storage will be used, meaning that the cache
  # contents will be lost any time the application is restarted.
  CacheDirectory: /slate-cache
```

While you're here, you may want to change other options as well. Since this will be a production cache, I increased the `RamSize` from the default 1GB to 64GB:
```yaml
  # The amount of memory the cache is allowed to use (in GB)
  RamSize: 64g
```

### Configuring & installing the certificate

In order for your Cache to communicate with the central OSG collector, you will need to acquire and install an IGTF certificate. The process of acquiring the certificate is outside of the scope of this blog post, but once you have it you'll need to ensure that it is in PEM format.

To install the certificate to the cluster, you'll need to use the `slate secret` command:
```bash
slate secret create stashcache-cert --from-file=hostcert.pem --from-file=hostkey.pem
```

Then, you'll want to take the secret name and put that into the StashCache config file:
```yaml
# Host Certificate and Key
# The keys contained in the secret must be:
#    hostcert.pem
#    hostkey.pem
# run 'slate secret create --help' for usage
# Leaving this as the empty string will disable the authenticated cache.
hostCertSecret: stashcache-cert
```

It's possible to install StashCache without an IGTF certificate, however you will not be able to federate your cache with the OSG federation. 

### Deploying the app

Finally, once you have configured the StashCache application to your satisfaction, you can deploy the application:

```bash
slate app install stashcache --conf stashcache.yaml --group <your group> --cluster <your cluster>
```

If all goes well, SLATE will successfully install the cache and give you an instance ID. You can use that ID to check the status
```bash
$ slate instance info instance_6rH9TMkq0fY
Fetching instance information...
Name                    Started                         App Version Chart Version     Group Cluster ID
stashcache-mwt2-iu-test 2020-Jul-20 20:41:55.237425 UTC v4.12.0-rc2 stashcache-0.1.15 mwt2  mwt2-iu instance_6rH9TMkq0fY

Services:
Name                          Cluster IP     External IP     Ports          URL
stashcache-mwt2-iu-test-http  10.105.253.127 149.165.225.214 8000:31612/TCP 149.165.225.214:31612
stashcache-mwt2-iu-test-xroot 10.108.181.32  149.165.225.214 1094:32009/TCP 149.165.225.214:32009
```

From the URL field reported by SLATE, you can run a test to ensure your cache is working over the HTTP protocol:
```bash
 $ curl http://149.165.225.214:31612/osgconnect/public/rynge/test.data
hello world!
```

## Registering your cache in the OSG Topology system

