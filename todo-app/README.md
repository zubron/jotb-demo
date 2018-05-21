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

## S2: Adding application specific metrics

We can now use the Prometheus client library to instrument our code to collect application specific metrics.

We will add:
 * Counter to count the total number of ToDo items created
 * Counter to count the total number of errors encountered
 * Gauge to track the number of incomplete ToDo items
 * Histogram for observing the duration in milliseconds to serve HTTP requests
 * Summary to provide quantiles of the duration in milliseconds to serve HTTP requests

We create each of these metrics in the same file where we handle the [API routes](./app/api/routes.js).
When creating each metric, we provide the metric name and a help description.
The metric name is used when later querying this metric within Prometheus.
For our Histogram and Summary, we provide additional labels to create unique time series.
We add labels for the HTTP `method`, `route`, and `response` code.

When creating the Histogram, we need to provide buckets for our observations.
Since we are using our Histogram for observing the time it takes to serve HTTP requests, we need to provide buckets for expected response times.
In this case we are using `[5, 10, 25, 50, 100, 250, 500, 1000]`.
If a response takes 73ms, the counter for the `100` bucket will be incremented as the value is less than 100 but is more than 50.
If a response takes longer than 1000ms, it will be placed in a bucket provided by Prometheus called `Inf+`.
This bucket is used for all observations that are larger than the maximum bucket size.

When creating the Summary, we need to provide quantiles for the Prometheus client to calculate.
In this case we are using the following quantiles: `[0.5, 0.75, 0.9, 0.99]`.
This will enable us to see various quantiles for each of the request combinations, e.g. what is 0.99 quantile for `GET` requests?

Once each of the metrics has been defined, we need to modify our code to record observations.
The API has a number of endpoints for listing, creating, and deleting ToDo items.

When an error is encountered in any of these endpoints, we will increment the errors counter as follows:

```
total_errors.inc();
```

When a ToDo item is created, we increment the ToDo item counter and the incomplete ToDo item gauge:

```
total_todos.inc();
incomplete_todos.inc();
```

When a ToDo item is deleted, we decrement the incomplete ToDo item gauge:

```
incomplete_todos.dec();
```

To observe how long our responses take, we will use an [Express application-level middleware](https://expressjs.com/en/guide/using-middleware.html).
We will use this middleware to record the start time of the request, and when the request is finished, calculate the total time.
We will then record an observation for both the Histogram and the Summary:

```
httpRequestDurationHistogram
    .labels(req.method, route, res.statusCode)
    .observe(responseTimeInMs);

httpRequestDurationSummary
    .labels(req.method, route, res.statusCode)
    .observe(responseTimeInMs);
```

We don't need to make any further changes to our `/metrics` endpoint handler.
All the newly recorded metrics will be automatically exported by the client.

To deploy this code, [build the latest image](#building-the-images).
The Helm chart contains changes in this branch to use this latest image.
To update your `helm` deployment use the following command:

```
helm upgrade demo chart
```

You can check the status of the deployment using the [previous instructions](#deploying-the-application).

Once the new version has been deployed, you can see the new metrics that are being exported by visting:

```
$(minikube service demo-prom-demo --url)/metrics
```

The metrics will most likely be available at the end of response so you may need to scroll futher to see them.

You can also view these metrics in your Prometheus UI within a few minutes.
On the graph page, open the dropdown of metrics and look for the metric names added to the code (`todo_items_created`, etc.).

## S3: Triggering an alert

We can modify the code to produce more errors which will trigger an alert from Prometheus.
To produce more errors, this branch introduces a change which causes the API to respond
with `500` if the user attempts to create a ToDo item when there are 10 or more in the list.

The endpoint to create the ToDo has been modified to count the number of ToDos that already exist.
If there less than 10, proceed to create the new item. If there are 10 or more, respond with 500.
All other endpoints will continue to work as expected, existing items can be viewed or removed.

To deploy this code, [build the latest image](#building-the-images).
The Helm chart contains changes in this branch to use this latest image.
To update your `helm` deployment use the following command:

```
helm upgrade demo chart
```

You can check the status of the deployment using the [previous instructions](#deploying-the-application).

Once the new version has been deployed, you can interact with the API directly, by manually attempting to create
more than 10 ToDo items, or use the API client.
You can view the status of the alert in the [Prometheus UI](http://192.168.100.100:9090/alerts).
Once the error condition is true, the alert will go into `Pending` state for one minute before the Alertmanager
is notified.
Once the Alertmanager is notified, you can view the alert in the [Alertmanager UI](http://192.168.100.100:9093/#/alerts).
Alertmanager will then send the alert to the configured receiver, in this case the Slack webhook.
