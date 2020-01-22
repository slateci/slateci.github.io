---
title: Kubernetes
overview: Navigating Kubernetes

order: 60

layout: docs2020
type: markdown
---

## Containers vs Pods vs Deployments

We have taken a look at containers, but Kubernetes uses descriptions of how containers should operate and interact with one another at a higher level.

A Pod is one level of abstraction above a container. The Pod is host to one or more containers, a private local network, and some ephemeral storage that the container maintains. These are the resources necessary to allow proper function of a set of containers and provide them the ability to communicate with one another.

The Deployment is another level of abstraction, and exists above the Pod. Deployments contain templates for Pods, and instructions for the desired state of each Pod. Under the Deployment, replicas of Pods may exist, and there are some self-healing properties. For example, if a replica set of 3 (3 copies of one Pod) is requested, and one gets destroyed, the Deployment will do its best to return to 3 copies.

In addition to maintaining the the state of one or more Pods, deployments are used to define how other resources are connected to the container, including local files, configurations, and network devices such as load balancers. For this reason, Deployments are the resource type that are most used in Kubernetes for orchestrating applications.

[This StackOverflow thread](https://stackoverflow.com/questions/41325087/in-kubernetes-what-is-the-difference-between-a-pod-and-a-deployment) has more information on the differences between containers, pods, and deployments.

## A Quick Look at Kubectl

The first tool we're going to look at within Kubernetes is the Command Line Interface (CLI) titled **kubectl** (pronounced cube-cuttle or cube-control). Kubectl lets users interact with the Kubernetes Cluster and its various components locally or remotely.

### Development Environments
In [Setting Up Your Environment]({home}/docs/apps/tutorial/setup.html), we outlined two different interfaces for developing with Kubernetes: **MiniSLATE** and **Minikube**

#### MiniSLATE
If you followed [the directions for installing MiniSLATE]({home}/docs/apps/tutorial/setup.html), the full SLATE development environment, you can run the following commands to start your MiniSLATE cluster:

```
      $ ./minislate build
      $ ./minislate start
      $ ./minislate shell slate
```

This will put you within the MiniSLATE command shell and interact with the KubeCTL instance within your dev cluster.

#### Minikube

If you decided not to use MiniSLATE, you'll need to start an instance of Minikube. If you've installed it as outlined in the [Setting up Your Environment]({home}/docs/apps/tutorial/setup.html) page, you should just be able to run `$ minikube start`. This will initialize a VM, and start Kubernetes within it that we can play with.

### Get Resources
The first, and maybe most important command is `$ kubectl get pods`. This command will fetch all resources of a certain type, and report some relevant infromation about them. In this case we've chosen pods, which will report back all pods in the current namespace, the readiness of the containers within the pod, the status of the pod as a whole, the number of times it has restarted, and the age of the pod. 
If you've just started your Cluster to try this, you'll note that no pods yet. This is because all of the default pods run in the kube-system namespace. To see all pods running in your Cluster, run `$ kubectl get pods --all-namespaces`.

Try to observe different types of resources like services, or deployments this way.

### Describe Resources
The next powerful tool we'll use is describing a resource. To describe a pod, choose one of the pods you discovered from your get call, and run `$ kubectl describe pod [pod-name] -n kube-system`. The -n defines which namespace you are looking into, and is only needed if it does not match the current namespace you're working in. Once you've described the pod, you should see all of its attributes such as labels, status, event log, and more. Scroll through and see if you can make sense of any of it, but if you can't that's entirely okay at this point. We'll get there later.

### Creation and Deletion
Creation and Deletion are the last two pieces we need to get started. To create a resource, run `$ kubectl apply -f [your yaml(s)]`. The yaml pointed at after the -f flag can be local or web hosted, and will describe to Kubernetes the state that you want the system to reach. To delete an object, you can run `$ kubectl delete [resource type] [resource name]` to delete elements one at a time, or you can mass delete using `$ kubectl delete -f [your yaml(s)]`. That can delete resources using yaml descriptors. In both of these calls, you can also point the -f at a directory of yaml files to create or destroy all of them in bulk.

[The K8s cheatsheet for KubeCTL](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) details more useful information about kubectl and resource creation/deletion.

## Deploying and Observing Applications

Now that we've gone over some kubectl basics, and what Deployments and Pods are, let's try to get something up and running within Kubernetes. Navigate to the kubernetes sub-directory that you've downloaded from github, and run `$ kubectl apply -f firstDeployment.yaml`

The deployment here is an nginx container. Nginx serves files, but right now there is nothing for it to serve. Later in this tutorial we will build upon this to make a fully functional application with a purpose. For now, observe its status with `$ kubectl get pods`. If the container isn't ready yet, try running the same command with a -w flag, which will put it in "watch" mode so you can see changes as they happen. To escape watch mode, press control-c.

If the pod titled first-deployment shows that 1/1 container is ready, it was successful. There will be a hash of random characters following the title, that is assigned by the replicaSet and managed by the deployment to ensure unique instances of the pods.

You can leave this running, we will return to the deployment later.

[The Kubernetes documentation](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application-introspection/) has more information on observing and debugging applications.

## Resource Definitions

Resources are a cornerstone idea of Kubernetes. Resources, such as pods or deployments, are pre-defined ways in which components should interact within Kubernetes. These serve as primitive types for the rest of the system, building up to something greater much like the idea of a container vs a pod vs a deployment.

There are many types of resources a user could interact with, but we will go over some of the most important in the lessons to come. The biggest takeaway from the existence of resources is that they are the basic units of orchestration, intended to be layered upon. For some companies Custom Resource Definitions (CRDs) build further on top of these to create fluid workflows that reduce "boilerplate" work. At this time, SLATE does not use any CRDs, but they are a useful concept to be aware of.

### Services

The Service resource type is among the most important within Kubernetes, as it provides networking components to containers that allow end-user interaction. There are a few different types of services that we will outline briefly.

### NodePort
The NodePort service type exposes a TCP port on the Node host that it is scheduled on, causing it to share the IP address of the Node. This is good for local testing or brief availability, but because IP addresses may change and each service uses a whole port, it isn't advised for production.

### ClusterIP

ClusterIP service types are an internal service. It creates an IP that is only accessible within the Cluster by other resources. This is very useful for local communication or internal debugging, but since it doesn't actually outwardly expose anything it's not entirely useful for making a service accessible.

### LoadBalancer
LoadBalancers are the default answer for exposing your service to the public. The LoadBalancer requests a public IP address, and assigns it exclusively to the service. Since you have an entire IP, you may expose whatever port you need to for various types of services like HTTP, gRPC, or more. This provides a lot of freedom, but is best used alongside cloud providers who have large IP pools to assign. Using this with on-premises Clusters can be very expensive, because usually there is a very limited pool of public IPv4 addresses available to the system.

### Ingress
Though not technically a service, Ingress controllers are closely related. They act as a router for your services, while only requiring one entry point. Therefore, you can put an Ingress controller behind one LoadBalancer IP address and have it redirect to many services by subdomain. For related services, this helps scale service availability without demanding a huge (and expensive) number of public IP addresses.
### Demo Service
Let's take a look at a service. The service linked below is designed to target the Nginx deployment from above. Take a look at the yaml, and compare it to the firstDeployment.yaml. What do you notice? There are some shared elements of the service and deployment to link the two, namely the labels. Matching the labels of the pods with the selector in the service is how a service knows what to target and provide connection to.
Go ahead and install this service into your cluster with `$ kubectl apply -f firstService.yaml`. Once it's created, run `$ kubectl get services` to view the state of it. While the services are visible, copy the NodePort your service is running on (after the colon on the right right). To access the service within Minislate, run `$ curl kube:[nodeport]`, and on minikube run `$ minikube ssh curl localhost:[nodeport]`. You should receive a welcome to nginx page if everything is running properly. We'll serve something more interesting later.

### Volumes
Volumes are a deeply useful tool in Kubernetes, that is, once you know how to use them properly. Because filesystems of containers are not by default accessible within other containers, they provide a new level of interaction. These volumes enable containers to mount files that are pre-existing on a host system, from the cloud, or just from other containers in the same pod. There are too many types of volumes to cover all of them, but let's go over a few and why one may use them.

### EmptyDir 
Among the most simple of volumes. EmptyDir is mounted quite literally as an empty directory within a container. The value of this type is that it can be the same empty directory shared by multiple containers, each hosting the directory in different places within their own file system. This is kind of like static linking these directories together. A common example of what one might do with this is mount the log directory of one container to another container that will ship those logs elsewhere.

### HostPath 
 HostPath volumes are both very powerful, and difficult to scale. The HostPath will mount a directory that pre-exists on the Node, or can create a directory on the Node at a defined location. These are useful for mounting certain containers to different types of storage, or to large pools of disk for things like caches, but they run the risk of being scheduled on a pod that doesn't have the directory allocated. Because of this, there is a high level of system administrator interaction that needs to happen for these types of volumes, and often is not used beyond local testing. 
### Cloud Providers 
 Nearly all the rest of the volume types are cloud provider specific, such as AWS's EBS volumes, Azure's AzureDisks, etc. These all allow dynamic provisioning of cloud provider storage when connected to an account with proper credentials, and are very useful for production scaling of storage as needed

## The Container Storage Interface 
 The defined Container Storage Interface (CSI) is a standard that is slowly overtaking the Kubernetes volumes space. It is a standard that lets an out-of-kubernetes operation happen to provision storage somewhere and mount into the pod. This is growing in popularity because it can be maintained by the storage providers outside of Kubernetes, and it also works with other platforms like Mesos or Docker Compose
### Integrating a Volume 
 Let's make some changes to the original firstDeployment.yaml file that we created. We are going to add an emptyDir volume as a placeholder for our next lesson. If this is your first time creating or editing yaml, be aware of your spacing. Yaml is a strict 2-spaces tab system. For these demos I will be sure to indicate which categories you should be editing within so that you can properly nest your changes

 In order to mount the volume in the container, we need to specify two things. One is the set of volumes we would like to include in our deployment, and of what type each is. The other is that we would like to mount one of the volumes from our volume set into our container, and there it doesn't matter what type the volume is. We will add two sections of code to accomplish this. 
```
spec:
template:
spec:
containers:
- name: nginx
+       volumeMounts:
+       - name: nginx-mounted-volume
+         mountPath: /usr/share/nginx/html
[...]
+     volumes:
+     - name: nginx-mounted-volume
+       emptyDir: {}
```

[The Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/volumes/) has more information regarding volume integration.

## ConfigMaps and Secrets
 Two special types of volumes are ConfigMaps and Secrets. These two types have some data, defined either by an imported file or by information entered into a yaml file. Once the data is present, it can be mounted into a container either as a volume, where it will exist as a file, or as an evironment variable. 

 The biggest difference in these two types is that while a ConfigMap is raw data, a secret is base64 encoded. Secrets are often used for storing sensitive data like certificates and tokens for paid services, while ConfigMaps are used primarily for mounting general use configuration files into the filesystem. 

### Creating a ConfigMap 
 Our next goal is going to be to create a ConfigMap that we will later mount into our Deployment. To get started, navigate to the demoConfigMap.yaml file and look it over. You should see that there is a section called "data". Any key-value pair within the data section can be mounted either as an environment variable or file. Many people choose to mount all key-value pairs as files titled by their key into one directory, which is the default behavior unless specified otherwise
 Go ahead and fill in the body of this HTML to make it slightly exciting, or just to carry your own message. Note that after the index.html key, there is a bar-dash pair. That pair defines that the value will be multi-line, allowing for the freedom of well structured files. Once you're ready, run `$ kubectl apply -f demoConfigMap.yaml` and check to make sure it deployed (hint, you can get this type of resource). Now that this exists, we can put it all together in the next step and see the result of all the pieces. 
[This article](https://medium.com/google-cloud/kubernetes-configmaps-and-secrets-68d061f7ab5b) has further reading on K8s config maps and secrets.

## Putting it All Together
 We have each individual piece to see the results running now. We have a Deployment creating Pods that have the Nginx container running in them. We have a Service that exposes a NodePort so that we can access the Nginx server. We have a volume mounted to the serving directory. And we have a ConfigMap with some data to serve. Let's put this together and see the HTML from the ConfigMap. To do this, we only need to make one small change to the code
 The only thing we need to change is the type of the volume in our deployment. Let's change it from an emptyDir to a configMap. ConfigMap type volumes also need to specify the name of the ConfigMap as it exists in your Cluster, so we will add that as well. The deployment should now include this block of text
```
volumes:
- name: nginx-mounted-volume
configMap:
name: demo-nginx-configmap
```
 Now that you've made the change, appy it with `$ kubectl apply -f firstDeployment.yaml`. If all has gone correctly, the container should restart with the index.html file mounted, and will be serving it. Try to recall how we accessed the NodePort service and give it a try! 

## Cleaning it Up
 Now it's time to clean everything up. With kubectl, this can be a bit of a hassle if you choose to delete by name. You have to specify each type of resource one at a time such as `$ kubectl delete deployment demo-nginx `. Instead, we'll use the advantage of having all of our files in one directory. Go ahead and run `$ kubectl delete -f . | grep "deleted"` from within the directory you downloaded the examples to. This should clean everything up behind us, and let us start fresh. Please note that this is not always safe to do, and should only be run for all files in a directory when you are very certain of what resources it is targeting. 

## Debugging Strategies
 Now we will do a small excercise in debugging. Deploy the debugging file by running `$ kubectl apply -f kubernetesDebug.yaml `. Inspect the deployment, pods, and service using get and describe, and see if you notice anything. 
 Everything should at this point look like it's working properly and there are no issues, but what happens if you try to connect to the server using the NodePort again? There's definitely something awry here. 
 Take a close look at the yaml file, and see if there are any discrepencies. If you're stuck, review the lesson on services and how they know which pods to give connections to. Once you've found the issue and made the changes, go ahead and update the resources by running `$ kubectl apply -f kubernetesDebug.yaml` again and try to connect once more
 Kubernetes is a fabulous and powerful tool for managing distributed systems, but because of the complexity it has a lot of points where things can go wrong. Often errors will be given before you can create the resource, usually using describe and looking at the events is very helpful for those that make it past creation but fall into an error state, though there are a few examples, like the one you just worked through, that will just take some kuberknowledge. When in doubt, look at events, and check the labels. 