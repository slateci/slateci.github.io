---
tag: draft
title: Implementing Kubernetes Network Policies for SLATE applications
overview: Network Policy Creation
published: true
permalink: blog/network-policy-creation.html
attribution: The SLATE Team
layout: post
type: markdown
---

The SLATE team and collaborators continue to target security as a major focus.  The SLATE team is configuring all the offered  applications in the SLATE stable catalog with Kubernetes Network Policy hooks in the Helm deployment charts.  As an application developer, being able to build this functionality into your application will make many site administrators much more comfortable with your application being used on their clusters.
<!--end_excerpt-->

## Network Policy Definition
A Kubernetes NetworkPolicy is a special object which allows an administrator to provide constraints to a service or set of services deployed in a pod. The main use case for these in SLATE is to allow the creation of a white list of CIDRs that can access or be accessed by this application. Detailed below are instructions on how to implement such a thing in your application. Full details about network policies can be found here [kubernetes documentation page](https://kubernetes.io/docs/concepts/services-networking/network-policies/).

## Building a Network Policy
To explain how to build a Network Policy for a SLATE application, we will use the nginx application from the SLATE catalog as an example.  The first changes are to the NGINX Values file, where the following is added to `values.yaml`. 
```
NetworkPolicy:
  Enabled: false
  AllowedCIDRs: 
    - 0.0.0.0/0
   ```
The first setting, Enabled, defines wether or not a network policy is created. By default this is false and no policy is created. The second setting is the list of CIDRs whitelisted by the network policy. The default CIDR of `0.0.0.0/0` creates a policy that allows all traffic.
    
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

