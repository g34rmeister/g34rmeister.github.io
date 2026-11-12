"""Send one navigation goal to Nav2 and print its progress.

Start Nav2 first (see the lesson). This script sends the robot back to
where it started, at x = -2.0, y = -0.5 on the tb3_sandbox map.
"""
from geometry_msgs.msg import PoseStamped
from nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult
import rclpy


def main():
    rclpy.init()
    navigator = BasicNavigator()

    # The loopback simulator has no AMCL. This value of localizer makes
    # waitUntilNav2Active() skip the localizer check and wait only for
    # bt_navigator.
    navigator.waitUntilNav2Active(localizer='robot_localization')

    goal = PoseStamped()
    goal.header.frame_id = 'map'
    goal.header.stamp = navigator.get_clock().now().to_msg()
    goal.pose.position.x = -2.0
    goal.pose.position.y = -0.5
    goal.pose.orientation.w = 1.0

    task = navigator.goToPose(goal)
    last_second = -1
    while not navigator.isTaskComplete(task=task):
        feedback = navigator.getFeedback(task=task)
        # Print once per second of navigation time, not on every loop.
        if feedback and feedback.navigation_time.sec != last_second:
            last_second = feedback.navigation_time.sec
            print('{:2d} s: {:.2f} m to go'.format(
                last_second, feedback.distance_remaining))

    result = navigator.getResult()
    if result == TaskResult.SUCCEEDED:
        print('Goal succeeded!')
    elif result == TaskResult.CANCELED:
        print('Goal was canceled!')
    elif result == TaskResult.FAILED:
        print('Goal failed!')

    navigator.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
