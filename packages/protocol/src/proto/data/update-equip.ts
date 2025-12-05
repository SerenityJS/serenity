import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, VarInt, ZigZong } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateEquip)
class UpdateEquipPacket extends DataPacket {
  @Serialize(Uint8) public containerId!: number;
  @Serialize(Uint8) public type!: number;
  @Serialize(VarInt) public size!: number;
  @Serialize(ZigZong) public actorUniqueId!: bigint;
  @Serialize(CompoundTag) public data!: CompoundTag;
}

export { UpdateEquipPacket };
