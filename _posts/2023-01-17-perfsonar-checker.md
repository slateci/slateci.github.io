---
title: Network Performance with PerfSONAR Checker
overview: Testing Network on a SLATE Cluster 
published: true
permalink: blog/perfsonar-checker.html
attribution: The SLATE Team 
layout: post
type: markdown

---
###### Note: This blog post was first published on Aug 24,2021 and last updated on Jan 17, 2023.

[PerfSONAR](https://docs.perfsonar.net/index.html) is a popular tool to measure network bandwidth and latency between between hosts in a network.  We've built an application that can be easily deployed on a SLATE cluster to check connectivity against production endpoints we operate on the SLATE platform.  This should be a handy tool that cluster administrators can use to check out a newly installed cluster.
<!--end_excerpt-->

In this blog post, we assume that you have a [SLATE account](https://portal.slateci.io/slate_portal) and access to a Kubernetes cluster [registered with the SLATE federation](https://portal.slateci.io/clusters).  You will also need a local copy of the [SLATE client installed](https://slateci.io/docs/tools/index.html).  See [SLATE quickstart](https://slateci.io/docs/quickstart/) or contact us if you need help getting started.


## PerfSONAR Overview

PerfSONAR is the performance Service-Oriented Network monitoring ARchitecture. It's a tool that many science networks and facilities deploy to test and monitor end-to-end network performance. 

In this new app, `perfsonar-checker`, we're just using a few test commands from the perfSONAR test toolkit. Those tests run to three different sites in the SLATE platform and do the following:

- A 30-second throughput test
- A 3-minute latency test at high frequency (100 Hz)
- A traceroute test   

## Deployment

We're going to show you here how you can deploy the `perfsonar-checker` app using the SLATE CLI. However, the app deployment can also be done through the SLATE Portal.

The SLATE CLI has many subcommands which you can list by running the command `slate -h`: 

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

### App Configuration

To deploy the `perfsonar-checker` app, start by downloading the app configuration file and saving it locally using this command:

```
slate app get-conf perfsonar-checker > app.conf
```
{:data-add-copy-button='true'}
The default configuration should look something like:

```
Instance: ''
NodeSelection:  
  Hostname: null
HTTPLogger: 
  Enabled: false
```

Edit the conf file as needed. For example, the above shows three variables that the user could configure.

- The first is a name for the application instance you're deploying. This is helpful in identifying your deployment when there are many other deployments on the same cluster.
- The second is a hostname to deploy your app instance to. If you leave this `null`, the cluster scheduler will automatically assign a host to your deployment.
- The third is an optional parameter for the HTTPLogger which you can enable so that you can access the full log of the tests and see their detailed output. 

In this post, we're updating all three configuration variables as you can see below:

```
Instance: 'demo'
NodeSelection:
  # We're using the below hostname just as an example
  Hostname: sl-es1.slateci.io
HTTPLogger: 
  Enabled: true
``` 
###### Note: If you want to deploy the instance to a specific node, you'll need to substitute `sl-es1.slateci.io` shown in the above example with the hostname of that node. That node will be the origin from which tests will run. *Additionally, the node must have no other perfSONAR instances running on it because perfSONAR uses host network mode*. Running multiple perfSONAR applications on the same node will lead to unexpected app behavior.

The configuration parameters for the destinations to which the tests will run are included in the app config file but they can be left at their default values.

Save the changes to the config file, and proceed to the next step.

### App Installation

To install your app instance, run the below command after substituting `<your-group>` with your SLATE group and `<cluster>` with a target cluster for your app instance:

```
slate app install --group <your-group> --cluster <cluster> perfsonar-checker --conf app.conf
``` 
{:data-add-copy-button='true'}

The above command would install an instance of the `perfsonar-checker` app under your group on the given target cluster using the configuration from `app.conf`. A successful run of the install command should print a message along with an `<instance-ID>` for your deployment as shown in the below example:

```
Successfully installed application perfsonar-checker as instance perfsonar-checker-demo with ID instance_r3g1AJcMqcQ
```

In the above example, the `<instance-ID>` is `instance_r3g1AJcMqcQ`.

It could take a couple of minutes for your instance to be fully up and ready to run the tests.

### Test Results
To view the summary output of the tests that have finished, run the below command with your `<instance-ID>` as an argument. 

```
slate instance logs --max-lines 0 <instance-ID>
```
{:data-add-copy-button='true'}

The tests start by checking the status of the pscheduler services in your instance, so for a normal operation you will see the below instance log message:

```
Performing basic troubleshooting of localhost.

localhost:

  Measuring MTU... 65535 (Local)
  Looking for pScheduler... OK.
  Fetching API level... 4
  Checking clock... Unsynchronized (Not considered fatal)
  Exercising API... Status... Tests... Tools... OK.
  Fetching service status... OK.
  Checking services... ticker... scheduler... runner... archiver... OK.
  Idle test.... 9 seconds.... Checking archiving... OK.

pScheduler appears to be functioning normally.

``` 
After that, the result of all other tests will follow. In our case, the tests took around 20 minutes to finish. After all tests are finished, you should see the message `All tests have finished!` in the instance log messages.

#### HTTPLogger (Optional)
If you enabled HTTPLogger like we did above, you would be able to view the full log of the tests via a web browser.

To do that, run the `slate instance info <instance-ID>` command, and look for the URL for the HTTPLogger service. Here is an example from our instance deployment:

```
$ slate instance info  instance_r3g1AJcMqcQ
Fetching instance information...
...
Name                   Started                         App Version Chart Version           Group     Cluster  ID                  
perfsonar-checker-demo 2021-Apr-06 04:15:57.945227 UTC 4.2.4       perfsonar-checker-1.0.0 slate-dev utah-dev instance_r3g1AJcMqcQ

Services:
Name                   Cluster IP    External IP   Ports          URL                
perfsonar-checker-demo 10.233.62.204 155.XX.YY.ZZ 8080:30931/TCP 155.XX.YY.ZZ:30931

Pods:
....
....

```
As you can see above, the URL is listed under the `"Services:"` section in the form of `<IP-address>:<port>`.

Next, retrieve the credentials from the instance logs. Here is an example:

```
$ slate instance logs --max-lines 0 instance_r3g1AJcMqcQ
...
Your randomly generated logger credentials are
**********************************************
logger:a62e1b92ff24eb2d
**********************************************
...
...
```
###### Note: The username will always be logger, followed by a colon, and then the randomly generated password, as shown in the above example.

Now, visit your URL `http://<ip-address>:<port>` from a web browser and use your credentials to log in and view the `checker.log` which contains the full output of the tests.

#### Instance Uninstall
To delete your deployed instance, run the below command along with your `<instance-ID>`.

```
slate instance delete <instance-ID>
```
{:data-add-copy-button='true'}


## Summary

We showed in this post how you can easily deploy `perfsonar-checker` app on a SLATE cluster and get basic network measurements on throughput, latency and hops to central SLATE infrastructure. We also showed how you can simply view the full details of the tests all with just few SLATE commands.

## Questions?

As always, we encourage you to try this out and let us if you have any feedback or suggestions that would help us improve this chart and make it more beneficial to users. For discussion, news and troubleshooting, the [SLATE Slack workspace](https://slack.slateci.io/) is the best place to reach us! 
