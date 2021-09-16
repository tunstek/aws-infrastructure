#!/usr/bin/env bash
# This file is to be ran on startup for each worker spot instance
# It's assumed that initial node setup has already been completed

SWARM_LEADER_IP=127.0.0.1

# Exponential Backoff
BACKOFF=1
BACKOFF_MAX=128

# check if the manager token is accessible on the leader
while ! redis-cli -a o3098hownjrw3hiubwRMNWb3uiw93m -h $SWARM_LEADER_IP get "swarm-worker-token"
do
    # Failure
    if (( $BACKOFF < $BACKOFF_MAX ))
    then
        BACKOFF=$(( BACKOFF * 2 ))
    fi
    currentDate=`date`
    echo "[$currentDate] Could not receive manager token from leader. Sleeping for $BACKOFF seconds.."
    sleep $BACKOFF
done
# save the manager token, removing quotes
WORKER_TOKEN=`redis-cli -a o3098hownjrw3hiubwRMNWb3uiw93m -h $SWARM_LEADER_IP get "swarm-worker-token" | sed 's/\"//g'`


# join the swarm
docker swarm join --token $WORKER_TOKEN $SWARM_LEADER_IP
