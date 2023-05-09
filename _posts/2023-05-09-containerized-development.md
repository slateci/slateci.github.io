---
title: "Developing SLATE Using Containers"
overview: How to develop SLATE using containers
published: true
permalink: blog/2023-05-09-containerized-development.html
attribution: Suchandra Thapa, Adam Griffith
layout: post
type: markdown

---

The SLATE binaries and API server requires a fairly complex environment in order
to build successfully.  In order to provide a standardized build environment that 
could be reproduced and used in various contexts, the SLATE project generated a 
containerized environment for development and deploying binaries to production. 
We'll describe the environment and how we use it in this blog post.

<!--end_excerpt-->


## Background

The SLATE client and API server are both written as C++. Due to the various libraries
that the SLATE code base depend on, it can be difficult to set up and use.  This is 
especially the case when SLATE was based on CentOS 7 and libraries that were significantly
older.  

In order to simplify development and deployment, we created a set of containers for compiling 
the various SLATE binaries and for running them in unit tests as well as in production.  

## Container Images

The SLATE binaries were initially targeted for CentOS 7, and we started our initial steps at 
containerization with a CentOS 7 image.  However, for a variety of reasons, we decided to use 
Rocky Linux 9 as the basis for our containers as well as to update a few components to more 
recent versions.

Once we decided on a container image, we created a [Dockerfile](https://github.com/slateci/docker-images/blob/master/slate-client-server/Dockerfile)
based on Rocky Linux that included the libraries that SLATE requires to build. Initially, the most 
important of these was the [AWS C++ SDK](https://aws.amazon.com/sdk-for-cpp/), but we later added other libraries 
like the [OpenTelemetry C++ Client](https://github.com/open-telemetry/opentelemetry-cpp).

Once we had a base container, we extended this to create the container images we would need for
developing SLATE, building the static client binaries, and for running the SLATE components. 

The development containers take the base container and add packages for library headers, debuggers,
SSH (needed for [JetBrains CLion IDE](https://www.jetbrains.com/clion/) integration), profiling and, the other dev 
tooling needed to run and test SLATE components.

## Running the Development Container and CLion Integration

The development container we use is hosted on [OSG Harbor](https://hub.opensciencegrid.org) with 
[clion_remote.Dockerfile](https://github.com/slateci/slate-client-server/blob/master/resources/docker/clion_remote.Dockerfile)
as its source. When using `podman`, it can be pulled by running:
```shell
podman pull hub.opensciencegrid.org/slate/slate-server-development:1.0.0
```
Then, it can be run using:
```shell
podman run -d --cap-add sys_ptrace -p127.0.0.1:2222:22 -p127.0.0.1:18080:18080 slate-server-development
```
You can verify the container is running correctly by executing:
```shell
ssh clionremote@localhost -p 2222
```  

After verifying that the container is running, CLion can be set to use the container to compile, run, and debug the SLATE code.
Behind the scenes, CLion will use SSH to sync a copy of the SLATE source code onto the container and then run the various dev 
tools (`gcc`, `cmake`, `gdb`, etc.) as needed to carry out tasks.  

To accomplish this in CLion, go to the settings and then the **Build, Execution, Toolchain** section.  Click on the plus
sign and select **Remote Host**. Click the gear icon next to the **Credentials** field, and you'll see a screen like the following:

<img src="/img/posts/clion-ssh.png"> 

Set the SSH configuration as shown.  Click on the **Test Connection** button to verify that things are working.  After hitting **OK** 
on the SSH configuration dialog, CLion should automatically pick up the various tools in the container (`cmake`, `gmake`, `cc`, `c++`, `gdb`).

Now go to the **CMake** section and configure the settings as shown. 

<img src="/img/posts/clion-cmake.png"> 

Finally go to the **Deployment** section and create a new deployment configured as follows:

<img src="/img/posts/clion-deployment.png"> 

Close the settings window and then build the project using the remote profile that you just created.  This should sync the
project files to the container and then use CMake to build the various project files.  


## More advanced debugging

This setup allows us to compile, run. and do basic debugging of the SLATE components.  However,
we need to make a few changes in order to do things like profile execution times and memory usage. 

On the host machine that will run the container, we need to execute:
```shell
sysctl -w kernel.perf_event_paranoid=1
```
in order to allow users to get performance information about processes. Additionally, we'll need to change the `podman`
invocation to:
```shell
podman run -d --privileged \
  --cap-add sys_ptrace --cap-add SYS_ADMIN \
  -p127.0.0.1:2222:22 -p127.0.0.1:18080:18080 \
  --security-opt seccomp=perf.json
```
This will run the container with elevated privileges for you where the content of `perf.json` may be found [in our source repository](https://github.com/slateci/slate-client-server/blob/master/resources/perf.json).

Once this is done, CLion should be able to trace the SLATE components.  Additionally, we can
use [Valgrind's massif profiler](https://valgrind.org/docs/manual/ms-manual.html) to get memory usage over time.

## Summary

We've briefly outlined how and why we use development containers to develop and test SLATE components.  We've also outlined 
how we configured CLion to use these containers to improve our development process.

## Questions?

As always, we encourage you to try this out and let us know what's working, what's not, what 
can be improved, and so on. For discussion, news and troubleshooting, 
the [SLATE Slack workspace](https://slack.slateci.io/) is the best place to reach us! 

