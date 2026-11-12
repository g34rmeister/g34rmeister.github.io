# Install transcript (run by Claude on 2026-11-11, Ubuntu 26.04.1 LTS, no sudo)
Environment folder: ~/robosstics-lab (shown as ~ below; the real run used ~/.local/share/robosstics-lab, which already held micromamba from the first install).

$ curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xvj bin/micromamba
(already done in the first install; prints bin/micromamba)
$ export MAMBA_ROOT_PREFIX=~/robosstics-lab/root
$ eval "$(./bin/micromamba shell hook -s bash)"
$ micromamba create -y -n nav2 -c conda-forge -c robostack-lyrical ros-lyrical-ros-base ros-lyrical-nav2-bringup ros-lyrical-nav2-loopback-sim ros-lyrical-nav2-simple-commander ros-lyrical-nav2-minimal-tb3-sim
exit 0 after 11 s
$ micromamba activate nav2
$ echo $ROS_DISTRO
lyrical
$ ros2 pkg list | grep -c nav2
36
