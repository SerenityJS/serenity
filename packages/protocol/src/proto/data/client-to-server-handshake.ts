import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientToServerHandshake)
class ClientToServerHandshakePacket extends DataPacket {}

export { ClientToServerHandshakePacket };
