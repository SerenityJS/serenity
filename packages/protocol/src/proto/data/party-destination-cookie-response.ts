import { Bool, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PartyDestinationCookieResponse)
class PartyDestinationCookieResponsePacket extends DataPacket {
  @Serialize(VarString) public cookie!: string;
  @Serialize(Bool) public accepted!: boolean;
}

export { PartyDestinationCookieResponsePacket };
