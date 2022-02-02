---
title: Apply Kubeconfig
overview: Apply Kubeconfig

order: 10

layout: docs2020
type: markdown
---

If you want to permanently enable `kubectl` access for the `root` account, you will need to copy the Kubernetes admin configuration kubeconfig to `$HOME/.kube/config`.

```shell
mkdir -p /root/.kube && \
cp -i /etc/Kubernetes/admin.conf /root/.kube/config && \
chown root:root $HOME/.kube/config
```
{:data-add-copy-button='true'}

Alternatively to apply the kubeconfig for a single session execute the following:

```shell
export KUBECONFIG=/etc/Kubernetes/admin.conf
```
{:data-add-copy-button='true'}

{% include doc-next-link.html content="/docs/cluster/manual/slate-master-node/allow-pods-master.html" %}