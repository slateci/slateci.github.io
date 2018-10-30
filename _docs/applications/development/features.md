---
title: Adding Additional Features
overview: Optional fourth step to include extra features 

order: 80

layout: docs
type: markdown
---
{% include home.html %}

A developer may want to provide additional features for their application, such as sending logs to an external endpoint.

Developers can write these features directly into an application's container, or they can create a "sidecar" container that does some of this work.

One common example of a sidecar feature may be to include a FluentBit container in your pod that sends log data to an Elastic Search database. This can be used for customizable metrics monitoring, or system debugging.

Workflow for including FluentBit sidecar container:
1. Download and customize the [Frontier Squid FluentBit ConfigMap](https://github.com/slateci/slate-catalog/blob/master/incubator/osg-frontier-squid/templates/fluentBitConfig.yaml) for your deployment.
  * Change template name to your chart in the metadata 
  * Update Input `Path` to your container's log directory  
  * Include the SLATE specific values in your values.yaml, found under "Preparing a Helm chart", and set your defaults.  
  * Create a custom parser using regular expressions to characterize your logs  
2. Copy the namespace helper function into your helpers.tpl file  
{% raw %}
```
{{- define "namespace" -}}
  {{- .Release.Namespace | trimPrefix "slate-vo-" | printf " %s" -}}
{{- end -}}
```  
{% endraw %}
3. Include the FluentBit container in your deployment, and mount a shared volume around the log files in your host container, and mount your configMap. Ex)  
{% raw %}
```
...
containers:
  - name: fluent-bit
    image: fluent/fluent-bit:0.13.4
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: {{ template "[chart].fullname" . }}-fluent-bit-config
      mountPath: /fluent-bit/etc/
    - name: varlog
      mountPath: /var/log
...
volumes:
  - name: {{ template "[chart].fullname" . }}-fluent-bit-config
    configMap:
      name: {{ template "[chart].fullname" . }}-fluent-bit-config
  - name: varlog
    emptyDir: {}
...
```  
{% endraw %}
where `varlog` is mounted to FluentBit and to your container's log directory.  
