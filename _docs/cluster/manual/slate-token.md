---
title: Obtain a SLATE Token 
overview: Obtain a SLATE Token 

order: 10  

layout: docs2020
type: markdown
---

## Create an Account

If you have not done so already, go to [the SLATE portal](https://portal.slateci.io/) and create an account.

## Understanding Groups

* Every cluster must be administered by a SLATE group.
* When you create a group you are automatically its first member.
* A group can administer multiple clusters (if you are already a member of a suitable group you do not need to create another).
* A group can also administer both clusters and applications, which may run both on clusters which it administers and on clusters which it does not.

If there is already a group which should be responsible for this cluster, and you are not a member, you should request to join it. You can also create a new group to administer your cluster (navigate to [My Groups](https://portal.slateci.io/groups) and click **Register New Group**).

If you do end up creating a new group whose primary purpose will be to administer this cluster (and possibly others), you should select **Resource Provider** as the field of science for it.

## Installing the SLATE Client

Navigate to the SLATE Portal [CLI Access page](https://portal.slateci.io/cli) to download and install the client appropriate for your machine.

To check that the SLATE client is ready to use, list the various clusters that are already participating in the federation.

```shell
slate cluster list
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/operating-system-requirements.html" %}