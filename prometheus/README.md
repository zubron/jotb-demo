# Prometheus Demo

This directory contains scripts to get started with a basic Prometheus and
Alertmanager configuration.

This directory includes configuration files to configure some basic
alerting rules in Prometheus, and configure Alertmanager to sent alerts to
a Slack channel using an [incoming webhook](https://api.slack.com/incoming-webhooks).
To use this alerting feature, the webhook URL will need to be added to `alertmanager.yml`.
The alerts and their statuses can still be seen within Prometheus without enabling this,
just skip the steps to start the Alertmanager below.

If you are using Linux, you can run Prometheus and Alertmanager locally, otherwise a
[Vagrantfile](https://www.vagrantup.com/) is available.

Click on the links below to choose how you would like to run the demo:

* [Vagrant](#vagrant)
* [Linux](#linux)

## Vagrant

```
vagrant up
```

This will provision a virtual machine with [Prometheus]() and
[Alertmanager]() unpacked into the home directory.

Once the machine is provisioned, connect to it as follows:

```
vagrant ssh
```

### Prometheus
You can then start Prometheus as follows:

```
cd ~/prometheus
./prometheus --web.external-url=http://192.168.100.100:9090
```

This will start Prometheus listening on port 9090 using the configuration
provided in `prometheus.yml`.
This configures Prometheus to scrape its targets every 15s and configures
it to scrape metrics from itself.

To view the Prometheus UI, it can be accessed at http://192.168.99.100:9090.

### Alertmanager
To start Alertmanager, in another terminal connected to the machine, run the following:

```
cd ~/alertmanager
./alertmanager 
```

## Linux

```
./download.sh
```

This will download [Prometheus]() and [Alertmanager]() and unpack them into the
current directory.

### Prometheus
You can then start Prometheus as follows:

```
cd prometheus
./prometheus --web.external-url=http://localhost:9090
```

This will start Prometheus listening on port 9090 using the configuration
provided in `prometheus.yml`.
This configures Prometheus to scrape its targets every 15s and configures
it to scrape metrics from itself.

To view the Prometheus UI, it can be accessed at http://localhost:9090.

### Alertmanager
To start Alertmanager, in another terminal, run the following:

```
cd alertmanager
./alertmanager
```
