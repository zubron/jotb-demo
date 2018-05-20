# JOTB 2018 Demo

This is the demo project for the talk:
`Monitoring your applications and services with Prometheus`.

This project has three directories, each with their own README.

* `todo-app`
  This is a simple MEAN application based on [scotch-io/node-todo](https://github.com/scotch-io/node-todo).
* `prometheus`
  This directory contains scripts and configuration files to download and configure
  [Prometheus](https://prometheus.io) and Alertmanager.
* `api-client`
  This is a small Python utility to simulate requests to the ToDo API.

## How to use this repository

This repository has multiple branches to show how the `todo-app` can be modified
to export Prometheus metrics which can then be scraped by a running Prometheus instance.

To follow this demo, start at branch `s0`:

```
git checkout s0
```

and follow the instructions.
After this, move on to the next branches in turn and continue to follow the instructions for each.

### S0

This stage is to confirm that you can run the application code.

Follow the [`todo-app` README](./todo-app/README.md) to verify that the application is running correctly.
Then, follow the [`prometheus` README](./prometheus/README.md) to verify that you can run Prometheus using the
provided configuration.

Having problems? Please open an issue in this project :)
