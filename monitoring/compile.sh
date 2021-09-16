#!/usr/bin/env bash

# Compiles the docker-compose-monitor.yml and prometheus.yml files

function generate_services_array_string()
{
    # USED FOR: prometheus.template.yml
    # expects:
    #   service name prefix as first param (eg 'node-exporter-', this is the prefix used in node-exporter.template.yml)
    #   port number as second param
    #   hosts array as third param (MUST be the last argument)
    # Generates a string in the form [host1:port host2:port]
    local prefix="$1"
    shift
    local port="$1"
    shift
    local arr=("$@")
    local string='['
    for host in "${arr[@]}" ; do
        string="$string'$prefix$host:$port',"
    done
    # remove the last space
    string_length=$((${#string}-1))
    string=${string:0:${string_length}}
    # add the ']'
    string="$string]"
    echo $string
}


# Get the hosts array
#hosts=`docker node ls | grep -v 'HOSTNAME' | awk '{ if ($2 == "*"){ print $3 } else { print $2 } }'`
mapfile -t hosts < <( docker node ls | grep -v 'HOSTNAME' | awk '{ if ($2 == "*"){ print $3 } else { print $2 } }' )
echo hosts: "${hosts[@]}"

# Avoid error 'name must be valid as a DNS name component'
mapfile -t hosts_cleaned < <( docker node ls | grep -v 'HOSTNAME' | awk '{ if ($2 == "*"){ print $3 } else { print $2 } }' | sed 's/\./-/g' )
echo hosts_cleaned: "${hosts_cleaned[@]}"

# generate cadvisor services
cadvisors=()
for i in "${!hosts[@]}" ; do
    echo "${hosts_cleaned[$i]}"
    tmp=$(sed 's/\$\$node-ip\$\$/'"${hosts[$i]}"'/g;s/\$\$nodename\$\$/'"${hosts_cleaned[$i]}"'/g' cadvisor.template.yml)
    cadvisors+=($'\n'"$tmp")
done

# generate node-exporters services
nodeexporters=()
for i in "${!hosts[@]}" ; do
    tmp=$(sed 's/\$\$node-ip\$\$/'"${hosts[$i]}"'/g;s/\$\$nodename\$\$/'"${hosts_cleaned[$i]}"'/g' node-exporter.template.yml )
    nodeexporters+=($'\n'"$tmp")
done

# read docker-compose.template.yml
compose_file=$(<docker-compose.template.yml)
# add cadvisor services
compose_file_out="${compose_file//#\$\$CADVISORS\$\$/${cadvisors[@]}}"
# add node-exporter services
compose_file_out="${compose_file_out//#\$\$NODE-EXPORTERS\$\$/${nodeexporters[@]}}"
echo "$compose_file_out" > docker-compose-monitoring.yml


# generate prometheus strings
# 'ne-' is the service name prefix used in node-exporter.template.yml
node_exporter_services=$(generate_services_array_string 'ne-' 9100 "${hosts_cleaned[@]}")
cadvisor_services=$(generate_services_array_string 'ca-' 8080 "${hosts_cleaned[@]}")
echo $node_exporter_services
echo $cadvisor_services

## read prometheus.template.yml
prometheus=$(<prometheus.template.yml)
# add node_exporter_services
prometheus_out="${prometheus//\$\$node-exporter-services\$\$/${node_exporter_services}}"
# add cadvisor_services
prometheus_out="${prometheus_out//\$\$cadvisor-services\$\$/${cadvisor_services}}"
echo "$prometheus_out" > prometheus.yml

exit