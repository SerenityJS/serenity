import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerSettingsRequest)
class ServerSettingsRequestPacket extends DataPacket {}

export { ServerSettingsRequestPacket };
