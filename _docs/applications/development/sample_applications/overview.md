StashCache is an data federation service based on the 
[xrootd protocol](http://xrootd.org/). A StashCache instance can act as an 
"origin", "cache", and "redirector". In the SLATE context, we will only
consider "caches" at this time. They are much simpler to deploy and only
require access to resources available locally rather than from the site, e.g.
access to the local file system in case of origin servers. 

![StashCache Architecture](https://djw8605.github.io/images/posts/StashCache/StashCache-Arch-Big.png)

The deployment of additional cacheing servers is particularly important, since 
they allow for a more wide-spread use of StashCache to serve data to jobs.


