---
title: Quickstart SLATE Cluster Operator
overview: What do you need to support a SLATE platform?

order: 60

layout: quickstart
type: markdown
---
{% include home.html %}

SLATE is intended to make it easy for site IT administrators to grant science users controlled acces to a kubernetes cluster. The cluster may be anything from a dedicated setup built according to <a href="http://slateci.io/docs/slate-hardware/">our hardware recommendations</a>, a many node cluster already used by your organization, or a small cluster running on a single node. SLATE is designed to operate in a way which can be compatible with existing site security policies and not interfere with other uses of the base kubernetes cluster by running within its own collection of namespaces with minimal privileges. Site administrators have control over which users can access a cluster federated with SLATE and what applications they can deploy there. 

To get a sense of what users would expect to do on a cluster you might federate with SLATE, you may want to try out our tutorial:

<div id="doc-call" class="container-fluid doc-call-container ">
    <div class="row doc-call-row">
        <div class="col-md-10 nofloat center-block">
            <div class="col-sm-9 text-center nofloat center-block">
                <a href="https://sandbox.slateci.io:5000"><button class="btn btn-slate">SLATE Sandbox</button></a>    
            </div>
        </div>
    </div>
</div>

If you're interested in exploring further, download SLATElite which provides a lightweight version of SLATE. SLATElite is a docker-compose standard SLATE deployment with performance tweaks for personal machines. It's lightweight nature makes it easy to install for testing or prototyping purposes.

<div id="doc-call" class="container-fluid doc-call-container ">
    <div class="row doc-call-row">
        <div class="col-md-10 nofloat center-block">
            <div class="col-sm-9 text-center nofloat center-block">
                <a href="https://github.com/slateci/slatelite"><button class="btn btn-slate">SLATElite</button></a> 
            </div>
        </div>
    </div>
</div>

For more information on using the SLATE command line client to manage a cluster you may wish to read our <a href="http://slateci.io/docs/quickstart/slate-client.html">SLATE Client Guide</a>, particularly the sections on <a href="http://slateci.io/docs/quickstart/slate-client.html#installing-the-slate-client">installation</a> and <a href="http://slateci.io/docs/quickstart/slate-client.html#registering-a-cluster">registering a cluster.</a>
