---
title: "SLATE for Condor-Enabled JupyterLab Application"
overview: Blog
published: true
permalink: blog/slate-jupyter-condor-april-2020.html
attribution: The SLATE Team
layout: post
type: markdown
tag: draft

---


Jupyter has been a great tool for data analysis, data visualisation, machine learning, training and much more. It allows users to run their processes interactively through a user-friendly web interface that's easily accessible, and also be able to share and reproduce their experiments for greater productivity. Many of those users usually need to access high-performance computing clusters and resources to run some CPU-intensive algorithms on some data sets that cannot be run locally due to the limited computing resources. An example for such clusters is HTCondor which is a high-throughput computing framework used for running distributed computationally-intensive tasks in parallel. In this blog post, we show how you can use SLATE platform to deploy a JupyterLab application that can communicate with an external HTCondor pool. The deployed application allows its users to import their code (e.g. from GitHub), run it on JupyterLab, and submit CPU-intensive jobs to an HTCondor pool for processing.  
<!--end_excerpt-->


First, let’s go through the installation of the HTCondor Pool. Later, we'll show how you can deploy an instance of JupyterLab on the SLATE platform and submit condor jobs directly from there. The following steps and instructions assume that you have already signed up to use SLATE and installed the SLATE client on your environment. If you don't have that ready, you can do so by following the instructions on [The SLATE Homepage] (https://portal.slateci.io/slate_console)

## Deploy HTCondor Pool


We will start by setting up an HTCondor pool. First, get the configuration template of the central manager application:

	$ slate app get-conf condor-manager --dev > manager.conf
Edit the file by adding an instance name of your choice:

	Instance: 'blogpostdemo'	

Then install the central manager:

	$ slate app install --dev condor-manager --group <your-group> --cluster <a-cluster> --conf manager.yaml 
	Successfully installed application condor-manager as instance your-group-condor-manager with ID instance_1sGae98se

###### Note: If deployment fails due to an instance name that's already been chosen by another user, please choose a different instance name and try running the above command again. 
Once the application is successfully installed, SLATE will give you an instance ID, in our example *instance_1sGae98se*, which you will need in the next steps. Now we need to learn the address, and tokens for the deployed application instance. Inspect the instance's info:

	$ slate instance info instance_1sGae98se
	Name                        Started                         Group         Cluster     ID                  
	condor-manager-blogpostdemo 2020-Apr-22 02:53:53.464299 UTC <your-group>  <a-cluster> instance_1sGae98se

	Services:
	Name                        Cluster IP   External IP   Ports          URL                
	condor-manager-blogpostdemo 10.96.78.245 155.12.34.140 9618:32384/TCP 155.12.34.140:32384
	...
Note the external IP address and port number, in this case *155.12.34.140* and *32384*.

Now, check the application's log to learn the tokens issued for the other condor components.

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

Copy the one line token after **** Condor Submit Token ****, paste it into a file called &lt;submit-token&gt; and add one trailing new line character (\n) to it. Now we need to repeat the same process for the other token. Copy the one line token after **** Condor Worker Token ****, paste it into a file called &lt;worker-token&gt; and add one trailing new line character (\n) to it.

Then, create new SLATE secrets using the two files from above:
	
	$ slate secret create submit-auth-token --group <your-group> --cluster <a-cluster> --from-file condor_token=submit-token
	Successfully created secret submit-auth-token with ID secret_dHiGnjAgR2A
	$ slate secret create worker-auth-token --group <your-group> --cluster <a-cluster> --from-file condor_token=worker-token
	Successfully created secret worker-auth-token with ID secret_Hhjy43uyNsP
The names of the two SLATE secrets being created above are *submit-auth-token* and *worker-auth-token*.

You're now ready to set up a worker component. Download the base configurations for the condor-worker application:

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

Edit the application configurations so that it has an **Instance** name and **NB_USER** of your choice, and a **Token** set to the token you just generated in the previous step. In our example, those values are:

	Instance: 'blogpostjupyter' 	
	Jupyter:
	  NB_USER: 'slate'
	  Token: 'mO6KJvhomZ733r/UUW6i1VXuuWgXV/gVN3VrXOgNwEg='
Choose a subdomain for the ingress(This will be used in the application's URL):

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

In the above example, the JupyterLab application can be accessed at *http://blogpostnotebook.slate-dev.slateci.net/* using the token you generated above. The second line has the SSH access info under URL, so you can use it with the ssh command like this:

	ssh -p <port-number> <username>@<ip-address>
where <username> is what you chose above for the NB_USER configuration variable 	
Finally, log into your JupyterLab application\instance and submit a test job to the HTCondor pool from the terminal. Create a file job.sub:

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

A successful run will generate the file job.out with the "Hello World" message in it.

## Uninstall 

If you need to uninstall an application you previously deployed on SLATE, run this command:

	$ slate instance delete <instance-ID>

## Summary

In summary, we were able to successfully deploy a JupyterLab application on SLATE and use the application as a submit enviroment to an HTCondor pool. The JupyterLab setup can be easily configured to work with any large HTCondor pool. 
