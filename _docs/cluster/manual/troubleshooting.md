---
title: Troubleshooting 
overview: Troubleshooting 

order: 10  

layout: docs2020
type: markdown
---

At this point, you should have a functioning and federated SLATE cluster. If you have any questions on this process, please [contact the SLATE team](/community/) for assistance. Below we have provided some solutions to problems that folks have occasionally come across.

## "slate cluster create" command hangs and times out

### Problem Description

Sometimes the `slate cluster create` command will hang for a period of time and then fail. This is usually because the underlying `kubectl` command used by the SLATE client is misconfigured. You may want to check to see if `kubectl` commands can complete normally.

### Example Error

```shell
error: no configuration has been provided, try setting KUBERNETES_MASTER environment variable
```

### Possible Solution

Try setting the `KUBECONFIG` environment variable to the correct location (usually one of the following):
* `/etc/kubernetes/admin.conf`
* `~/.kube/config`
