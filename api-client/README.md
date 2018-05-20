# ToDo API client

This is a utility script to simulate requests to the ToDo API.
It will perform a variety of GET, POST, and DELETE requests to
different endpoints.

It takes a single argument, which is the URL of the ToDo API.
This URL can be obtained using `minikube service` as shown below.

It is recommended that you use a [virtualenv](https://docs.python.org/3/tutorial/venv.html)
to run this application:

```
python3 -m venv client
source client/bin/activate
pip install -r requirements.txt

python client.py $(minikube service demo-prom-demo --url)
```
