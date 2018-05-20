#!/bin/bash

eval $(minikube docker-env)

BRANCH=$(git rev-parse --abbrev-ref HEAD)

docker build -t todo-demo:${BRANCH} .
