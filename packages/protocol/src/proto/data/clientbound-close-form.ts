import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundCloseForm)
class ClientboundCloseFormPacket extends DataPacket {}

export { ClientboundCloseFormPacket };
