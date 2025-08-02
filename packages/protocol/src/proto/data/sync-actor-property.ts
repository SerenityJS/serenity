import { CompoundTag } from "@serenityjs/nbt";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SyncActorProperty)
class SyncActorPropertyPacket extends DataPacket {
  @Serialize(CompoundTag, { varint: true }) public properties!: CompoundTag;
}

export { SyncActorPropertyPacket };
