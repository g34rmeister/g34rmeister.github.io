#!/bin/bash
# run a command inside the nav2 env
export ROS_DOMAIN_ID=77 ROS_LOCALHOST_ONLY=1
exec $HOME/.local/share/robosstics-lab/bin/micromamba -r $HOME/.local/share/robosstics-lab/root run -n ${NAV2_ENV:-nav2} "$@"
