The docker container for StashCache can be found 
[here](https://hub.docker.com/r/slateci/stashcache/). The container allows
running either of the two containers (StashCache and HTCondor) that are 
typically needed to run a full-fledged StashCache cache server.

The [Dockerfile](https://github.com/slateci/container-stashcache/blob/master/Dockerfile)
is fairly straightforward. The baseline image is the latest CentOS 7 image. 
To install StashCache and Condor, we add the `epel-release` and the OSG 
software image (in this case release 3.4 for EL7). Additionally we create 
the necessary directories for the certificates, StashCache cache, and
Stashcache. 

A generalized StashCache configuration and a simple script to run StashCache
and condor are provided as well. The configuration uses several environment 
variables to fill in site- and instance-specific configuration parameters:

* `STASHCACHE_SITE_NAME`: Name of the StashCache instance being deployed
* `STASHCACHE_RAMSIZE`: Maximum RAM to be used by StashCache
* `STASHCACHE_SPACE_LOW_WM`: Low watermark when to stop deleting data from cache
* `STASHCACHE_SPACE_HIGH_WM`: High watermark when to start deleting data from cache
* `STASHCACHE_BLOCKSIZE`: Increments/blocks in bytes that should be transferred
* `STASHCACHE_PREFETCH`: Maximum number of blocks to prefetch
* `STASHCACHE_MONITORING_ENDPOINT`: HTTP endpoint to send monitoring data
