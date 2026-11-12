from setuptools import find_packages, setup

setup(
    name='two_link',
    version='0.0.1',
    packages=find_packages(exclude=['tests']),
    install_requires=['setuptools'],
    extras_require={
        'test': ['pytest'],
    },
)
