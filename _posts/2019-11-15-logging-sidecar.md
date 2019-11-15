# Adding an HTTP-based log exporter to any SLATE or Helm application

When running a containerized application, it can be difficult or
undesireable to pipe all log output to /dev/stdout and expose it via the normal
Kubernetes or SLATE logging interface. In this post we'll show you how to add a
logging sidecar, complete with HTTP basic auth and ingress for ease of access.

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
shown here isn't restricted to SLATE, it should apply to any Helm app.

I like to add functionality to a Helm Chart by first defining the interface
that the application deployer will see in the Values file.  In our HTCondor
chart, we'll add the following at the top-level scope:

    HTTPLogger: 
      Enabled: false

Defining the HTTPLogger in this way gives us some room to add features later,
such as an additional `Password` field that would allow user-specified
passwords.

Now that we've defined the HTTPLogger, we can start to work in the back-end.
The logger will be running in a separate container (a "side car"), running the
NGINX web server to serve up our files. Under `spec.templates.spec.containers`,
we'll add an NGINX container if the HTTPLogger is enabled:

      {{ if .Values.HTTPLogger.Enabled }}
      - name: logging-sidecar
        image: "nginx:1.15.9"
        command: ["/usr/local/bin/start-nginx.sh"]
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
next. In `templates/configmap.yaml`, we'll add a shell script that will
replace the default NGINX startup entrypoint. This script will check for the
existence of an htpasswd(1)-like string and copy it in appropriately, otherwise
it will randomly generate a password. Note that for the purposes of this blog
post, we've intentionally kept things simple and have not implemented the
ability for the user to specify a password, although the script does allow it.

	{{ if .Values.HTTPLogger.Enabled }}
	---
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
          #!/bin/bash -e

          if [ -z $HTPASSWD ]; then
            PASS=$(tr -dc 'a-f0-9' < /dev/urandom | head -c16) 
            echo "Your randomly generated logger credentials are"
            echo "**********************************************"
            echo "logger:$PASS"
            echo "**********************************************"
            HTPASSWD=$(echo $PASS | md5sum | awk '{print "logger:"$1}')
          fi

          # maybe validate this
          echo $HTPASSWD > /etc/nginx/auth/htpasswd

          sed -i -e 's|\\(listen[^0-9]*\\)80|\\1 8080|' -e 's|index  index.html index.htm|autoindex  on|'  -e '/location \\/ {/ a\\        default_type         text/plain;\\\n\\        auth_basic           \"Restricted\";\\\n\\        auth_basic_user_file /etc/nginx/auth/htpasswd;' /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'
	{{ end }}

After creating the htpasswd(1) file, the script does an in-place modification
of the default NGINX configuration to allow directory listings, changes the
default mimetype to plaintext, and adds the htpasswd file from above. Combined
with the logging directory, this should be all that we need to start exposing
our logs from a webserver.
