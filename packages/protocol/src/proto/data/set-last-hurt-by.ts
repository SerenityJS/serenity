import { VarInt } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";

import { DataPacket } from "../..";
import { Packet } from "../../enums";

@Proto(Packet.SetLastHurtBy)
export class SetLastHurtByPacket extends DataPacket {
  @Serialize(VarInt) public lastHurtBy!: number;
}
