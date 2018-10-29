---
title: SLATE Client
overview: Notes on SLATE client

order: 100

layout: docs
type: markdown
---
{% include home.html %}

The SLATE Client is a command line interface (CLI) intended to give a convenient way for users of SLATE, primarily [edge administrators](http://slateci.io/docs/concepts/individual-roles/edge-administrator.html) and [application administrators](http://slateci.io/docs/concepts/individual-roles/application-administrator.html), to work with the platform. 

Copies of the client executable itself and the credentials necessary for it to carry out actions on your behalf can be obtained from the [web portal](https://www-dev.slateci.io). To set up the client first log into the web portal, then go to the 'CLI Access' section, and run the provided script (which is specific to your account). You can then download and unpack the version of the client executable suitable for your system (Linux and Mac OS are supported). If when running the client you receive an error similar to `slate: Exception: Credentials file /Users/cnw4/.slate/token does not exist` it means that you either still need to run the token installation script from the portal, or that something has gone wrong with that script. 

Help information on using the client can be obtained by running it with the `--help` option:

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
	  vo                          Manage SLATE VOs
	  cluster                     Manage SLATE clusters
	  app                         View and install SLATE applications
	  instance                    Manage SLATE application instances
	  secret                      Manage SLATE secrets

The `--help` option can also be used together with any of the client's subcommands to learn about its particular options and arguments. Additionally, a complete manual of all commands supported by the client is maintained along with its source code at [https://github.com/slateci/slate-remote-client](https://github.com/slateci/slate-remote-client). 

The simplest uses of the client are to list objects which exist on the SLATE platform. For example, you can list the edge clusters currently participating in the platform:

	$ ./slate cluster list
	Name        ID                                           Owned By 
	utah-coreos Cluster_3249cb47-7318-4fd0-a61b-0cf99c1aceb8 slate-dev
	umich       Cluster_2426348a-e6cc-4282-a142-4ab60443df42 slate-dev
	uchicago    Cluster_98b60d59-b873-4014-8f1d-f9c259c116b3 slate-dev
	
In this (abbreviated) output, three edge clusters are listed. Each cluster has name associated with it for convenience, an automatically generated unique identifier, and an owning Virtual Organization (VO) which administers it (in this case all three clusters are administered by the SLATE team). All objects in the SLATE platform have unique IDs, and these must often be specified when using the client to indicate which objects you wish to manipulate. VOs and clusters have names which are globally unique as well, though, so when specifying a VO or cluster you can always use the name instead of the ID. 

To do very much on the SLATE platform you must belong to a VO, as VOs are the foundation of SLATE's permissions model. You can either join a VO by asking a person who is already a member to add you, or you can create a new VO with the command `slate vo create`. Note that newly created VOs do not generally have access to any resources (edge clusters), but they *can* add resources of their own. 

Let's suppose for the moment that you are a system administrator at the fictional University of Southern North Dakota at Hoople, and you want to add your Kubernetes cluster to the SLATE platform. You can begin by creating a VO: 

	$ slate vo create usnd-hoople
	Successfully created VO usnd-hoople with ID VO_70dc4426-1f92-4b44-932b-7c4678c30a05

As the creator of the VO, you are automatically a member. You can add other users to the VO through the web portal. 

The `slate cluster create` command can register your Kubernetes cluster with the SLATE platform. Its behavior is currently rather simplistic: When run it will collect your current kubectl context and send it to the SLATE API server to be used when SLATE accesses your cluster. So, if you want to limit how SLATE accesses your cluster you should first create a suitable `ClusterRole`, user account, and `ClusterRoleBinding`, switch to a context corresponding to the account, and then run the registration command. Assuming that any preparation is done, you can add your cluster:

	$ slate cluster create --vo usnd-hoople hoople
	Successfully created cluster hoople with ID Cluster_44db0317-601a-4d73-9392-4bfddf5cb4a2

Note that you must specify the VO which will own the cluster because you as a user can potentially belong to more than one VO. At this point, your cluster is part of the SLATE platform, but only members of your VO can use it. You can verify this by listing the VOs allowed access:

	$ slate cluster list-allowed hoople
	Name        ID                                     
	usnd-hoople VO_70dc4426-1f92-4b44-932b-7c4678c30a05

Suppose that you also work with the Graphene Radiometry for Unified Multi-Messenger Blockchain Leveraged Exoplanet Searches (GRUMMBLES) project, which makes extensive use of distributed computing, and would like to deploy services with SLATE. We'll assume that they already have a VO, of which you are also a member:

	$ slate vo list
	Name        ID                                     
	grummbles   VO_7855a495-cefd-420d-85e3-2a883fed2e44
	usnd-hoople VO_70dc4426-1f92-4b44-932b-7c4678c30a05
	
You can easily grant the GRUMMBLES project access to use the new edge cluster:

	$ slate cluster allow-vo hoople grummbles
	Successfully granted VO grummbles access to cluster hoople
	
An alternative method, which avoids repeated work when future VOs would like to access your cluster is to grant universal access to all SLATE VOs:

	$ slate cluster allow-vo hoople '*'
	Successfully granted VO * access to cluster hoople
	$ slate cluster list-allowed hoople
	Name  ID
	<all> * 

When universal access has been granted, individual VOs will not be listed by `slate cluster list-allowed`. Whether granting access to VOs one at a time or universally is a better fit for your use is mainly dependent on your institution or funding source's security and resource sharing policies. 
	
In order to run computing jobs efficiently on resources at the Hoople Campus, GRUMMBLES would like to deploy a caching HTTP proxy. To see whether SLATE has an application which suits your needs, you can list the applications in the catalog. You might see something like the following:

	$ slate app list --dev
	Name               App Version Chart Version Description                                       
	jupyterhub         v0.8.1      v0.7-dev      Multi-user Jupyter installation                   
	osg-frontier-squid squid-3     0.2.0         Open Science Grid's Frontier Squid application
	osiris-unis        1.0         0.1.0         Unified Network Information Service (UNIS)        
	perfsonar          1.0         0.1.0         perfSONAR is a network measurement toolkit

(Currently the `--dev` flag is needed as only the incubator catalog contains applications.)

`osg-frontier-squid` is such a proxy. You could just install it with default settings, but in many case you will want to use customized settings. That can be done by first fetching the default configuration into a local file:

	$ slate app get-conf --dev osg-frontier-squid > grummbles-squid-hoople.yaml
	
Opening that file with you preferred editor, you should find that it contains something like the following:

	# Instance to label use case of Frontier Squid deployment
	# Generates app name as "osg-frontier-squid-[Instance]"
	# Enables unique instances of Frontier Squid in one namespace
	Instance: global
	
	Service:
	  # Port that the service will utilize.
	  Port: 3128
	  # Controls whether the service is accessible from outside of the cluster.
	  # Must be true/false
	  ExternallyVisible: true
	
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
	  IPRange: 0.0.0.0/0
	
At this point you should edit the file to set properties like the cache sizes and the allowed ranges of IP addresses which you will allow to use the proxy. With your changes save to the file, you are ready to deploy the application:

	$ slate app install --dev osg-frontier-squid --vo grummbles --cluster hoople --conf grummbles-squid-hoople.yaml
	Successfully installed application osg-frontier-squid as instance grummbles-osg-frontier-squid-global with ID Instance_d78f3751-4db8-410a-b97c-3d1263c0e344
	
This message indicates that your application instance has been launched on the Kubernetes cluster. You can double check by listing running instances:

	$ slate instance list --vo grummbles --cluster hoople
Name                                Started             VO        Cluster ID                                 
grummbles-osg-frontier-squid-global 2018-Aug-23         grummbles hoople  Instance_d78f3751-4db8-410a-
                                    21:45:07 UTC                          b97c-3d1263c0e344                       

It is good form to limit instance listings by cluster and VO any time you don't need a broader view, both to reduce load on the SLATE infrastructure and to reduce the amount of information printed to your terminal. 

At this point the service should be running, but you have no way to use it. SLATE can provide you with more detailed information to solve this. Note that since you can deploy application instances with the same names on different clusters, to uniquely identify an instance you must specify its full ID:

	$ slate instance info Instance_d78f3751-4db8-410a-b97c-3d1263c0e344
	Name                                Started             VO        Cluster ID                                 
	grummbles-osg-frontier-squid-global 2018-Aug-23         grummbles hoople  Instance_d78f3751-4db8-410a-b97c-  
	                                    21:45:07 UTC                          3d1263c0e344                       
	
	Services:
	Name                      Cluster IP     External IP   Ports         
	osg-frontier-squid-global 10.104.122.170 198.51.100.62 3128:30402/TCP
	
	Configuration:
	Instance: global
	Service:
	  Port: 3128
	  ExternallyVisible: true
	SquidConf:
	  CacheMem: 1024
	  CacheSize: 20000
	  IPRange: 192.168.1.1/32

The 'Services' section of the listing shows that your proxy is now running, and should (hypothetically) be reachable at 96.14.44.108:3128. Only members of the VO which deployed an instance (and SLATE platform administrators) can query its information this way, so your services are nominally private (although this should not be relied upon for any serious security). 

If you want to stop an application instance, either because you plan to redeploy it with a new configuration or because you simply don't need it anymore, deleting is also simple:

	$ slate instance delete Instance_d78f3751-4db8-410a-b97c-3d1263c0e344
	Successfully deleted instance Instance_d78f3751-4db8-410a-b97c-3d1263c0e344
