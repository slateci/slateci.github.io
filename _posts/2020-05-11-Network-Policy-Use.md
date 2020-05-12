---
tag: draft
title: Using Kubernetes Network Policies for SLATE applications
overview: Network Policy Creation
published: true
permalink: blog/network-policy-creation.html
attribution: The SLATE Team
layout: post
type: markdown
---

A major priority of SLATE is ensuring that our clusters and applications are secure. In order to better secure the applications there is an ongoing effort to ensure that they all have built in Network Policies. This allows a user or site administrator to more strictly limit who exactly has access to a given application.
<!--end_excerpt-->

## Network Policy Definition
A Kubernetes NetworkPolicy is a special object which allows an administrator to provide constraints to a service or set of services deployed in a pod. The main use case for these in SLATE is to allow the creation of a white list of CIDRs that can access or be accessed by this application. Detailed below are instructions on how to implement such a thing in your application. Full details about network policies can be found here [kubernetes documentation page](https://kubernetes.io/docs/concepts/services-networking/network-policies/).

## Using a Network Policy
To activate the network policy of a given application some alterations to that app’s configuration must be made. To do this you will need to go onto the SLATE cluster you want to install the app on and type the following 
```
slate app <app-name> get-conf > conf.yaml
```
This will give you the application’s default configuration file where you will find the following settings:     
...

    NetworkPolicy:
      Enabled: false
      AllowedCIDRs: 
        - 0.0.0.0/0

...
Set the `Enabled` option to `true` to make the application make a Network policy upon deployment. Than replace the `0.0.0.0/0` CIDR with the one you want to whitelist. If you want to add more than one CIDR you can, based on the following example.
...

    NetworkPolicy:
      Enabled: true
      AllowedCIDRs: 
        - 10.0.0.0/8
        - 192.168.0.0/16

...
Run the application with the new conf file using the following command:
```
slate app install <app name> --cluster=<cluster name> --group=<group name> --conf=conf.yaml
```
