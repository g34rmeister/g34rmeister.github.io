import pytest

from two_link.kinematics import forward


def test_straight_arm():
    x, y = forward(0.5, 0.3, 0, 0)
    assert x == pytest.approx(0.8)
    assert y == pytest.approx(0.0)


def test_elbow_bent():
    x, y = forward(0.5, 0.3, 90, -90)
    assert x == pytest.approx(0.3)
    assert y == pytest.approx(0.5)
