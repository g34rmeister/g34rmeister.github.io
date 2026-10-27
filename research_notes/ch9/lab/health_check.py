"""Ask a Dashboard Server for the robot's state, like a technician's first look."""
import socket

ROBOT_IP = "127.0.0.1"  # use the robot's IP address on a real cell

sock = socket.create_connection((ROBOT_IP, 29999), timeout=5)
f = sock.makefile("rw", newline="\n")
print("Welcome:", f.readline().strip())  # the server greets first


def ask(command):
    f.write(command + "\n")  # every command ends with a newline
    f.flush()
    return f.readline().strip()


print(ask("robotmode"))
print(ask("safetystatus"))
print("Program state:", ask("programState"))
print(ask("quit"))
sock.close()
