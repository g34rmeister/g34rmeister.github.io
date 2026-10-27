"""Recover from a protective stop the way UR's stop-recovery guide describes."""
import socket
import time

sock = socket.create_connection(("127.0.0.1", 29999), timeout=5)
f = sock.makefile("rw", newline="\n")
f.readline()  # skip the welcome line


def ask(command):
    f.write(command + "\n")
    f.flush()
    answer = f.readline().strip()
    print(f"> {command}\n  {answer}")
    return answer


# On a real cell, find and fix the cause of the stop before unlocking (see 9.2)
ask("safetystatus")
ask("close safety popup")
if ask("unlock protective stop") != "Protective stop releasing":
    time.sleep(5)  # the stop can only be unlocked 5 s after it happened
    ask("unlock protective stop")
ask("safetystatus")
ask("play")
ask("quit")
sock.close()
