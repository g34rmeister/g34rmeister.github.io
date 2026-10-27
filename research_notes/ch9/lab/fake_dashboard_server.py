"""A stand-in for a UR robot's Dashboard Server. The robot has just had a
protective stop. Replies follow UR's Dashboard Server command table."""
import socket
import time

state = {
    "robotmode": "RUNNING",
    "safetystatus": "PROTECTIVE_STOP",
    "program": "STOPPED",
    "stop_time": time.time(),
}


def reply(cmd):
    if cmd == "robotmode":
        return "Robotmode: " + state["robotmode"]
    if cmd == "safetystatus":
        return "Safetystatus: " + state["safetystatus"]
    if cmd == "programState":
        return state["program"]
    if cmd == "running":
        return "Program running: " + ("true" if state["program"] == "PLAYING" else "false")
    if cmd == "close safety popup":
        return "closing safety popup"
    if cmd == "unlock protective stop":
        # A protective stop cannot be unlocked until 5 s after it happened
        if time.time() - state["stop_time"] < 5:
            return ("Cannot unlock protective stop until 5s after occurrence. "
                    "Always inspect cause of protective stop before unlocking")
        state["safetystatus"] = "NORMAL"
        return "Protective stop releasing"
    if cmd == "play":
        if state["safetystatus"] != "NORMAL":
            return "Failed to execute: play"
        state["program"] = "PLAYING"
        return "Starting program"
    if cmd.startswith("addToLog "):
        return "Added log message"
    if cmd == "quit":
        return "Disconnected"
    return "(this stand-in does not know that command)"


server = socket.create_server(("127.0.0.1", 29999))
print("Dashboard stand-in listening on port 29999 (Ctrl+C to stop)")
while True:
    conn, _ = server.accept()
    with conn, conn.makefile("rw", newline="\n") as f:
        f.write("Connected: Dashboard Server stand-in\n")  # welcome line
        f.flush()
        for line in f:
            answer = reply(line.strip())
            f.write(answer + "\n")
            f.flush()
            if answer == "Disconnected":
                break
