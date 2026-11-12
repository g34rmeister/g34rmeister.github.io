import math


def forward(l1, l2, theta1_deg, theta2_deg):
    """Return (x, y) of the tip of a planar two-link arm. Angles in degrees."""
    t1 = math.radians(theta1_deg)
    t2 = math.radians(theta2_deg)
    x = l1 * math.cos(t1) + l2 * math.cos(t1 + t2)
    y = l1 * math.sin(t1) + l2 * math.sin(t2)
    return x, y
