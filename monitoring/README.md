## Monitoring

When the monitoring stack is first deployed, add a prometheus datasource and specify:
- `prometheus:9090` as the url
- Enable `basic auth`
- Enter default .htpasswd credentials

Then optionally add the swarm_dashboard.json Dashboard.



This directory defines the monitoring stack.

There are a number of `.template.yml` files defined here. These files are not complete and the proper `.yml` files need to be dynamically compiled for each cluster deployment via:
```
sh compile.sh
```

This script will then replace the `$$VAR$$`'s defined in the templates. This is required because services need to be ran on each specific node in order to extract the monitoring data, and we don't know what nodes are in the cluster until the cluster has been spun up. The other option is to hard code these values.

This monitoring stack is built with Ansible in mind, once we have deployed the cluster we can then run `compile.sh` on a manager node and then deploy the `docker-compose-monitoring.yml` stack.
