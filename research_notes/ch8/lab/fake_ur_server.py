"""A stand-in for a robot's Modbus TCP server: 256 holding registers, all zero."""
from pymodbus.datastore import ModbusDeviceContext, ModbusSequentialDataBlock, ModbusServerContext
from pymodbus.server import StartTcpServer

# Holding registers 0-255. pymodbus numbers its data blocks from 1, so a
# block starting at 1 serves protocol addresses 0-255 (the UR server also
# uses 0-based addresses). Registers 128-255 play the role
# of the UR's general-purpose registers.
holding = ModbusSequentialDataBlock(1, [0] * 256)
device = ModbusDeviceContext(hr=holding)
context = ModbusServerContext(devices=device, single=True)

print("Modbus server listening on port 5020 (Ctrl+C to stop)")
StartTcpServer(context=context, address=("127.0.0.1", 5020))
