from honcho.manager import Manager


class ProcessManager(Manager):
    def terminate(self):
        pass

    def kill(self):
        pass

    def loop(self):
        super().loop()
        import sys

        sys.exit(self.returncode)
