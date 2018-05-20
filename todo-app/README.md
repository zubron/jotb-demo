# ToDo Demo Application

This is a demo application to show how we can instrument an existing API to be
able to collect [Prometheus](https://prometheus.io) metrics from it.

## Prerequisites

This application is designed to be run in [Kubernetes](https://kubernetes.io) using
[Minikube](https://github.com/kubernetes/minikube) and [Helm](https://helm.sh).

Please refer to the installation documentation for each of these projects to install.

## Building the images

Before deploying the application, Docker images for the application must be built.

A script has been provided to build images within your Minikube cluster:

```
./build-images-in-minikube.sh
```

This will build the image with the corresponding tag for the current Git branch.

## Deploying the application

Once Helm has been installed, you can deploy the application as follows:

```
helm install -n demo chart/
```

It will take some time for the application to be ready. To check on the status, use
the following command:

```
helm status demo
```

This will show you the state of all the resources, and how to access the application.

The verify the URL, you can see the services exposed by Minikube:

```
minikube service list
```

You should see a service named `demo-prom-demo` in the list with its URL.
To print only the URL, use the following command:

```
minikube service demo-prom-demo --url
```

## S1: Exporting Prometheus metrics

To export Prometheus metrics from our API, we can use a [Prometheus client for Node.js](https://github.com/siimon/prom-client).

We add this client library as a dependency of our project (including it in [`package.json`](./app/package.json)).
To use the library, we instantiate an instance of it in the code for handling the [API routes](./app/api/routes.js), and use the client to collect default metrics about the Node.js process.
We then add an additional endpoint to our API (`/metrics`) which, when requested, sends all the metrics our Prometheus client has gathered.

To deploy this code, [build the latest image](#building-the-images).
The Helm chart contains changes in this branch to use this latest image.
To update your `helm` deployment use the following command:

```
helm upgrade demo chart
```

You can check the status of the deployment using the [previous instructions](#deploying-the-application).

Once the new version has been deployed, you can see the metrics that are being exported by visting:

```
$(minikube service demo-prom-demo --url)/metrics
```
