---
tag: draft
title: Implementing Kubernetes Network Policies for SLATE applications
overview: Network Policy
published: true
permalink: blog/network-policy.html
attribution: The SLATE Team
layout: post
type: markdown
---

The SLATE team and collaborators continue to target security as a major focus.  The SLATE team is configuring all the offered  applications in the SLATE stable catalog with Kubernetes Network Policy hooks in the Helm deployment charts.  Though initially open, these hooks should allow an administrator to quickly add different ranges for restricting their applications.
<!--end_excerpt-->

## Network Policy Definition
A Kubernetes NetworkPolicy is a special object which allows an administrator to provide constraints to a service or set of services deployed in a pod. The main use case for these in SLATE is to allow the creation of a white list of CIDRs that can access or be accessed by this application. Detailed below are instructions on how to implement such a thing in your application. Full details about network policies can be found here [kubernetes documentation page](https://kubernetes.io/docs/concepts/services-networking/network-policies/).

## Building a Network Policy
To explain how to build a Network Policy for a SLATE application, we use the nginx application from the SLATE catalog as an example.  The first changes are to the NGINX Values file, where the following is added somewhere to `values.yaml`. 
```
NetworkPolicy:
  Enabled: false
  AllowedCIDRs: 
    - 0.0.0.0/0
   ```
The first setting, Enabled, defines wether or not a network policy is actually made. By default this is false and no policy is created. The second setting is the list of CIDRs whitelisted by a policy if one is actually created. The default CIDR of `0.0.0.0/0` creates a policy that allows all traffic, so as to avoid any default settings that break the application.
    
The other piece of building a Network Policy for a SLATE application is the Network Policy template. This entire template is wrapped in the following go templating if statement: `{{ if .Values.NetworkPolicy.Enabled }}` This is what makes the enabled setting work the way it does. If enabled is set to false, the rest of this template will not be built. Next comes the metadata for the policy. This will largely be based on your application metadata, but an example of the basic structure can be found below. 
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ template "nginx.fullname" . }}
  labels:
    app: {{ template "nginx.name" . }}
    chart: {{ template "nginx.chart" . }}
    release: {{ .Release.Name }}
    instance: {{ .Values.Instance | quote }}
 ```
 Once you have the metadata set up its time to write the specification of the network policy. First we need to create a PodSelecter, the section of the network policy that tells it what pods the rules defined in the policy should pertain to. 
 ```  
 podSelector:
    matchLabels:
      app: {{ template "nginx.name" . }}
      chart: {{ template "nginx.chart" . }}
      release: {{ .Release.Name }}
      instance: {{ .Values.Instance | quote }}
```
      
Above is the pod selector for the nginx network policy. It uses a set of labels defined in the nginx deployment to match this network policy to the pods created by that deployment. Finally there is the part of the network policy that defines the rules of the policy. For our applications we want to whitelist a list of CIDR's set by the user in the values file. To trigger that behavior, we do the following  
 ```
   policyTypes:
  - Ingress
  - Egress
  egress:
  - to:
    {{- range .Values.NetworkPolicy.AllowedCIDRs}}
    - ipBlock:
        cidr: {{ . }} 
    {{- end }}
  ingress:
  - from:
    {{- range .Values.NetworkPolicy.AllowedCIDRs}}
    - ipBlock:
        cidr: {{ . }}
    {{- end }}
 ```
The go templating `range` piece can be thought of as a for loop over the list created in the values file. The `{{ . }}` section is replaced by whatever the current object in the list being itterated over is, in this case the current CIDR being looked at. Therefor this part of the network policy creates an ipBlock for each cidr listed in the values file for ingress and egress, making it only possible to access this application if you are operating from an IP address in the specified CIDR.
## Using a Network Policy
To activate the network policy of a given application some alterations to that app’s configuration must be made. To do this you will need to go onto the SLATE cluster you want to install the app on and type the following 
```
slate app <app-name> get-conf > conf.yaml
```
This will give you the default configuration file for this application. Somewhere in that file you will find the following default settings       
```
NetworkPolicy:
  Enabled: false
  AllowedCIDRs: 
    - 0.0.0.0/0
```
Set the `Enabled` option to `true` to make the application make a Network policy upon deployment. Than replace the `0.0.0.0/0` CIDR with the one you want to whitelist. If you want to add more than one CIDR you can, based on the following example.
 ```
  NetworkPolicy:
  Enabled: false
  AllowedCIDRs: 
    - 10.0.0.0/8
    - 192.168.0.0/16
 ```
Finally to use this network policy instead of the default use this modify the installation command like so
```
slate app install <app name> --cluster=<cluster name> --group=<group name> --conf=conf.yaml
```
