class Counter:
    """A class bundles data (self.count) with the functions that use it."""

    def __init__(self, name):
        self.name = name
        self.count = 0

    def on_tick(self):
        # A callback: we do not call this ourselves. We hand it to
        # something else (here, run_timer) that calls it for us later.
        self.count += 1
        print(f'{self.name}: tick {self.count}')


def run_timer(callback, times):
    """Stands in for a ROS 2 timer: it calls the function it was given."""
    for _ in range(times):
        callback()


counter = Counter('demo')
run_timer(counter.on_tick, 3)   # note: no () after on_tick
print('final count:', counter.count)
