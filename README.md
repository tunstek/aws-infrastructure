
## Setup
- Create an AWS access policy (TODO: create list of open ports)
- Create 3 Elastic IPs in AWS (1 for leader and 2 for managers)
- Add the Leader Elastic IP as an A DNS entry in Route 53 hosted zone
- Spin up 3 instances
- Associate the IPs with an instances
- Ensure you can ssh into each machine with your .pem
- Add your .pem to ansible/
- Add IPs to ansible/hosts
- Add relevant info to ansible/group_vars/all
- Edit .env as required
- replace security details in auth/app/auth_functions.py (TODO: use .env)

## TODO
- Configure services deployed via .env
- Hide API test urls behind a .htpasswd
- Add influxDB for API access tracking
- Fix Jenkins Deployment (Slave connection issues)

Recommended to run 3 nodes (1 leader and 2 managers)



## Links
https://www.figma.com/file/entK0Sk5PdacaXFLJjTQCP/Landing-Page-Design

EXAMPLE TRAEFIK LETSENCRYPT AWS ACCESS POLICY
'''
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
'''

## Services
### Webservice
The webservice has two forms of deployment:
- Debug (Dockerfile) - allows hot reloading
- Production (Dockerfile.prod)


## Deployment
1) Edit `ansible/hosts`
2) Run `ansible-playbook deploy_cluster.yml`
- Initialises the cluster and the swarm-leader.
- Deploys the private docker registry and Traefik
3) Ensure user is present in /mnt/efs/traefik/auth/.htpasswd
- Default user: 'user'
4) Run `ansible-playbook deploy-jenkins-stack.yml`
- Builds and pushes `jenkins/` dockerfiles to the registry
- Deploys jenkins with `ansible/hosts/manager` as master and `ansible/hosts/managers` as slaves

Jenkins will then:
1) Automatically pull the latest master branch
2) See `Jenkins Testing & Deployment` below from 2) onwards


### Jenkins Testing & Deployment
For the testing, it makes sense run unit tests on each individual service. This will then also allow code coverage to be estimated.
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

#### Deployment
Deployment takes place over 3 AWS on-demand servers (all managers, 1 Jenkins master and 2 slaves) and an AWS Spot Fleet (all other workers).

##### Docker Registry
The docker registry exposes port 5000 on the swarm and is therefore available via `localhost:5000` outside of containers

Rebalance a service across all nodes
`docker service update --force <servicename>`


## Service Routing

| Service       | Ports                     | Network  | Traefik |
| :-----------: | :-----------------------: | :-------:| :---: |
| traefik       | 80:80, 8080:8080, 433:433 | proxy | - |
| webservice    | 5000:5000                 | proxy, auth, services | localhost |
| public_api    | 5001:80                   | proxy, auth, services | api.localhost |
| auth          | 5005:80                   | proxy, auth | - |
| redis         | 6379:6379                 | auth | - |
| newswatcher   | 5001:80                   | services | - |
| ml            | 5003:80                   | services | - |
| couchdb       | 5984:5984                 | services | - |
| cp_api        | 5002:5000                 | services | - |
| cp_api_tickle | -                         | services | - |


## Notes
#### Squid
Looked into using Squid as a caching proxy for Newswatcher but the limited
number of hits just makes it unnecessary. Was using it with SSLBump but
even still was not really worth it. Perhaps it's something to return to
but changing how the frontend renders would be a better option, performance
wise, at least for now.
#### Couchbase
Tried running Couchbase but seemed very heavy on CPU usage even when idle


## Docs
* [Architecture Diagram](https://www.draw.io/#G19WiOu5iuHFkxGLIrx_VL9KFxu7vv7LRO)
* [Login Token Sequence Diagram](https://www.draw.io/#G1M99GkqlApCWhzHSogWWaD86JwQBS6Sxc)
* [Frontend Request Sequence Diagram](https://www.draw.io/#G1k5xzzcJwcICtyH0tLc5-yLTa2VDskGCC)
* [API Token Sequence Diagram](https://www.draw.io/#G1YtAUbS6aQ6bzVLZxVPa3bsBn5pqaD1jU)


* [Deployment Architecture](https://www.draw.io/#G1VraMgeGc7PFQWTPZQDN_B9UgEcb0nnxR)
* [Spot Instance Join Sequence Diagram]()
