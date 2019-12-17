---
title: "Add A Logging Sidecar To Any SLATE Or Helm application"
overview: Blog
published: true
permalink: blog/slate-faucet-dec-2019.html
attribution: The SLATE Team
layout: post
type: markdown
---

Sometimes when we run containerized applications, we want a little more than
the usual stdout/stderr log aggregation that Kubernetes or SLATE gives us by
default.  For many applications, logs may be exceptionally verbose, or split
across many files corresponding to different parts of the software,
necessitating some other mechanism by which to retrieve logs. In this post
we'll show you how to add a logging sidecar to your Helm chart, complete with
HTTP basic auth and ingress for ease of access. 
<!--end_excerpt-->

We'll be using our HTCondor application in the SLATE catalog, which has a
number of log files, one for each daemon running under the HTCondor master
process. The reason a logging sidecar is desireable here is because trying to
munge all of the logs into a single stdout stream will be very confusing, to
say the least. Instead we'll expose a webserver where the operator of the
application can go and check the log files. It's possible that the log files
will contain sensitive information, so we'll add a layer of HTTP basic auth as
well. A nice upshot to HTTP-based logging is that operators can additionally
curl individual log files to their workstation or share them with others.

In this post, we'll assume some knowledge about developing Helm applications.
If you don't already have a copy of the SLATE catalog application, you can grab
it [here](https://github.com/slateci/slate-catalog). However the technique
shown here isn't restricted to SLATE, it should apply to any Helm chart.

I like to add functionality to a Helm chart by first defining the interface
that the application deployer will see in the Values file.  In our HTCondor
chart, we'll add the following at the top-level scope:

    HTTPLogger: 
      Enabled: false

Defining the HTTPLogger in this way gives us some room to add features later,
such as an additional `Secret` field that would allow user-specified
passwords.

Now that we've defined the HTTPLogger, we can start to work in the back-end.
The logger will be running in a separate container (a "side car"), running the
NGINX web server to serve up our files. Under `spec.templates.spec.containers`,
we'll add an NGINX container if the HTTPLogger is enabled:

      {{ if .Values.HTTPLogger.Enabled }}
      - name: logging-sidecar
        image: "nginx:1.15.9"
        command: ["/bin/bash"]
        args: ["/usr/local/bin/start-nginx.sh"]
        imagePullPolicy: IfNotPresent
        ports:
        - name: logs
          containerPort: 8080
          protocol: TCP
        volumeMounts:
        - name: log-volume
          mountPath: /usr/share/nginx/html
        - name: logger-startup
          mountPath: /usr/local/bin/start-nginx.sh
      {{ end }}

This container definition additionally includes some volumeMounts, for which
we'll need to define corresponding volumes. The first, `log-volume`, will be
the directory shared among containers that will allow us to write files in the
HTCondor container, and serve it with the NGINX container. The second volume
will be our shell script that starts up NGINX. As in above, the volume
definition will need to be wrapped with the conditional for the HTTP Logger,
under `spec.templates.spec.volumes`: 

      {{ if .Values.HTTPLogger.Enabled }}
      - name: log-volume
        emptyDir: {}
      - name: logger-startup
        configMap:
          name: htcondor-{{ .Values.Instance }}-logger-startup
      {{ end }}

We will additionally need to ensure that the application container mounts the
shared `log-volume` defined above. Under `spec.templates.spec.containers`, we
will modify our application to have the additional volumeMount as well. It
should look something like the following, in addition to whatever other volumes
already exist:

      - name: htcondor-worker
        image: slateci/container-condor:latest
        volumeMounts:
        {{ if .Values.HTTPLogger.Enabled }}
        - name: log-volume
          mountPath: /var/log/condor
        {{ end }}

As the startup script refers to a configMap, we'll need to go and create that
next. In `templates/configmap.yaml`, we'll add a shell script that will replace
the default NGINX startup entrypoint. This script will check for the existence
of a `openssl(1)` hashed password and copy it in appropriately, otherwise it
will randomly generate a password. 

	apiVersion: v1
	kind: ConfigMap
	metadata:
	  name: htcondor-{{ .Values.Instance }}-logger-startup
	  labels:
	    app: htcondor
	    chart: {{ template "htcondor.chart" . }}
	    instance: {{ .Values.Instance }}
	    release: {{ .Release.Name }}
	data:
	  start-nginx.sh: |+
	    #!/bin/bash -e

	    apt-get update
	    apt-get install openssl -y

	    if [ -z $HTPASSWD ]; then
	      PASS=$(tr -dc 'a-f0-9' < /dev/urandom | head -c16)
	      echo "Your randomly generated logger credentials are"
	      echo "**********************************************"
	      echo "logger:$PASS"
	      echo "**********************************************"
	      HTPASSWD="$(openssl passwd -apr1 $(echo -n $PASS))"
	    fi

	    mkdir -p /etc/nginx/auth
	    echo "logger:$HTPASSWD" > /etc/nginx/auth/htpasswd

	    echo 'server {
	      listen       8080;
	      server_name  localhost;
	      location / {
		default_type text/plain;
		auth_basic "Restricted";
		auth_basic_user_file /etc/nginx/auth/htpasswd;  
		root   /usr/share/nginx/html;
		autoindex  on;
	      }
	      error_page   500 502 503 504  /50x.html;
	      location = /50x.html {
		root   /usr/share/nginx/html;
	      }
	    }' > /etc/nginx/conf.d/default.conf
	    exec nginx -g 'daemon off;'

	{{ end }}

After creating the htpasswd(1) file, we insert a new nginx configuration to
allow directory listing and change the default mimetype to plaintext, and adds
the htpasswd file from above. Combined with the logging directory, this should
be all that we need to start exposing our logs from a webserver. 

To wrap things up, we should add the ability to specify a password as a
Kubernetes or SLATE secret. In our configmap above, we already added the
ability to specify the HTPASSWD hashed password as an environment variable, so
we just need to pipe that into the deployment and values files. First, in our
Values file we will add
`HTTPLogger.Secret`, which will look as such:

    HTTPLogger: 
      Enabled: false
      # Secret: my-secret

We comment out the secret by default, so the user doesn't necessarily have to
create a secret to start the application - in that case they will just get a
randomly generated password. Over in `templates/deployment.yaml`, we will add a
new block for the environment variable within `spec.template.spec.containers`:

        {{ if .Values.HTTPLogger.Secret }}
        env:
          - name: HTPASSWD
            valueFrom:
              secretKeyRef:
                name: {{ .Values.HTTPLogger.Secret }}
                key: HTPASSWD
        {{ end }}

So, if the user wants to create and use their own password for the log server, they'll need to do the following:

	openssl passwd -apr1
	slate secret create --group <group name> --cluster <cluster name> --from-literal=HTPASSWD=<openssl output> logger-secret

And then set `Secret: logger-secret` in the values file.

Once the application has launched, you should be able to retrieve its IP
address, via 

	slate instance info <your instance>
	
and visit http://(ip address):8080 in your browser to get to the log files. If you've predefined
a password via SLATE secret, you can use the username `logger` with the password
that you have supplied. Otherwise you'll want to use
	
	slate instance logs --container logging-sidecar <instance id>
	
to get the randomly generated credentials. 

Hope that helps! Happy logging!
