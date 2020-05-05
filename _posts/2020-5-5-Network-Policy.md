---
tag: draft
title: Network Policy
overview: Network Policy
published: false
permalink: blog/network-policy.html
attribution: The SLATE Team
layout: post
type: markdown
---
# Network Policy

## Network Policy Definition
A NetworkPolicy is a special object Kubernetes allows you to add to a given service that defines what its Network behavior of that pod. The main recommended use of this feature is to add a way to limit what CIDR's and therefore what sites can access this instance of a given application. Detailed below are instructions on how to implement such a thing in your application. Full details about network policies can be found in this [kubernetes documentation page](https://kubernetes.io/docs/concepts/services-networking/network-policies/).

## Building a Network Policy
To explain how to build a Network Policy the [nginx application](https://github.com/slateci/slate-catalog/tree/master/stable/nginx/nginx) will be used as an example, and its implementation will be referenced multiple times going forward. The first and easiest changes are to the Values file, which give the application user a way of deciding if they want to use this functionality and to define what CIDRs they want to allow for this application. In the nginx app this functionality is turned off by default, so the Enabled value is set to false and a dummy CIDR is fed in. The user would be expected to set Enabled to true and feed in their CIDRs if they wanted this to be turned on

The other piece of building a Network Policy for a SLATE application is the Network Policy template. An example of this can be found in the [network policy of the nginx app](https://github.com/slateci/slate-catalog/blob/network-policy-demo/stable/nginx/nginx/templates/NetworkPolicy.yaml). As you can see this contains two network policies, one for when the functionality is disabled and one for when it is not. The top half for both contains the metadata of the policy, which tells kubelet what this object is and what pods and services to associate it with. The difference lies in the bottom half. For the first policy the functionality is enabled, and so the yaml is set to only allow ingress and egress to/from the CIDRs supplied in the values file. The second policy doesn't limit access, and so for the allowed CIDRs an empty list is supplied. Kubernetes reads this empty list to mean Allow all. If you wanted to create a Deny all policy, than you would not supply a list at all.

## Using a Network Policy
To activate the network policy of a given application some alterations to that app’s configuration must be made. To do this you will need to go onto the SLATE cluster you want to install the app on and type `slate app <app-name> get-conf`. This will give you the default configuration file for this application. Open this file in a text editor and go to the section that says `NetworkPolicy: false` and change the setting so that it is set to true. Next directly below there will be a list called AllowedCIDRs populated by dummy CIDRs. Place each of the CIDRs you want this app to be accessible to here, in the exact format that the dummy CIDRs currently are, making sure the spacing and - are placed the same as the example for each of your CIDRs.  
Finally save your changes and deploy the application using your custom configuration. To do this give the install command `slate app install <application name> cluster=<cluster name> group=<group name> conf=<name of your custom config file>`. This will deploy the application in much the same way it normally would, but with the addition of a Network Policy that blocks traffic from any IP range not in the whitelisted CIDRs specified in the configuration document. It does so by simply dropping all packets from or to those disallowed IP ranges.
