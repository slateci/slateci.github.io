---
title: Troubleshooting 
overview: Installing Kubernetes with Ansible & Kubespray

order: 10
layout: docs2020
type: markdown

---

### Error "'dict object' has no attribute 'v...'"
This likely means you tried to pass in a Kubernetes version that Kubespray (or your current Kubespray checkout) does not yet support.
Try pulling the newest release of kubespray and try again.

### slate: Exception: Ingress controller service has not received an IP address...
If the SLATE registration playbook throws this error, it means that the ingress controller was unable to get an IP from MetalLB in time.
Log in to the cluster manually, use `sudo /usr/local/bin/kubectl get pods -n metallb-system` to get the name of the MetalLB controller pod, and then check its logs with `sudo /usr/local/bin/kubectl logs controller-... -n metallb-system`.

If the logs say something related to "Invalid CIDR", it likely means the CIDR range you passed into the [MetalLB Configuration](#kcc-configure) was invalid (e.g. forgot to append `/32` to the end of a single IP).
Try adjusting the CIDR range and rerunning the *Kubespray* playbook to see if this fixes the issue.
Else, we suggest pinging the SLATE Slack for more help.
