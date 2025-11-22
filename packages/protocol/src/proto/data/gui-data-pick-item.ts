import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.GuiDataPickItem)
class GuiDataPickItemPacket extends DataPacket {
  @Serialize(VarString) public itemName!: string;
  @Serialize(VarString) public itemEffectName!: string;
  @Serialize(VarInt) public slot!: number;
}

export { GuiDataPickItemPacket };
