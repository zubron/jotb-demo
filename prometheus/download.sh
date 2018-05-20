#!/bin/bash

curl -L https://github.com/prometheus/prometheus/releases/download/v2.2.1/prometheus-2.2.1.linux-amd64.tar.gz -o prometheus.tar.gz
curl -L https://github.com/prometheus/alertmanager/releases/download/v0.14.0/alertmanager-0.14.0.linux-amd64.tar.gz -o alertmanager.tar.gz

mkdir alertmanager prometheus
tar xvf prometheus.tar.gz -C prometheus --strip-components=1
tar xvf alertmanager.tar.gz -C alertmanager --strip-components=1
rm *.tar.gz

rm prometheus/prometheus.yml
ln -s ../prometheus.yml prometheus/prometheus.yml
ln -s ../alert_rules.yml prometheus/alert_rules.yml
ln -s ../alertmanager.yml alertmanager/alertmanager.yml
