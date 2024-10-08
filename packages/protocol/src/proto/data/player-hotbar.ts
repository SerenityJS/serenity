import { Int8, VarInt, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerHotbar)
class PlayerHotbarPacket extends DataPacket {
  @Serialize(VarInt) public selectedSlot!: number;
  @Serialize(Int8) public windowId!: number;
  @Serialize(Bool) public selectSlot!: boolean;
}

export { PlayerHotbarPacket };
