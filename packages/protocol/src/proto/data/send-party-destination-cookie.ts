import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SendPartyDestinationCookie)
class SendPartyDestinationCookiePacket extends DataPacket {
  @Serialize(VarString) public cookie!: string;
  @Serialize(VarString) public intent!: string;
  @Serialize(VarString) public destinationName!: string;
}

export { SendPartyDestinationCookiePacket };
