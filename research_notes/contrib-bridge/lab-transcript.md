# Lab transcript (run by Claude on 2026-11-11, Ubuntu 26.04, Python 3.14, colcon-core 0.21.3 from pip, NO ROS 2 installed)
Workspace: ws/src/two_link (files in lab/). The package is plain Python, so colcon needs no ROS 2 install to build and test it.

## 1. With the seeded bug (kinematics.py uses math.sin(t2) instead of math.sin(t1 + t2))
$ colcon build
Starting >>> two_link
Finished <<< two_link [0.36s]

Summary: 1 package finished [0.50s]
$ colcon test
Finished <<< two_link [0.26s]	[ with test failures ]

Summary: 1 package finished [0.42s]
  1 package had test failures: two_link
$ colcon test-result --all --verbose
build/two_link/pytest.xml: 2 tests, 0 errors, 1 failure, 0 skipped
- two_link.tests.test_kinematics test_elbow_bent
  <<< failure message
    assert 0.2 == 0.5 ± 5.0e-07
      
      comparison failed
      Obtained: 0.2
      Expected: 0.5 ± 5.0e-07
  >>>

Summary: 2 tests, 0 errors, 1 failure, 0 skipped

$ colcon test --packages-select two_link --pytest-args -k test_straight_arm
Finished <<< two_link [0.25s]

Summary: 1 package finished [0.42s]
$ colcon test-result --all
build/two_link/pytest.xml: 1 test, 0 errors, 0 failures, 0 skipped

Summary: 1 test, 0 errors, 0 failures, 0 skipped

## 2. After the one-line fix: y = l1 * math.sin(t1) + l2 * math.sin(t1 + t2)
$ colcon build
Finished <<< two_link [0.37s]

Summary: 1 package finished [0.50s]
$ colcon test
Finished <<< two_link [0.25s]

Summary: 1 package finished [0.41s]
$ colcon test-result --all --verbose
build/two_link/pytest.xml: 2 tests, 0 errors, 0 failures, 0 skipped

Summary: 2 tests, 0 errors, 0 failures, 0 skipped

## 3. Re-run from an empty folder with only the files the lesson lists (setup.py, two_link/__init__.py (empty), two_link/kinematics.py, tests/test_kinematics.py; no setup.cfg, no resource folder), pytest 9.2.0
Setup commands used:
$ python3 -m venv venv
$ . venv/bin/activate
$ pip install -U colcon-common-extensions pytest
$ mkdir -p ws/src
(package copied to ws/src/two_link, then cd ws)
Result: same output as parts 1 and 2. colcon creates build/, install/ and log/ in ws.
Try-it checks: test_straight_up (0.5, 0.3, 0, 90) expects x = 0.5, y = 0.3 and passes after the fix; breaking the x line to math.cos(t2) makes only test_elbow_bent fail (Obtained 4.898587196589413e-17, which is zero within rounding; Expected 0.3).
