---
title: How to Use JupyterLab to Submit Jobs to the OSG's Central Pool
overview: How to Use JupyterLab to Submit Jobs to the OSG's Central Pool
published: true
permalink: blog/jupyterlab-and-osg-condor-pool.html
attribution: Muhammad A
layout: post
type: markdown
tag: draft
---
In this blog post, we demonstrate how you can deploy a JupyterLab from the SLATE catalog, and then use it to submit HTCondor jobs to the OSG's central pool.

In this blog post, we assume you have a SLATE account and client installed on your laptop (c.f. the [SLATE quickstart](https://slateci.io/docs/quickstart/)) and access to a SLATE registered Kubernetes cluster.

<!--end_excerpt-->

### Step 1

To be able to submit jobs to OSG, you'll need an authentication token and a project name in OSG. If you're already have that, you can proceed to Step 2. 

If you don't already have access, you can reach out to the [OSG Support Team](https://support.opensciencegrid.org/support/tickets/new) to request access to the OSG computing cluster and mention in your request that you'll be submitting jobs from the "slateci.io" domain. Once your request is processed and approved, you should have a submit authentication token and project name that you can use in the next steps.

### Step 2

The next step is to create a SLATE secret for your submit token. 

Copy the token and paste it into a file named `submit-token`.

Then create a secret using the below SLATE command and the above token file you created<small>(Please change &lt;your-group&gt; in the command to your SLATE group name, and &lt;a-cluster&gt; to the target cluster name that you want to use for your deployment)</small>:

	$ slate secret create submit-auth-token --group <your-group> --cluster <a-cluster> --from-file condor_token=submit-token
	Successfully created secret submit-auth-token with ID secret_dHiGnjAgR2A 
	

### Step 3

#### Deploy JupyterLab
Download the base configurations:

	$ slate app get-conf --dev jupyter-notebook > jupyter.conf

Generate a random token:

	$ openssl rand -base64 32
	mO6KJvhomZ733r/UUW6i1VXuuWgXV/gVN3VrXOgNwEg=

Edit the JupyterLab application configuration file, in this case `jupyter.conf`, so that it has an **Instance** name and **NB_USER** of your choice, and a **Token** set to the token you just generated in the previous step. In our example, those values are:

	Instance: 'blogpostjupyter' 	
	Jupyter:
	  NB_USER: 'slate'
	  Token: 'mO6KJvhomZ733r/UUW6i1VXuuWgXV/gVN3VrXOgNwEg='

Choose a subdomain for the ingress (This will be used in the application's URL):

		Ingress:
			Subdomain: 'blogpostnotebook'

Update the **CondorConfig** to be enabled, and use hostname `flock.opensciencegrid.org` as the **CollectorHost**, port `9618` as the **CollectorPort**, a port number between 30000-32767 as the **ExternalCondorPort** and the submit secret, in our example "submit-auth-token", as the **AuthTokenSecret**. In our example, the configuration will be:

	CondorConfig:
      Enabled: true
      CollectorHost: 155.12.34.140
      CollectorPort: 9618
      ExternalCondorPort: 32676
      AuthTokenSecret: submit-auth-token
      
The last change is for the SSH service. Enable the service and add the SSH public key you want to use to SSH into the JupyterLab instance:

	SSH:  
	  Enabled: true
	  SSH_Public_Key: 'ssh-rsa AAAAB3NzaC1yc2......i0pRTQgD5h1l+UvL/udO+IUYvvi slate'

You're now ready to install the JupyterLab application on SLATE:

	$ slate app install jupyter-notebook --dev --group <your-group> --cluster <a-cluster> --conf jupyter.conf

###### Note: If deployment fails due to an instance name that's already been chosen by another user or due to an ExternalCondorPort value that's already allocated, please choose a different value for the instance and\or port and try running the above command again. 	

Inspect the instance's info to see the allocated URL and address for SSH service:

	$ slate instance info <instance-ID>
	Services:
	Name                        Cluster IP    External IP   Ports          URL                                     
	your-group-jupyter-notebook 10.96.150.245 <IP-address>  8888:30712/TCP http://blogpostnotebook.slate-dev.slateci.net/
	your-group-jupyter-notebook 10.96.150.245 <IP-address>  22:30033/TCP   <ip-address>:<port-number>

In the above example, the JupyterLab application can be accessed at this address *blogpostnotebook.slate-dev.slateci.net* using the Jupyter token you generated above. The second line has the SSH access info under URL, so you can use it with the ssh command like this:

	ssh -p <port-number> <username>@<ip-address>

where &lt;username&gt; is what you chose above for the NB_USER configuration variable. 


### Step 4
#### Testing	
To test your deployed applications, log into your JupyterLab application\instance and submit a test job to the HTCondor pool from the terminal. 

For our testing purpose, we use a tutorial example from the [OSG Connect Quickstart](https://support.opensciencegrid.org/support/solutions/articles/5000633410-osg-connect-quickstart) with some modifications. 

First, create a test script to be executed as your job:

	nano short_transfer.sh
	
Copy the below into it and save the file:

	#!/bin/bash
	printf "Start time: "; /bin/date
	printf "Job is running on node: "; /bin/hostname
	printf "Job running as user: "; /usr/bin/id
	printf "Job is running in directory: "; /bin/pwd
	printf "The command line argument is: "; echo $1
	printf "Contents of $1 is "; cat $1
	cat $1 > output.txt
	printf "Working hard..."
	ls -l $PWD
	sleep 20
	echo "Science complete!"

The above script takes an input file as an argument so we need to create one. A quick way to do that is:

	echo "Hello World from SLATE" > input.txt

Then, create a condor submit file 'job.sub':

	nano job.sub

Copy the below job into the submit file and save the changes:

	executable = short_transfer.sh
	arguments = input.txt
	transfer_input_files = input.txt
	transfer_output_files = output.txt

	error = log/job.$(Cluster).$(Process).error
	output = log/job.$(Cluster).$(Process).output
	log = log/job.$(Cluster).$(Process).log

	request_cpus = 1
	request_memory = 1 MB
	request_disk = 1 MB
	+ProjectName = "<your-project-name>"
	# Let's queue a 1000 jobs with the above specifications
	queue 1000

Then, create a log directory:

	mkdir log 

and submit the job: 

	$ condor_submit job.sub
	Submitting job(s).
	1 job(s) submitted to cluster 1.


A successful run will create in your local directory the file *output.txt*  with the "Hello World from SLATE" message in it. Addionally, you should get the `output`, `error` and `log` files for the individual jobs submitted in the log directory.

## Uninstall 

If you need to uninstall an application you previously deployed on SLATE, run this command:

	$ slate instance delete <instance-ID>

## Summary

In summary, we were able to successfully deploy a JupyterLab instance on SLATE, and demonstrate job submission to the OSG HTCondor pool. The setup can be easily configured to work with any HTCondor pool, for example a production-scale high-throughput cluster using HTCondor or the Open Science Grid. 


## Questions?

As always, we encourage you to try this out and let us know what's working, what's not, what can be improved and so on. For discussion, news and troubleshooting, the [SLATE Slack workspace](https://slack.slateci.io/) is the best place to reach us! 
