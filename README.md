# AWS Infrastructure Deployment
AWS Docker Swarm deployment over Spot Fleet made easy!


Services include:
* Traefik Reverse Proxy + LetsEncrypt
* Swarm Monitoring via Prometheus and Grafana
* Example Frontend With Login Page
* Example Backend API
* Jenkins Deployment


This project is the remnants of a financial services API I was working on some time ago (theoperator.io). The idea was very similar to that of alphavantage.co. theoperator.io has been abandoned for some time but I've recently started working on a new project and decided to not let the work here go to waste.


## Setup
- Create an AWS access policy (See below for example)
- Create an AWS EC2 Security Group (See below for example)
- Create 3 Elastic IPs in AWS (1 for leader and 2 for managers)
- Add the Leader Elastic IP as an A DNS entry in Route 53 hosted zone
- Spin up 3 instances
- Associate the IPs with the instances
- Ensure you can ssh into each machine with your .pem
- Add your .pem to ansible/
- Add IPs to ansible/hosts
- Add relevant info to ansible/group_vars/all
- Edit .env as required
- Run `ansible-playbook ansible/deploy_cluster.yml`
- Configure Jenkins as required ( + add docker registry credentials)
- See ```ansible/``` for other scripts to run

## TODO
- Fix Frontend Example
- Fix Backend API Example
- Fix Jenkins Deployment (Slave connection issues)
- Configure services deployed via .env
- Hide API test urls behind a .htpasswd
- Add influxDB for API access tracking
- Replace security details in auth/app/auth_functions.py (TODO: use .env)
- webservice deployment on Jenkins


It's recommended to run 3 nodes (1 leader and 2 managers), especially for a Jenkins deployment but it's not entirely necessary

Rebalance a service across all nodes using:
`docker service update --force <servicename>`

## Example EC2 Security Group
| Port      | Protocol | Description |
| --------- | -------- | ----------- |
| 80        | TCP      | HTTP Access |
| 443       | TCP      | HTTPS Access|
| 8080      | TCP      | Traefik Load Balancer Port |
| 9090      | TCP      | Prometheus Port |
| 2377      | TCP      | Docker Swarm Join Port |
| 50000     | TCP      | Jenkins Agent Listener |
| 7946      | TCP      | Docker Coms |
| 7946      | UDP      | Docker Coms |
| 4789      | UDP      | Docker Swarm Overlay |
| 22        | TCP      | SSH





## Example Traefik LetsEncrypt AWS Access Policy
```
{
   "Version": "2012-10-17",
   "Statement": [
       {
           "Sid": "",
           "Effect": "Allow",
           "Action": [
               "route53:GetChange",
               "route53:ChangeResourceRecordSets",
               "route53:ListResourceRecordSets"
           ],
           "Resource": [
               "arn:aws:route53:::hostedzone/*",
               "arn:aws:route53:::change/*"
           ]
       },
       {
           "Sid": "",
           "Effect": "Allow",
           "Action": "route53:ListHostedZonesByName",
           "Resource": "*"
       }
   ]
}
```



### Spot Fleet + Discovery
The main deployment happens over an AWS Spot Fleet. Our 'swarm-leader' in Ansible has an AWS Elastic IP attached and is a Free Tier AWS instance. This swarm leader is running a private redis container that exposes the redis port publicly (password protected). This allows spot instances that come up to ping the swarm leader and receive either a worker token or a manager token.

Due to using a Spot Fleet in this configuration, an AMI need to be created in order to run the correct swarm join script at startup:
- Worker Node AMI

NOTE: Jenkins nodes (as managers) had previously been considered for spot fleet deployment, but after thinking about it. All managers should be on-demand instances. I don't want AWS coming along and pulling 2 of my 3 managers at the same time (very possible). This would bring down the whole cluster.

#### AMI Creation
1) Manually SSH into a fresh machine
2) `sudo yum install -y python3`
3) On Ansible host `ansible-playbook ami_worker.yml`
4) Create image from machine using the AWS console



### Jenkins Testing & Deployment
For the testing, it makes sense run unit tests on each individual service you run. This will then also allow code coverage to be estimated.
The challenge here will be to merge all the tests at the end.

Jenkins will:
1) See a git push and clone the repo.
2) Build necessary images.
3) Push newly built images to the docker registry
4) Deploy a 'test' stack on the swarm.
5) Send a GET request to each microservice /test endpoint (this means that Jenkins needs access to each service)
6) The /test endpoint will return the output of the tests including a coverage estimation
7) Jenkins merges all these results together and delivers the result.
8) Jenkins removes the 'test' stack from the swarm
9) If all tests passed, run:

 `ansible-playbook deploy-stack.yml`

 `ansible-playbook deploy-monitoring-stack.yml`

NOTE: In order for builds to be independant, we need to deploy separate TEST stacks for each build.


### Docker Registry
The docker registry exposes port 5000 on the swarm and is therefore available via `localhost:5000` outside of containers


## Service Routing

| Service       | Ports                     | Network  | Traefik |
| :-----------: | :-----------------------: | :-------:| :---: |
| traefik       | 80:80, 8080:8080, 433:433 | proxy | - |
| webservice    | 5000:5000                 | proxy, auth, services | localhost |
| public_api    | 5001:80                   | proxy, auth, services | api.localhost |
| auth          | 5005:80                   | proxy, auth | - |
| redis         | 6379:6379                 | auth | - |
| newswatcher   | 5001:80                   | services | - |
| couchdb       | 5984:5984                 | services | - |



## Notes
#### Couchbase
Tried running Couchbase but seemed very heavy on CPU usage even when idle
