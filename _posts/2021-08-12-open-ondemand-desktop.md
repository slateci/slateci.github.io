---
title: "Using SLATE to Implement Remote Desktop in Open OnDemand"
overview: A guide to using SLATE to run an Open OnDemand instance.
published: true
permalink: blog/slate-open-ondemand-desktop.html
attribution: The SLATE Team
layout: post
type: markdown
---


[Open OnDemand](https://openondemand.org/) is a web application enabling easy access to high-performance computing resources.
Open OnDemand, through a plugin system, provides many different ways to interact with these resources.
Most simply, OnDemand can launch a shell to remote resources in one's web browser.
Additionally, OnDemand can provide several ways of submitting batch jobs and launching interactive computing sessions.
It is also able to serve as a portal to computationally expensive software running on remote HPC nodes.
For example, users can launch remote Jupyter Notebooks or Matlab instances.

The SLATE platform provides a simple way to deploy this application with a batch
job scheduler in a containerized environment, with remote desktop and shell access to
any desired backend compute resources.

<!--end_excerpt-->


## Prerequisites

This tutorial requires that you have completed the basic deployment tutorial [here](https://slateci.io/blog/slate-open-ondemand.html),
and that you are able to create an instance of Open OnDemand using SLATE and log in using the web portal.

It is assumed that you already have access to a SLATE-registered Kubernetes
cluster, and that you have installed and configured the SLATE command
line interface.  If not, instructions can be found at 
[SLATE Quickstart](https://slateci.io/docs/quickstart/).  

The remote desktop application requires that NFS, hostbased authentication, and autofs (optional) can be implemented
on the cluster you are installing on.
More information about hostbased authentication can be found [here](https://arc.liv.ac.uk/SGE/howto/hostbased-ssh.html).
Information on NFS and autofs can be found [here](https://linux.die.net/man/5/nfs) and [here](https://linux.die.net/man/5/autofs).


## Configuration

Initially, a configuration file for the Open OnDemand application must be
obtained. The SLATE client will do this with the following command:
```bash
slate app get-conf open-ondemand > ood.yaml
```

This will save a local copy of the OnDemand configuration, formatted as a
.yaml file. We will modify this configuration accordingly, and eventually
deploy Open OnDemand with this configuration.

With your preferred text editor, open this configuration file and follow the
instructions below.


### Cluster Definitions

To set up remote desktop access, set the `enableHostAdapter` value to true,
then configure the `LinuxHost Adapter`. This is a simplified resource manager
built from various components such as TurboVNC, Singularity and tmux. By
enabling resource management, you can set up more interactive apps and 
easily manage remote sessions from the OnDemand portal. Be sure to create an 
additional definition for each cluster you'd like to connect to.

```yaml
  - cluster:
      name: "Node1"
      host: "node1.example.net"
      enableHostAdapter: true
      job:
        ssh_hosts: "node1.example.net"
        site_timeout: 14400
        singularity_bin: /bin/singularity
        singularity_bindpath: /etc,/media,/mnt,/opt,/run,/srv,/usr,/var,/home
        singularity_image: /opt/centos7.sif  # Something like centos_7.6.sif
        tmux_bin: /usr/bin/tmux
      basic_script: 
        - '#!/bin/bash'
        - 'set -x'
        - 'export XDG_RUNTIME_DIR=$(mktemp -d)'
        - '%s'
      vnc_script: 
        - '#!/bin/bash'
        - 'set -x'
        - 'export PATH="/opt/TurboVNC/bin:$PATH"'
        - 'export WEBSOCKIFY_CMD="/usr/bin/websockify"'
        - 'export XDG_RUNTIME_DIR=$(mktemp -d)'
        - '%s'
      set_host: "$(hostname)"
```

### Backend Configuration

To enable resource management, you must install components of the 
`LinuxHost Adapter` on each backend cluster. These include 
[TurboVNC 2.1+](https://www.turbovnc.org/), [Singularity](https://sylabs.io/),
[nmap-ncat](https://nmap.org/ncat), 
[Websockify 0.8.0+](https://pypi.org/project/websockify/#description),
a singularity centos7 image, and a desktop of your choice 
[mate 1+, xfce 4+, gnome 2].

```bash
singularity pull docker://centos:7
```

To establish a remote desktop connection, ports 5800(+n) 5900(+n) and 6000(+n)
need to be open for each display number n. As well as, port 22 for ssh
and ports 20000+ for websocket connections. To do this simply, add a 
global rule to iptables or a trusted firewalld zone.

```bash
sudo iptables -A INPUT -s xxx.xxx.xxx.xxx/32 -j ACCEPT
sudo firewall-cmd --zone=trusted --add-source=xxx.xxx.xxx.xxx/32
```

### Authentication

The LinuxHost Adapter requires passwordless SSH for all users which is 
most easily configured by establishing host-level trust. To enable hostbased 
authentication, first go to each backend resources and add public host keys 
from the OnDemand server to a file called `/etc/ssh/ssh_known_hosts` using 
the`ssh-keyscan` command.

```bash
ssh-keyscan [IP_ADDR] >> /etc/ssh/ssh_known_hosts
```

Add an entry to `/etc/ssh/shosts.equiv` with the IP address of the
OnDemand server. Then in the `/etc/ssh/sshd_config` file, change the
following lines from:

```bash
#HostbasedAuthentication no
#IgnoreRhosts yes
```
to
```bash
HostbasedAuthentication yes
IgnoreRhosts no
```

Next, ensure that you have the correct permissions for host keys at `/etc/ssh`

```bash
-rw-r-----.   1 root ssh_keys      227 Jan 1 2000      ssh_host_ecdsa_key
-rw-r--r--.   1 root root          162 Jan 1 2000      ssh_host_ecdsa_key.pub
-rw-r-----.   1 root ssh_keys      387 Jan 1 2000      ssh_host_ed25519_key
-rw-r--r--.   1 root root           82 Jan 1 2000      ssh_host_ed25519_key.pub
-rw-r-----.   1 root ssh_keys     1675 Jan 1 2000      ssh_host_rsa_key
-rw-r--r--.   1 root root          382 Jan 1 2000      ssh_host_rsa_key.pub
```

And for ssh-keysign at `/usr/libexec/openssh` &nbsp;&nbsp;&nbsp; 
Note: location varies with distro

```bash
---x--s--x.  1 root ssh_keys      5760 Jan 1 2000      ssh-keysign
```

### Secret Generation

Since pods are ephemeral, keys from the host system should be passed 
into the container using a secret. This will ensure that trust is not broken
when pods are replaced. This script generates a secret containing host 
keys on the OnDemand server.

```bash
#!/bin/bash
echo -n "Please enter a name for your secret: "
read secretName
if [ "$secretName" != "" ]; then
  :
else
  echo "Please enter a non-empty secret name"
  exit
fi
command="kubectl create secret generic $secretName"
for i in /etc/ssh/ssh_host_*; do
  command=`echo "$command --from-file=$i"`
done
printf "$command\n"
$command ; echo ""
```

To secure your secrets when not in use or in the event of a system intrusion, 
you can also install a secret management provider such as 
[Vault](https://www.vaultproject.io/docs/platform/k8s/helm) or 
[CyberArk](https://docs.cyberark.com/Product-Doc/OnlineHelp/AAM-DAP/11.2/en/Content/Integrations/Kubernetes_deployApplicationsConjur-k8s-Secrets.htm).

### Filesystem Distribution

Resource management for Open OnDemand also requires a distributed filesystem.

To configure NFS set the `NFS` value to true and specify a mount point.
Then make sure `nfs-utils` is installed and the `/etc/exports` file has an
entry for localhost, and any backend clusters.

```bash
/uufs/chpc.utah.edu/common/home  127.0.0.1(rw,sync,no_subtree_check,root_squash)
/uufs/chpc.utah.edu/common/home  192.168.1.1(rw,sync,no_subtree_check,root_squash)
...
```

To configure autofs simply set the `autofs` value to true and then add any
shares you would like in the `nfs_shares` field. Make sure that the backend
clusters use the same shares and they are mounted using the same absolute path.

### NodeSelector

Finally, the chart must be installed on a properly configured node. On a multi-node
cluster it is necessary to set a `nodeSelectorLabel` called 'application' on a desired 
node. Then match that label in the `values.yaml` file. If all nodes are properly configured
then you may leave this field blank.

```bash
kubectl label nodes <node-name> application=ood
```

## Installation

To install the application using slate, run this app install command:

```bash
slate app install open-ondemand --group <group_name> --cluster <cluster_name> --conf /path/to/ood.yaml
```

## Testing

After a short while, your SLATE OnDemand application should be live at
`<slate_instance_tag>.ondemand.<slate_cluster_name>.slateci.net`.
Note that `<slate_instance_tag>` is the `instance` parameter specified in the `values.yaml` file,
not the randomly-assigned SLATE instance ID.

Navigate to this URL with any web browser, and you will be directed to a
Keycloak login page. A successful login will then direct you to the Open OnDemand portal home page.
Navigating to the shell access menu within the portal should allow you to launch in-browser shells to the previously specified backend compute resources.

**Test User Setup**

This Open OnDemand chart supports the creation of temporary test users, for
validating application functionality without the complexity of connecting to
external LDAP and Kerberos servers. To add a test user(s), navigate to the
`testUsers` section of the configuration file. Add the following yaml to this
section for each user you would like to add:
```yaml
- user:
    name: <username_here>
    tempPassword: <temporary_password_here>
```

## Configurable Parameters:

The following table lists the configurable parameters of the Open OnDemand application and their default values.

|           Parameter           |           Description           |           Default           |
|-------------------------------|---------------------------------|-----------------------------|
|`Instance`| String to differentiate SLATE experiment instances. |`global`|
|`replicaCount`| The number of replicas to create. |`1`|
|`setupKeycloak`| Runs Keycloak setup script if enabled. |`true`|
|`volume.storageClass`| The volume provisioner from which to request the Keycloak backing volume. |`local-path`|
|`volume.size`| The amount of storage to request for the volume. |`50M`|
|`setupLDAP`| Set up LDAP automatically based on following values. |`true`|
|`ldap.connectionURL`| URL to access LDAP at. |`ldap://your-ldap-here`|
|`ldap.importUsers`| Import LDAP users to Keycloak. |`true`|
|`ldap.rdnLDAPAttribute`| LDAP configuration. |`uid`|
|`ldap.uuidLDAPAttribute`| LDAP configuration. |`uidNumber`|
|`ldap.userObjectClasses`| LDAP configuration. |`inetOrgPerson, organizationalPerson`|
|`ldap.ldapSearchBase`| LDAP configuration. |`dc=chpc,dc=utah,dc=edu`|
|`ldap.usersDN`| LDAP configuration. |`ou=People,dc=chpc,dc=utah,dc=edu`|
|`kerberos.realm`| Kerberos realm to connect to. |`AD.UTAH.EDU`|
|`kerberos.serverPrincipal`| Kerberos server principal. |`HTTP/utah-dev.chpc.utah.edu@AD.UTAH.EDU`|
|`kerberos.keyTab`| Kerberos configuration. |`/etc/krb5.keytab`|
|`kerberos.kerberosPasswordAuth`| Use Kerberos for password authentication. |`true`|
|`kerberos.debug`| Writes additional debug logs if enabled. |`true`|
|`clusters.cluster.name`| Name of cluster to appear in the portal. |`Node1`|
|`clusters.cluster.host`| Hostname of cluster to connect to. |`node1.example.net`|
|`enableHostAdapter` | Configure remote desktop functionality. |`true`|
|`ssh_hosts` | Full hostname of the login node. |`kingspeak.chpc.utah.edu`|
|`singularity_bin` | Location of singularity binary. |`/bin/singularity`|
|`singularity_bindpath` | Directories accessible during VNC sessions. |`/etc,/media,/mnt,/opt,/run,/srv,/usr,/var,/home`|
|`singularity_image` | Location of singularity image. |`/opt/centos7.sif`|
|`tmux_bin` | Location of tmux binary. |`/usr/bin/tmux`|
|`basic_script` | Basic desktop startup script. |`#!/bin/bash \ ... \ %s`|
|`vnc_script` | VNC session startup script. |`#!/bin/bash \ ... \ %s`|
|`set_host` | Hostname passed from the remote node back to OnDemand. |`$(hostname -A)`|
|`host_regex` | Regular expression to capture hostnames. |`[\w.-]+\.(peaks\|arches\|int).chpc.utah.edu`|
|`enableHostAdapter` | Enable resource management and interactive apps. |`true`|
|`desktop` | Desktop environment (mate,xfce,gnome) |`mate`|
|`node_selector_label` | Matching node label for a preferred node. |`ssd`|
|`ssh_keys_GID` | Group ID value of ssh_keys group. |`993`|
|`secret_name` | Name of secret holding host_keys. |`ssh-key-secret`|
|`host_keys` | Names of stored keys. |`ssh_host_ecdsa_key`|
|`autofs` | Mount home directories using autofs. |`true`|
|`NFS` | Mount home directories with just NFS. |`false`|
|`mountPoint` | Preferred path for mounting nfs shares. |`/ondemand/home`|
|`nfs_shares` | A mapfile with shares to be mounted by autofs. |`* -nolock,hard,...`|
|`testUsers` | Unprivileged users for testing login to OnDemand. |`test`|
