There have been a number of interesting SLATE updates this summer. Read on for a summary of changes.

# CHANGELOG
## Website
- The [slateci.io](https://slateci.io) website has been revamped. We hope you will enjoy the more streamlined experience.  We're still working hard to improve the training and content.  If you have suggestions for something we are missing, please pass them along!
- The [SLATE console](https://portal.slateci.io/) is now using AJAX configurations to load pages faster.  Several other functional and aesthetic improvements have happened too.

## Client/Server:
- The client and server now support both Helm 3 and Kubernetes v1.16
- `zsh` and `fish' shell completions have been added for the client
- The `slate instance scale` option has now been implemented. You can scale an application like so:
  - `slate instance scale <instance id> --replicas=<N>`
  - You can also scale to 0 to set the number of running instances to zero while leaving the deployment objects on the target cluster. This can be a handy way to disable an application without removing it.
- SLATE will now create an ingress controller at cluster setup time and automatically make appropriate DNS entries. 
  - Users can expect to find services available at `<serivce name>.<clustername>.slateci.net` if they use the ingress controller.
- Various caching bugs have been fixed

## Applications
- Apps have been updated for Helm 3 compatibility
- perfSONAR testpoint application has been promoted to stable. Measure all the networks!
- Faucet SDN OpenFlow controller is now available in the stable catalog
- StashCache application has been promoted to stable
- HTCondor Worker chart now supports priority classes
- The GridFTP and Globus-Connect applications can be used to transfer data into or out of Kubernetes Persistent Volume Claims 
- MinIO, HTCondor Submit Node, OSG HostedCE, Rucio, NextFlow charts are incubating in the catalog

## Sites
- Clemson University added a SLATE cluster, `clemson-dev`
- University of Washington experimenting with SLATE
- A number of Internet 2 testbed sites have been added

## Minislate/Slatelite
- CVMFS Support has been added to both environments
- Slatelite now has an option to automatically join federation
- Minislate builds will now be available on Dockerhub
- Minislate deployment time has been reduced to 5 minutes
