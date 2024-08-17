import { DataPacket } from "./data-packet";

import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

@Proto(Packet.ClientToServerHandshake)
class ClientToServerHandshakePacket extends DataPacket { }

export { ClientToServerHandshakePacket }