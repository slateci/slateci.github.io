---
title: Troubleshooting 
overview: Troubleshooting 

order: 10  

layout: docs2020
type: markdown
---

At this point, you should have a functioning and federated SLATE cluster. If you have any questions on this process, please [contact our team](/community/) for assistance. Below we have provided some solutions to problems that folks have occasionally come across.

## "slate cluster create" command hangs and times out

### Problem Description
Sometimes the `slate cluster create` command will hang for a period of time and then fail. This is usually because the underlying `kubectl` command used by the SLATE client is mis-configured. You may want to check to see if `kubectl` commands can complete normally. If you get an error the type:

Starting with Kubernetes v1.18:

```shell 
error: no configuration has been provided, try setting KUBERNETES_MASTER environment variable
```

or pre Kubernetes v1.18:
 
```shell
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

### Possible Solution

Try setting the `KUBECONFIG` environment variable to the correct location (usually `/etc/kubernetes/admin.conf` or `~/.kube/config`) 