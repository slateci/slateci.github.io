---
title: Obtain a SLATE Token 
overview: Obtain a SLATE Token 

order: 10  

layout: docs2020
type: markdown
---

{% include alert/note.html content="If you have not done so already, go to the [SLATE portal](https://portal.slateci.io/) and create an account." %}

## Groups

Every cluster must be administered by a SLATE group.
* If there is already a group which should be responsible for this cluster, and you are not a member, you should request to join it.
* You can also create a new group to administer your cluster (go to the [My Groups](https://portal.slateci.io/groups) page and click **Register New Group**).
  * When you create a group you are automatically its first member.
  * If you create a new group whose primary purpose will be to administer this cluster (and possibly others) you should select **Resource Provider** as the field of science for it.

### Administrating Clusters

A group can administer multiple clusters, so if you are already a member of a suitable group you do not need to create another.
A group can also administer both clusters and applications, which may run both on clusters which it administers and on clusters which it does not.

## Install SLATE CLI Client

Install a copy of the SLATE CLI client on the machine which you are setting up using the steps described in [SLATE Portal: CLI Access](https://portal.slateci.io/cli) and verify by listing the available clusters already participating in the federation.

```shell
slate cluster list
```

{% include doc-next-link.html content="/docs/cluster/manual/operating-system-requirements.html" %}