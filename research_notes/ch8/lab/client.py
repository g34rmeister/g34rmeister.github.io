"""Write and read general-purpose registers on a Modbus TCP server."""
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient("127.0.0.1", port=5020)  # use port 502 for a real robot
client.connect()

# Write one register (function code 0x06), then several (0x10)
client.write_register(128, 1)
client.write_registers(129, [250, 7])

# Read them back (function code 0x03)
rr = client.read_holding_registers(128, count=3)
if rr.isError():
    print("Server returned an error:", rr)
else:
    print("Registers 128-130:", rr.registers)

client.close()
