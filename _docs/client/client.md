{% include home.html %}

## Installing the SLATE Client

The SLATE Client is a command line interface (CLI) intended to give [edge administrators](http://slateci.io/docs/concepts/individual-roles/edge-administrator.html) and [application administrators](http://slateci.io/docs/concepts/individual-roles/application-administrator.html) a convenient way to work with the platform.

You can get the client executable and credentials from the [web portal](https://portal.slateci.io). To set up the client, first log into the web portal, go to the 'CLI Access' section, and run the provided script (note that it's specific to your account). You can then download and unpack the version of the client executable suitable for your system—Linux and Mac OS are supported. If when running the client you receive an error similar to `slate: Exception: Credentials file /Users/cnw4/.slate/token does not exist`, you either still need to run the token installation script from the portal, or something has gone wrong with that script.

## Basic Use

For help using the client, run it with the --help option:

	$ slate --help
	SLATE command line interface
	Usage: ./slate [OPTIONS] SUBCOMMAND
	
	Options:
	  -h,--help                   Print this help message and exit
	  --no-format                 Do not use ANSI formatting escape sequences in output
	  --width UINT                The maximum width to use when printing tabular output
	  --api-endpoint URL (Env:SLATE_API_ENDPOINT)
	                              The endpoint at which to contact the SLATE API server
	  --api-endpoint-file PATH (Env:SLATE_API_ENDPOINT_PATH)
	                              The path to a file containing the endpoint at which to contact the SLATE API server. The contents of this file are overridden by --api-endpoint if that option is specified. Ignored if the specified file does not exist.
	  --credential-file PATH (Env:SLATE_CRED_PATH)
	                              The path to a file containing the credentials to be presented to the SLATE API server
	  --output TEXT               The format in which to print output (can be specified as no-headers, json, jsonpointer, jsonpointer-file, custom-columns, or custom-columns-file)
	
	Subcommands:
	  version                     Print version information
	  completion                  Print a shell completion script
	  group                       Manage SLATE groups
	  cluster                     Manage SLATE clusters
	  app                         View and install SLATE applications
	  instance                    Manage SLATE application instances
	  secret                      Manage SLATE secrets

The `--help` option can also be used with any of the client's subcommands to learn about  particular options and arguments. A complete manual of all supported commands is maintained along with source code at [https://github.com/slateci/slate-client-server/blob/master/resources/docs/client_manual.md](https://github.com/slateci/slate-client-server/blob/master/resources/docs/client_manual.md). 

The client's simplest use is to list existing objects on the SLATE platform. For example, you can list the edge clusters currently participating in the platform:

	$ ./slate cluster list
	Name               Admin     ID             
	umich-prod         slate-dev cluster_WRb0f8mH9ak
	uchicago-prod      slate-dev cluster_yZroQR5mfBk
	uutah-prod         slate-dev cluster_eoqYk8lFmtk
	
In this (abbreviated) output, three edge clusters are listed. Each cluster has name associated with it for convenience, an automatically-generated unique identifier, and a group which administers it (here, all three clusters are administered by the SLATE team). All objects in the SLATE platform have unique IDs, and these must often be specified when using the client to indicate which objects you wish to manipulate. Groups and clusters have globally-unique names as well, though, so, when specifying a group or cluster, you can always use the name instead of the ID.

## Creating a Group

To do much on the SLATE platform you must belong to a group, since groups are the foundation of SLATE's permissions model. You can either join a group by asking a person who is already a member to add you, or you can create a new group with the command`slate group create`. Note that newly created groups don't generally have access to any resources (edge clusters), but they can add resources of their own. A user can also belong to several groups. 

If you're a system administrator at the fictional University of Southern North Dakota at Hoople, and you want to add your Kubernetes cluster to the SLATE platform, you would begin by creating a group: 

	$ slate group create usnd-hoople --field "Resource Provider"
	Successfully created group usnd-hoople with ID group_NUKQUeNjMMo

When creating a group it is required that you specify the science field in which it works, or 'Resource Provider' if your group existing mainly to provide computing resources to the platform. For a full list of fields of science currently allowed by SLATE, see [this page](http://slateci.io/docs/science-fields.html). 

As the creator of the group, you are automatically a member. You can then use the web portal add other users. 

## Registering a Cluster

The `slate cluster create` command can register your Kubernetes cluster with the SLATE platform. It will ask your permission to install components which will allow the SLATE platform and its users to access your cluster with limited permissions controlled by [Kubernetes Role-Based Access Control (RBAC)](https://kubernetes.io/docs/reference/access-authn-authz/rbac/). Once the registration is completed, the SLATE platform will only be able to access Kubernetes objects within the namespace created during registration and namespaces (prefixed with `slate-`) that it creates:

	$ slate cluster create --group usnd-hoople --org "USND Hoople" hoople
	Extracting kubeconfig from /Users/admin/.kube/config...
	Checking for privilege level/deployment controller status...
	It appears that the nrp-controller is not deployed on this cluster.

	The nrp-controller is a utility which allows SLATE to operate with
	reduced privileges in your Kubernetes cluster. It grants SLATE access to a
	single initial namespace of your choosing and a mechanism to create additional
	namespaces, without granting it any access to namespaces it has not created.
	This means that you can be certain that SLATE will not interfere with other
	uses of your cluster.
	See https://gitlab.com/ucsd-prp/nrp-controller for more information on the
	controller software and 
	https://gitlab.com/ucsd-prp/nrp-controller/raw/master/deploy.yaml for the
	deployment definition used to install it.

	This component is needed for SLATE to use this cluster.
	Do you want to install it now? [y]/n: y
	Applying https://gitlab.com/ucsd-prp/nrp-controller/raw/master/deploy.yaml
	Waiting for Custom Resource Definitions to become active...
	Checking for federation ClusterRole...
	 ClusterRole is defined
	SLATE should be granted access using a ServiceAccount created with a Cluster
	object by the nrp-controller. Do you want to create such a ServiceAccount
	automatically now? [y]/n: y
	Please enter the name you would like to give the ServiceAccount and core
	SLATE namespace. The default is 'slate-system': 
	Creating Cluster 'slate-system'...
	Locating ServiceAccount credentials...
	Extracting CA data...
	Determining server address...
	Extracting ServiceAccount token...
	 Done generating config with limited privileges
	Sending config to SLATE server...
	Successfully created cluster hoople with ID cluster_G23mthSyhWm

Note: You must specify the group which will administer the cluster with `--group`, since you may belong to more than one group, and the organization which formally owns the cluster with `--org`. Your cluster is now part of the SLATE platform, but only members of your group can use it. You can verify this by listing the groups allowed access:

	$ slate cluster list-allowed hoople
	Name        ID            
	usnd-hoople group_NUKQUeNjMMo

Suppose that you also work with the Graphene Radiometry for Unified Multi-Messenger Blockchain Leveraged Exoplanet Searches (GRUMMBLES) project, which makes extensive use of distributed computing, which wants to deploy services with SLATE. We'll assume that they already have a group, of which you are also a member:

	$ slate group list
	Name        ID            
	grummbles   group_tHllvsT8fEk
	usnd-hoople group_NUKQUeNjMMo
	
You can easily grant the GRUMMBLES project access to use the new edge cluster:

	$ slate cluster allow-group hoople grummbles
	Successfully granted group grummbles access to cluster hoople
	
You can also grant universal access to all SLATE groups:

	$ slate cluster allow-group hoople '*'
	Successfully granted group * access to cluster hoople
	$ slate cluster list-allowed hoople
	Name  ID
	<all> * 

When universal access is granted, individual groups are not listed by `slate cluster list-allowed`. Granting access to groups individually or universally is mainly dependent on your institution or funding source's security and resource sharing policies.

## Deploying an Application
	
To run computing jobs efficiently on resources at the Hoople Campus, GRUMMBLES would like to deploy a caching HTTP proxy. To see if SLATE has a suitable application, they need to list the applications in the catalog (add the "--dev" flag to see applications in the development catalog). They might see something like this:

	$ slate app list
	Name               App Version Chart Version Description
	htcondor           8.6.12      0.2.0         HTCondor distributed high-throughput computing system
	osg-frontier-squid 3.5.27      1.0.0         Open Science Grid's Frontier Squid application
	stashcache         0.9         0.1.0         StashCache is an xrootd based caching service
	xcache             4.8.3       0.2.0         XCache is a xrootd based caching service for k8s

osg-frontier-squid is such a proxy. You could just install it with default settings, but you'll probably want to customize them. Start by first fetching the default configuration into a local file:

	$ slate app get-conf --dev osg-frontier-squid > grummbles-squid-hoople.yaml
	
Opening that file with your preferred editor will show something like this:

	# Instance to label use case of Frontier Squid deployment
	# Generates app name as "osg-frontier-squid-[Instance]"
	# Enables unique instances of Frontier Squid in one namespace
	Instance: global
	
	Service:
	  # Port that the service will utilize.
	  Port: 3128
	  # Controls how your service is can be accessed. Valid values are:
	  # - LoadBalancer - This ensures that your service has a unique, externally
	  #                  visible IP address
	  # - NodePort - This will give your service the IP address of the cluster node 
	  #              on which it runs. If that address is public, the service will 
	  #              be externally accessible. Using this setting allows your 
	  #              service to share an IP address with other unrelated services. 
	  # - ClusterIP - Your service will only be accessible on the cluster's internal 
	  #               kubernetes network. Use this if you only want to connect to 
	  #               your service from other services running on the same cluster. 
	  ExternalVisibility: NodePort
	
	SquidConf:
	  # The amount of memory (in MB) that Frontier Squid may use on the machine.
	  # Per Frontier Squid, do not consume more than 1/8 of system memory with Frontier Squid
	  CacheMem: 128
	  # The amount of disk space (in MB) that Frontier Squid may use on the machine.
	  # The default is 10000 MB (10 GB), but more is advisable if the system supports it.
	  CacheSize: 10000
	  # The range of incoming IP addresses that will be allowed to use the proxy.
	  # Multiple ranges can be provided, each seperated by a space.
	  # Example: 192.168.1.1/32 192.168.2.1/32
	  # Use 0.0.0.0/0 for open access.
	  IPRange: 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16
	
Next, edit the file to set properties like cache sizes and allowed ranges of IP addresses you'll allow to use the proxy. Save your changes to the file, and you're ready to deploy the application:

	$ slate app install --dev osg-frontier-squid --group grummbles --cluster hoople --conf grummbles-squid-hoople.yaml
	Successfully installed application osg-frontier-squid as instance grummbles-osg-frontier-squid-global with ID instance_wVsnbXs5cUw
	
This shows your application instance has been launched on the Kubernetes cluster. You can double check by listing running instances:

	$ slate instance list --group grummbles --cluster hoople
	Name                        ID                  
	osg-frontier-squid-global   instance_wVsnbXs5cUw

It's good form to limit instance listings by cluster and group any time you don’t need a broader view, to reduce the load on SLATE infrastructure and the amount of information printed to your terminal.

The service is running, but you still have no way to use it. SLATE has more detailed information to solve this. Note that since you can deploy application instances with the same names on different clusters, to uniquely identify an instance you must specify its full ID:

	$ slate instance info instance_wVsnbXs5cUw
	Name                      Started      Group     Cluster ID
	osg-frontier-squid-global 2018-Oct-17  grummbles hoople  instance_wVsnbXs5cUw
	                          13:17:47 UTC                          

	Services:
	Name                      Cluster IP     External IP   Ports         
	osg-frontier-squid-global 10.104.122.170 198.51.100.62 3128:30402/TCP
	
	Pods:
	  osg-frontier-squid-global-67dc65fcdc-chb9t
	    Status: Running
	    Created: 2019-01-14T19:36:02Z
	    Host: sl-usndh-es1.slateci.io
	    Host IP: 192.41.231.235
	    Conditions: Initialized at 2018-10-17T13:18:25Z
	                Ready at 2018-10-17T13:20:02Z
	                ContainersReady at 2018-10-17T13:20:02Z
	                PodScheduled at 2018-10-17T13:18:21Z
        Containers:
	      fluent-bit
	        State: running since 2018-10-17T13:19:57Z
	        Ready: true
	        Restarts: 0
	        Image: fluent/fluent-bit:0.13.4
	      osg-frontier-squid
	        State: running since 2018-10-17T13:19:57Z
	        Ready: true
	        Restarts: 0
	        Image: slateci/osg-frontier-squid:0.1
	
	Configuration:
	Instance: global
	Service:
	  Port: 3128
	  ExternalVisibility: NodePort
	SquidConf:
	  CacheMem: 128
	  CacheSize: 10000
	  IPRange: 192.168.1.1/32

The 'Services' section of the listing shows that your proxy is running, and should be reachable at 96.14.44.108:3128. Only members of the group which deployed an instance (and SLATE platform administrators) can query its information this way, so your services are nominally private (although this should not be relied upon for any serious security). 

## Application Lifecycle

If you want to stop an application instance, to redeploy it with a new configuration or because you don’t need it anymore, deleting is also simple:

	$ slate instance delete instance_wVsnbXs5cUw
	Successfully deleted instance instance_wVsnbXs5cUw

While an application instance is running, you can check on what it is doing by viewing its logs:

	$ slate instance logs instance_wVsnbXs5cUw
	========================================
	Pod: osg-frontier-squid-global-67dc65fcdc-chb9t Container: osg-frontier-squid
	2018/11/09 18:30:03| HTCP Disabled.
	2018/11/09 18:30:03| Squid plugin modules loaded: 0
	2018/11/09 18:30:03| Adaptation support is off.
	2018/11/09 18:30:03| Accepting HTTP Socket connections at local=[::]:3128 remote=[::] FD 17 flags=9
	2018/11/09 18:30:03| Done scanning /var/cache/squid dir (0 entries)
	2018/11/09 18:30:03| Finished rebuilding storage from disk.
	2018/11/09 18:30:03|         0 Entries scanned
	2018/11/09 18:30:03|         0 Invalid entries.
	2018/11/09 18:30:03|         0 With invalid flags.
	2018/11/09 18:30:03|         0 Objects loaded.
	2018/11/09 18:30:03|         0 Objects expired.
	2018/11/09 18:30:03|         0 Objects cancelled.
	2018/11/09 18:30:03|         0 Duplicate URLs purged.
	2018/11/09 18:30:03|         0 Swapfile clashes avoided.
	2018/11/09 18:30:03|   Took 0.05 seconds (  0.00 objects/sec).
	2018/11/09 18:30:03| Beginning Validation Procedure
	2018/11/09 18:30:03|   Completed Validation Procedure
	2018/11/09 18:30:03|   Validated 0 Entries
	2018/11/09 18:30:03|   store_swap_size = 0.00 KB
	2018/11/09 18:30:04| storeLateRelease: released 0 objects

By default, the logs for all containers (in all pods) which make up the instance are shown, but the logs from any single container can be displayed using the `--container` option. 
