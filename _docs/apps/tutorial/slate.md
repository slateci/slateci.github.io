---
title: SLATE
overview: Navigating SLATE 

order: 100

layout: docs
type: markdown
---

<html>
<head>
  <title>SLATE</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.0/dist/semantic.min.css">
</head>
<body>
          <div class="content">
              <div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Where does SLATE Fit In?</h3>
                          <p> SLATE is a tool that wraps Helm and Kubernetes to make deployment and management a little bit more streamlined, for those who are not familiar with the full scope of Kubernetes and Helm. The goal is to accellerate scientific discovery by minimizing the learning curve to access powerful services. </p>
                          <p> SLATE manages Kubernetes Clusters, Namespaces, and some other settings for the devices linked to the system to accomodate for Virtual Organizations (VOs) who have connected their hardware to our platform. Additionally, SLATE manages deployment and orchestration of applciations by calling upon specific tools of Helm to interact with Kubernetes on SLATE's behalf. </p>
                          <p> SLATE also has a catalog of vetted applciations that exist in our SLATE repository, and users can only install charts from this repository. This makes sure that applications within SLATE follow a methodology that can best advance scientific discovery, and keep the hardware components of VOs safe in the process. </p>

                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">The SLATE Portal</h3>
                          <p> The portal is the organizational tool in which users can manage their SLATE accounts, and organizations can grant or remove privileges to users. The link to this can be found under "More Resources", where you can register an account for your virtual organization to grant you access, as well as download the SLATE client and download your access token. </p>
                          <a href="https://portal.slateci.io/" class="ui gray button" role="button"> More Resources </a>
                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Deploying an App with SLATE</h3>
                          <p> Lets do a quick overview of how to deploy an app within SLATE, now that you have an access token and a better idea of what is going on under the hood. We will continue to use the Nginx example for this. </p>
                          <p> The first thing we want to do is download our customization parameters, so that we aren't just installing a default settings application. Run <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate app get-conf nginx &gt; nginxConf.yaml</text> to generate the values file to your local directory. Then open it, edit what you'd like, and let's install it with our new settings. </p>
                          <p> To install the app, run <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate app install nginx --conf nginxConf.yaml --vo [your vo] --cluster [cluster you can access]</text> to install this app onto an authorized cluster as a representative of your organization. For a list of which clusters there are, run <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate cluster list</text>, select a cluster, and run <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate cluster list-allowed-vos [cluster name]</text> to ensure that your VO has access rights. </p>

                      </div>
                      <div class="ui grey segment">
                          <h3 class="ui header">Observing and Managing Apps in SLATE</h3>
                          <p> Now that your Nginx deployment is out there, let's take a look at it and find it on the internet. To locate your instance of Nginx run <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate instance list --vo [your vo]</text> and look for the instance you deployed. There will be an instance tag associated with that, which is your key to access information about your new service. </p>
                          <p> You have the instance key, so let'srun <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate instance info [instance key]</text> to get all kinds of information regarding the resources being managed. In this case, we are concerned with the "External IP" and the second part of "Ports". If you visit <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;">[External IP]:[NodePort]</text> in a browser, you should see the data being served as you defined it.</p>
                          <p> The final step is to delete your application. Go ahead and run <text style="background-color: rgb(34, 34, 34); color: white; font-family: monospace;"> $ slate instance delete [instance key]</text> to remove your app from SLATE. </p>
                          <p> Hopefully it was fast and easy to deploy your app to SLATE, get the necessary info to access it, and clean it up. If it wasn't, let us know how we can improve that experience. From here, you can deploy apps to multiple clusters with just a few strings of text, or manage a service for multiple VOs fluidly. We hope that this makes scientific discovery more possible for those providing and those using the services needed to make it happen. </p>

                      </div>
                  </div>
              </div>
</body>
</html>
