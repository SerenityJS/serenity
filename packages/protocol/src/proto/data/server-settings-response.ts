import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerSettingsResponse)
class ServerSettingsResponsePacket extends DataPacket {
  @Serialize(VarInt) public formId!: number;
  @Serialize(VarString) public payload!: string;
}

export { ServerSettingsResponsePacket };
