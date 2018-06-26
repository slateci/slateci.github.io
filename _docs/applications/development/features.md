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
1. Download and customize the [FluentBit ConfigMap](https://github.com/fluent/fluent-bit-kubernetes-logging/blob/master/fluent-bit-config-kafka-rest.yml) for your deployment.
  * Change metadata name to `fluent-bit-{{ .Values.Instance }}-configuration`  
  * Change namespace to `{{ .Release.Namespace }}`  
  * Update Input `Path` to your container's log directory  
  * Turn `off` Service `Daemon` and `Logstash Format`  
  * Update Output `Host` and `Port` to your Elastic Search endpoint  
2. Include the FluentBit container in your deployment, and mount a shared volume around the log files in your host container, and mount your configMap. Ex)  
```
...
containers:
  - name: fluent-bit
    image: fluent/fluent-bit:0.13.4
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: fluent-bit-{{ .Values.Instance }}-config
      mountPath: /fluent-bit/etc/
    - name: varlog
      mountPath: /var/log
...
volumes:
  - name: fluent-bit-{{ .Values.Instance }}-config
    configMap:
      name: fluent-bit-{{ .Values.Instance }}-config
  - name: varlog
    emptyDir: {}
...
```  
where `varlog` is mounted to FluentBit and to your container's log directory.  

