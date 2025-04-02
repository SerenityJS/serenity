import { DataPacket } from "./data";

function serialize(packet: DataPacket): Buffer {
  packet.serialize();
}
