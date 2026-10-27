import { ZigZag, ZigZong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.HurtArmor)
class HurtArmorPacket extends DataPacket {
  @Serialize(ZigZag) public cause!: number;
  @Serialize(ZigZag) public damage!: number;
  @Serialize(ZigZong) public slots!: number;
}

export { HurtArmorPacket };
