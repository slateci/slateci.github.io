---
title: "JupyterLab and HTCondor with SLATE"
overview: Blog
published: true
permalink: blog/slate-jupyter-condor-april-2020.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft

---


Jupyter is a great tool for data analysis, visualization, machine learning and much more. It allows users to run code interactively via its web notebook interface and thus iterate changes quickly.  Often users need to scale up their work and thus require submission to a backend cluster from the notebook. We show how this can be done with HTCondor using SLATE. 
<!--end_excerpt-->


First, let’s install a HTCondor pool. Later, we'll deploy a JupyterLab instance and submit jobs to this pool from the notebook.  We assume you have a SLATE account and client installed on your laptop.  (c.f. the SLATE  
[quickstart](https://slateci.io/docs/quickstart/)).


## Deploy a HTCondor Pool

We will start by setting up an HTCondor pool. First, get the configuration template of the central manager application:

	$ slate app get-conf condor-manager --dev > manager.conf

Edit the file by adding an instance name of your choice:

	Instance: 'blogpostdemo'	

Then install the central manager using the below SLATE command <small>(Please change &lt;your-group&gt; in the command to your SLATE group name, and &lt;a-cluster&gt; to the target cluster name that you want to use for your deployment)</small>:

	$ slate app install --dev condor-manager --group <your-group> --cluster <a-cluster> --conf manager.conf 
	Successfully installed application condor-manager as instance your-group-condor-manager with ID instance_1sGae98se

###### Note: If deployment fails due to an instance name that's already been chosen by another user, please choose a different instance name and try running the above command again. 

Once the application is successfully installed, SLATE will give you an instance ID, in our example *instance_1sGae98se*, which you will need in the next steps. Now we need to learn the address, and tokens for the deployed application instance. Inspect the instance's info:

	$ slate instance info instance_1sGae98se
	Name                        Started                         Group         Cluster     ID                  
	condor-manager-blogpostdemo 2020-Apr-27 20:25:14.445249 UTC <your-group>  <a-cluster> instance_1sGae98se

	Services:
	Name                        Cluster IP   External IP   Ports          URL                
	condor-manager-blogpostdemo 10.96.78.245 155.12.34.140 9618:32384/TCP 155.12.34.140:32384
	...
	Pods:
		condor-manager-blogpostdemo-768c87f4d4-z66k7
    		Status: Running
    		Created: 2020-04-27T20:25:26Z
    		Host: ...
    		Host IP: ...
    		Conditions: [2020-04-27T20:25:26Z] Initialized
                [2020-04-27T20:25:26Z] PodScheduled
                [2020-04-27T20:25:28Z] Ready
                [2020-04-27T20:25:28Z] ContainersReady
    		Events: 
				Scheduled: Successfully assigned slate-group-slate-dev/condor-manager...
				...
				[2020-04-27T20:25:27Z] Created: Created container condor-manager
				[2020-04-27T20:25:27Z] Started: Started container condor-manager
    Containers:
      condor-manager
        State: running since 2020-04-27T20:25:27Z
        Ready: true
        Restarts: 0
        Image: slateci/condor-manager:latest

	Configuration:
		...

Note the external IP address and port number, in this case *155.12.34.140* and *32384*. You should confirm that the above output shows that the `condor-manager` container is running and ready before proceeding to the next steps.

Now, check the application's log to learn the tokens issued for the other condor components:

	$ slate instance logs instance_1sGae98se
	Fetching instance logs...
    ...
	========================================
	Pod: condor-manager-blogpostdemo-669f7b858-tdkbn Container: condor-manager
	2020-04-22 02:54:10,760 INFO supervisord started with pid 1
	2020-04-22 02:54:11,762 INFO spawned: 'generate_tokens' with pid 8
	2020-04-22 02:54:11,763 INFO spawned: 'htcondor' with pid 9
	2020-04-22 02:54:11,764 INFO spawned: 'crond' with pid 10
	generate_tokens: Waiting for condor collector to become available
	2020-04-22 02:54:11,769 INFO success: generate_tokens entered RUNNING state, process has stayed up for > than 0 	seconds (startsecs)
	2020-04-22 02:54:12,823 INFO success: htcondor entered RUNNING state, process has stayed up for > than 1 seconds 	(startsecs)
	2020-04-22 02:54:12,823 INFO success: crond entered RUNNING state, process has stayed up for > than 1 seconds 	(startsecs)
	**** Condor Submit Token ****
	eyJhbGciOiJIUzI1NiIsImtpZCI6IlBPT0wifQ.eyJpYXQiOjE1ODc1MjQwNTQsImlzcyI6ImNvbmRvci1tYW5hZ2VyLWJsb2dwb3N0ZGVtby02NjlmN2I4NTgtdGRrYm4iLCJzdWIiOiJzdWJtaXRAcG9vbCJ9.I5qvyMdtRvFunqNvX5-foq2Pq7xp1zsJJAuEtgrMN0w
	**** Condor Worker Token ****
	eyJhbGciOiJIUzI1NiIsImtpZCI6IlBPT0wifQ.eyJpYXQiOjE1ODc1MjQwNTQsImlzcyI6ImNvbmRvci1tYW5hZ2VyLWJsb2dwb3N0ZGVtby02NjlmN2I4NTgtdGRrYm4iLCJzdWIiOiJ3b3JrZXJAcG9vbCJ9.jzWdHy3NRwfedViPSCUR1jfwkucFzanwL9IiX2ypPL8

Copy the one-line token after **** Condor Submit Token ****, paste it into a file called &lt;submit-token&gt; and add one trailing new line character (\n) to it. Now we need to repeat the same process for the other token. Copy the one-line token after **** Condor Worker Token ****, paste it into a file called &lt;worker-token&gt; and add one trailing new line character (\n) to it.

Then, create new SLATE secrets using the two files from above:
	
	$ slate secret create submit-auth-token --group <your-group> --cluster <a-cluster> --from-file condor_token=submit-token
	Successfully created secret submit-auth-token with ID secret_dHiGnjAgR2A
	$ slate secret create worker-auth-token --group <your-group> --cluster <a-cluster> --from-file condor_token=worker-token
	Successfully created secret worker-auth-token with ID secret_Hhjy43uyNsP

You're now ready to set up a worker node. Download the base configurations for the condor-worker application:

	$ slate app get-conf condor-worker > worker.conf
	

Edit the application's configuration to use a name of your choice as the **Instance**, the manager's external IP address as the **CollectorHost**, the manager's external port as the **CollectorPort**, and the worker secret, in our example "worker-auth-token", as the **AuthTokenSecret**. In our example here, the configuration will be:

	Instance: 'blogpostdemo'
	CondorConfig:
		Instances: 1
		CollectorHost: 155.12.34.140
		CollectorPort: 32384
		AuthTokenSecret: worker-auth-token

You can also customize the number of instances, the number of CPU cores requested for each instance, RAM requested for each instance, etc. Once you're done customizing the worker application, you can install it:

	$ slate app install condor-worker --group <some group> --cluster <a cluster> --conf worker.conf
	Successfully installed application condor-worker as instance some-group-condor-worker with ID instance_nsWh3hNs2Gb

## Deploy JupyterLab
Download the base configurations:

	$ slate app get-conf --dev jupyter-notebook > jupyter.conf

Generate a random token:

	$ openssl rand -base64 32
	mO6KJvhomZ733r/UUW6i1VXuuWgXV/gVN3VrXOgNwEg=

Edit the Jupyter application configuration file, in this case `jupyter.conf`, so that it has an **Instance** name and **NB_USER** of your choice, and a **Token** set to the token you just generated in the previous step. In our example, those values are:

	Instance: 'blogpostjupyter' 	
	Jupyter:
	  NB_USER: 'slate'
	  Token: 'mO6KJvhomZ733r/UUW6i1VXuuWgXV/gVN3VrXOgNwEg='

Choose a subdomain for the ingress (This will be used in the application's URL):

		Ingress:
			Subdomain: 'blogpostnotebook'

Update the **CondorConfig** to be enabled, and use the the manager's external IP address as the **CollectorHost**, the manager's external port as the **CollectorPort** and the submit secret, in our example "submit-auth-token", as the **AuthTokenSecret**. In our example, the configuration will be:

	CondorConfig:
      Enabled: true
      CollectorHost: 155.12.34.140
      CollectorPort: 32384
      AuthTokenSecret: submit-auth-token
      
The last change is for the SSH service. Enable the service and add the SSH public key you want to use to SSH into the JupyterLab instance:

	SSH:  
	  Enabled: true
	  SSH_Public_Key: 'ssh-rsa AAAAB3NzaC1yc2......i0pRTQgD5h1l+UvL/udO+IUYvvi slate'

You're now ready to install the JupyterLab application on SLATE:

	$ slate app install jupyter-notebook --dev --group <your-group> --cluster <a-cluster> --conf jupyter.conf

###### Note: If deployment fails due to an instance name that's already been chosen by another user, please choose a different instance name and try running the above command again. 	

Inspect the instance's info to see the allocated URL and address for SSH service:

	$ slate instance info <instance-ID>
	Services:
	Name                        Cluster IP    External IP   Ports          URL                                     
	your-group-jupyter-notebook 10.96.150.245 <IP-address>  8888:30712/TCP http://blogpostnotebook.slate-dev.slateci.net/
	your-group-jupyter-notebook 10.96.150.245 <IP-address>  22:30033/TCP   <ip-address>:<port-number>

In the above example, the JupyterLab application can be accessed at this address *blogpostnotebook.slate-dev.slateci.net* using the token you generated above. The second line has the SSH access info under URL, so you can use it with the ssh command like this:

	ssh -p <port-number> <username>@<ip-address>

where &lt;username&gt; is what you chose above for the NB_USER configuration variable. 

## Testing	
To test your deployed applications, log into your JupyterLab application\instance and submit a test job to the HTCondor pool from the terminal. First, create a file 'job.sub':

	nano job.sub

Copy the below job into it and save the changes:

	Executable   = /bin/echo
	Arguments    = Hello World
	Universe     = vanilla
	Log          = job.log
	Output       = job.out
	Error        = job.err
	Queue

Then, submit the job: 

	$ condor_submit job.sub
	Submitting job(s).
	1 job(s) submitted to cluster 1.

A successful run will create in your local directory the file *job.out* with the "Hello World" message in it.

You can also use HTCondor Python Bindings instead of `condor_submit` to communicate with an HTCondor cluster. To do that, let's use a simple job example from the [HTCondor Python Bindings Tutorial](https://htcondor.readthedocs.io/en/v8_9_5/apis/python-bindings/index.html "HTCondor Python Bindings") for our testing purpose.

Open a new Python notebook, and import the below two modules:
	
	import htcondor
	import classad
	
Create a `Submit` object for your job:

	hostname_job = htcondor.Submit({
    "executable": "/bin/hostname",  # The program to run on the execute node
    "output": "hostname.out",       # Anything the job prints to standard output will end up in this file
    "error": "hostname.err",        # Anything the job prints to standard error will end up in this file
    "log": "hostname.log",          # This file will contain a record of what happened to the job
    "request_cpus": "1",            # How many CPU cores we want
    "request_memory": "128MB",      # How much memory we want
    "request_disk": "128MB",        # How much disk space we want
	})

	print(hostname_job)
	
Then, create a transaction and add your job to the transaction's queue:

	schedd = htcondor.Schedd()          # get the Python representation of the scheduler
	with schedd.transaction() as txn:   # open a transaction, represented by `txn`
		cluster_id = hostname_job.queue(txn)     # queues one job in the current transaction; 	returns job's ClusterID
		
	print(cluster_id)	

Once the job is run successfully, you should find the file `hostname.out` in your local work directory containing the worker node's hostname.
 
## Uninstall 

If you need to uninstall an application you previously deployed on SLATE, run this command:

	$ slate instance delete <instance-ID>

## Summary

In summary, we were able to successfully deploy a JupyterLab application on SLATE and use the application as a submit environment to an HTCondor pool. The JupyterLab setup can be easily configured to work with any large HTCondor pool. 
